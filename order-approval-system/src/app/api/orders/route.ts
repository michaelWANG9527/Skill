import { NextResponse } from "next/server";
import { fetchOrders } from "@/lib/erp";

export const dynamic = "force-dynamic";

/** GET /api/orders — 从鼎捷 T100 拉取订单（未配置 ERP 时返回演示数据） */
export async function GET() {
  try {
    const { orders, source } = await fetchOrders();
    return NextResponse.json({ ok: true, source, orders });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "ERP 查询失败" },
      { status: 502 }
    );
  }
}
