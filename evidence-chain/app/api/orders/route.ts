import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { z } from "zod";

const CreateOrderSchema = z.object({
  orderNo: z.string().min(1, "订单号不能为空"),
  customerId: z.string().min(1, "请选择客户"),
  orderDate: z.string(),
  amount: z.number().optional(),
  currency: z.string().optional().default("CNY"),
  status: z.string().default("待确认"),
  remark: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const keyword = searchParams.get("keyword") || "";
  const customerId = searchParams.get("customerId") || "";
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (keyword) {
    where.OR = [
      { orderNo: { contains: keyword, mode: "insensitive" } },
      { customer: { name: { contains: keyword, mode: "insensitive" } } },
      { remark: { contains: keyword, mode: "insensitive" } },
    ];
  }
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { orderDate: "desc" },
      include: {
        customer: { select: { id: true, name: true, customerCode: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return apiSuccess({ items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  if (!["ADMIN", "SALES"].includes(session.user.role)) {
    return apiError("无创建权限", 403);
  }

  const body = await request.json();
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message);
  }

  const { orderNo, customerId, orderDate, amount, currency, status, remark } =
    parsed.data;

  const existing = await prisma.order.findUnique({ where: { orderNo } });
  if (existing) return apiError(`订单号 ${orderNo} 已存在`);

  const order = await prisma.order.create({
    data: {
      orderNo,
      customerId,
      orderDate: new Date(orderDate),
      amount,
      currency,
      status,
      remark,
    },
    include: {
      customer: { select: { id: true, name: true, customerCode: true } },
    },
  });

  return apiSuccess(order, "订单创建成功");
}
