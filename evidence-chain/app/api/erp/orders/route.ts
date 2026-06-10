import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { z } from "zod";

// ============================================
// 鼎捷 T100 ERP 服务端集成接口（订单同步）
//
// 与浏览器端不同，ERP 后台调用无法走 NextAuth 会话，
// 改用 X-API-Key 请求头鉴权（密钥配置在 ERP_API_KEY 环境变量）。
//
// 用法（ERP 在订单建立/状态变更时调用）：
//   POST /api/erp/orders
//   Header:  X-API-Key: <ERP_API_KEY>
//   Body: { orderNo, customerCode, customerName, orderDate, amount?, status, remark? }
//
// 行为：客户不存在时自动建档；订单已存在时更新状态/金额（upsert）。
// ============================================

const ErpOrderSchema = z.object({
  orderNo: z.string().min(1, "orderNo 不能为空"),
  customerCode: z.string().min(1, "customerCode 不能为空"),
  customerName: z.string().min(1, "customerName 不能为空"),
  orderDate: z.string().min(1, "orderDate 不能为空"),
  amount: z.number().optional(),
  currency: z.string().optional().default("CNY"),
  status: z.string().min(1, "status 不能为空"),
  remark: z.string().optional(),
});

function checkApiKey(request: NextRequest): boolean {
  const configured = process.env.ERP_API_KEY;
  if (!configured) return false; // 未配置密钥时接口关闭
  const provided = request.headers.get("x-api-key");
  return provided === configured;
}

export async function POST(request: NextRequest) {
  if (!checkApiKey(request)) {
    return apiError("API Key 无效或未配置", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("请求体必须为 JSON");
  }

  const parsed = ErpOrderSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message);

  const { orderNo, customerCode, customerName, orderDate, amount, currency, status, remark } =
    parsed.data;

  // 客户不存在时自动建档（以 ERP 客户编码为准）
  const customer = await prisma.customer.upsert({
    where: { customerCode },
    update: { name: customerName },
    create: { customerCode, name: customerName, active: true },
  });

  // 订单 upsert：已存在则同步最新状态
  const order = await prisma.order.upsert({
    where: { orderNo },
    update: {
      status,
      amount: amount ?? undefined,
      remark: remark ?? undefined,
    },
    create: {
      orderNo,
      customerId: customer.id,
      orderDate: new Date(orderDate),
      amount,
      currency,
      status,
      remark,
    },
    include: {
      customer: { select: { customerCode: true, name: true } },
    },
  });

  return apiSuccess(order, "订单同步成功");
}

// ERP 查询某订单的文档清单（可在 ERP 界面显示「已归档 N 份文档」）
//   GET /api/erp/orders?orderNo=SO-2026-001
//   Header:  X-API-Key: <ERP_API_KEY>
export async function GET(request: NextRequest) {
  if (!checkApiKey(request)) {
    return apiError("API Key 无效或未配置", 401);
  }

  const orderNo = new URL(request.url).searchParams.get("orderNo");
  if (!orderNo) return apiError("缺少 orderNo 参数");

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { customer: { select: { customerCode: true, name: true } } },
  });
  if (!order) return apiError("订单不存在", 404);

  const links = await prisma.documentLink.findMany({
    where: { bizType: "ORDER", bizNo: orderNo },
    include: {
      document: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          size: true,
          sha256: true,
          version: true,
          uploadedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess({
    order,
    documentCount: links.length,
    documents: links.map((l) => l.document),
  });
}
