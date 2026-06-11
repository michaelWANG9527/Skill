import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { calculateSHA256, generateStorageKey, apiSuccess, apiError, BIZ_TYPES } from "@/lib/utils";
import { writeAuditLog, getClientIp } from "@/lib/audit";
import { z } from "zod";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "52428800"); // 50MB

const LinkSchema = z.object({
  bizType: z.enum(BIZ_TYPES),
  bizId: z.string().min(1),
  bizNo: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError("请先登录", 401);
  }

  // 只有 ADMIN、SALES、CS 可以上传
  const allowedRoles = ["ADMIN", "SALES", "CS", "FINANCE", "LEGAL"];
  if (!allowedRoles.includes(session.user.role)) {
    return apiError("无上传权限", 403);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError("请求格式错误");
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return apiError("未找到文件");
  }

  if (file.size > MAX_FILE_SIZE) {
    return apiError(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!allowedMimeTypes.includes(file.type)) {
    return apiError("不支持该文件类型，仅支持 PDF、Word、Excel、图片");
  }

  const description = formData.get("description") as string | null;
  const linksRaw = formData.get("links") as string | null;
  const parentId = formData.get("parentId") as string | null;

  let links: z.infer<typeof LinkSchema>[] = [];
  if (linksRaw) {
    try {
      const parsed = JSON.parse(linksRaw);
      links = z.array(LinkSchema).parse(parsed);
    } catch {
      return apiError("关联信息格式错误");
    }
  }

  // 读取文件并计算 SHA-256
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = calculateSHA256(buffer);

  // 检查是否已有相同哈希的文件（防止重复上传）
  const existing = await prisma.document.findFirst({ where: { sha256 } });
  if (existing && !parentId) {
    return apiError(`文件已存在（SHA-256 重复），文档ID: ${existing.id}`);
  }

  const storageKey = generateStorageKey(session.user.role, file.name);

  try {
    await uploadFile(storageKey, buffer, file.type, file.size);
  } catch (err) {
    console.error("[Upload] MinIO 上传失败:", err);
    return apiError("文件上传失败，请稍后重试", 500);
  }

  // 确定版本号
  let version = 1;
  if (parentId) {
    const parent = await prisma.document.findUnique({ where: { id: parentId } });
    if (parent) version = parent.version + 1;
  }

  const ip = getClientIp(request);

  const document = await prisma.document.create({
    data: {
      filename: storageKey.split("/").pop()!,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      sha256,
      storageKey,
      uploadedById: session.user.id,
      uploadedFromIp: ip,
      description: description || null,
      version,
      parentId: parentId || null,
      links: links.length > 0 ? {
        create: links.map((l) => ({
          bizType: l.bizType,
          bizId: l.bizId,
          bizNo: l.bizNo,
        })),
      } : undefined,
    },
    include: {
      links: true,
      uploadedBy: { select: { fullName: true, department: true } },
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "UPLOAD",
    targetType: "DOCUMENT",
    targetId: document.id,
    documentId: document.id,
    ip,
    userAgent: request.headers.get("user-agent") || undefined,
    metadata: {
      filename: file.name,
      size: file.size,
      sha256,
      links: links.map((l) => l.bizNo),
    },
  });

  return apiSuccess(document, "文件上传成功");
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError("请先登录", 401);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const keyword = searchParams.get("keyword") || "";
  const bizType = searchParams.get("bizType") || "";
  const bizNo = searchParams.get("bizNo") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const where: Record<string, unknown> = {};

  if (keyword) {
    where.OR = [
      { originalName: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  if (bizType || bizNo) {
    where.links = {
      some: {
        ...(bizType ? { bizType } : {}),
        ...(bizNo ? { bizNo: { contains: bizNo } } : {}),
      },
    };
  }

  if (dateFrom || dateTo) {
    where.uploadedAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { uploadedAt: "desc" },
      include: {
        uploadedBy: { select: { fullName: true, department: true } },
        links: true,
      },
    }),
    prisma.document.count({ where }),
  ]);

  return apiSuccess({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
