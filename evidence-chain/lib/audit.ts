import { prisma } from "./prisma";

interface AuditParams {
  userId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  documentId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// 写入审计日志（append-only，不可删除修改）
export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        documentId: params.documentId,
        ip: params.ip,
        userAgent: params.userAgent,
        metadata: (params.metadata ?? {}) as Record<string, string | number | boolean | null>,
      },
    });
  } catch (error) {
    // 审计日志写入失败不影响主流程，但必须记录错误
    console.error("[AuditLog] 写入失败:", error);
  }
}

// 从 Request 中提取 IP
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
