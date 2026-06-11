import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { z } from "zod";

const CreateCustomerSchema = z.object({
  customerCode: z.string().min(1, "客户编码不能为空"),
  name: z.string().min(1, "客户名称不能为空"),
  shortName: z.string().optional(),
  country: z.string().optional().default("中国"),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const keyword = searchParams.get("keyword") || "";

  const where: Record<string, unknown> = { active: true };
  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { customerCode: { contains: keyword } },
      { shortName: { contains: keyword } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
      include: { _count: { select: { orders: true } } },
    }),
    prisma.customer.count({ where }),
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
  const parsed = CreateCustomerSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message);

  const existing = await prisma.customer.findUnique({
    where: { customerCode: parsed.data.customerCode },
  });
  if (existing) return apiError(`客户编码 ${parsed.data.customerCode} 已存在`);

  const customer = await prisma.customer.create({ data: parsed.data });
  return apiSuccess(customer, "客户创建成功");
}
