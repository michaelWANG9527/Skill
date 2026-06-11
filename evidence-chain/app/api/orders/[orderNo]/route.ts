import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderNo: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  const order = await prisma.order.findUnique({
    where: { orderNo: params.orderNo },
    include: {
      customer: true,
    },
  });

  if (!order) return apiError("订单不存在", 404);

  // 查询所有关联到该订单的文档
  const links = await prisma.documentLink.findMany({
    where: { bizType: "ORDER", bizNo: params.orderNo },
    include: {
      document: {
        include: {
          uploadedBy: { select: { fullName: true, department: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess({ order, documents: links.map((l) => l.document) });
}
