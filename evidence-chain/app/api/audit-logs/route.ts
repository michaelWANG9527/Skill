import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  if (!["ADMIN", "AUDITOR"].includes(session.user.role)) {
    return apiError("无查看审计日志权限", 403);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "30");
  const userId = searchParams.get("userId") || "";
  const action = searchParams.get("action") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (dateFrom || dateTo) {
    where.timestamp = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { timestamp: "desc" },
      include: {
        user: { select: { fullName: true, department: true, username: true } },
        document: { select: { originalName: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}
