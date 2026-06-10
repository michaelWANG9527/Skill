import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFileStream } from "@/lib/storage";
import { apiError } from "@/lib/utils";
import { writeAuditLog, getClientIp } from "@/lib/audit";
import { Readable } from "stream";

// 在线预览（内联显示，不触发下载）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  const document = await prisma.document.findUnique({
    where: { id: params.id },
  });

  if (!document) return apiError("文档不存在", 404);

  await writeAuditLog({
    userId: session.user.id,
    action: "VIEW",
    targetType: "DOCUMENT",
    targetId: document.id,
    documentId: document.id,
    ip: getClientIp(request),
    metadata: { filename: document.originalName, action: "preview" },
  });

  try {
    const stream = await getFileStream(document.storageKey);

    const webStream = new ReadableStream({
      start(controller) {
        (stream as Readable).on("data", (chunk) => controller.enqueue(chunk));
        (stream as Readable).on("end", () => controller.close());
        (stream as Readable).on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
        "Content-Length": document.size.toString(),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return apiError("文件获取失败", 500);
  }
}
