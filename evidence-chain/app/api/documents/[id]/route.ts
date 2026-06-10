import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";
import { apiSuccess, apiError } from "@/lib/utils";
import { writeAuditLog, getClientIp } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      uploadedBy: { select: { id: true, fullName: true, department: true } },
      links: true,
      versions: {
        orderBy: { version: "desc" },
        select: { id: true, version: true, uploadedAt: true, originalName: true },
      },
      parent: {
        select: { id: true, version: true, originalName: true },
      },
      auditLogs: {
        take: 20,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { fullName: true } } },
      },
    },
  });

  if (!document) return apiError("文档不存在", 404);

  await writeAuditLog({
    userId: session.user.id,
    action: "VIEW",
    targetType: "DOCUMENT",
    targetId: document.id,
    documentId: document.id,
    ip: getClientIp(request),
    metadata: { filename: document.originalName },
  });

  return apiSuccess(document);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  if (!["ADMIN", "SALES"].includes(session.user.role)) {
    return apiError("无删除权限", 403);
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
  });

  if (!document) return apiError("文档不存在", 404);

  // 仅管理员可删除他人文件
  if (
    session.user.role !== "ADMIN" &&
    document.uploadedById !== session.user.id
  ) {
    return apiError("无权删除他人文档", 403);
  }

  try {
    await deleteFile(document.storageKey);
  } catch (err) {
    console.error("[Delete] MinIO 删除失败:", err);
  }

  await prisma.document.delete({ where: { id: params.id } });

  await writeAuditLog({
    userId: session.user.id,
    action: "DELETE",
    targetType: "DOCUMENT",
    targetId: params.id,
    ip: getClientIp(request),
    metadata: {
      filename: document.originalName,
      sha256: document.sha256,
    },
  });

  return apiSuccess(null, "文档已删除");
}
