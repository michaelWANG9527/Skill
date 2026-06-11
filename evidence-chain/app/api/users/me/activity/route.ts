import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

// 查询本人最近操作记录（任何登录用户可查自己的）
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  const { searchParams } = new URL(request.url);
  const take = Math.min(parseInt(searchParams.get("take") || "50"), 200);

  const logs = await prisma.auditLog.findMany({
    where: { userId: session.user.id },
    take,
    orderBy: { timestamp: "desc" },
    select: {
      id: true,
      action: true,
      targetType: true,
      ip: true,
      timestamp: true,
      document: { select: { originalName: true } },
    },
  });

  return apiSuccess(logs);
}
