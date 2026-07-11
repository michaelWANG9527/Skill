import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, ApprovalRecord } from "@/types";
import { writebackApproval } from "@/lib/erp";

export const dynamic = "force-dynamic";

interface ApprovalRequestBody {
  decision: "approve" | "reject";
  currentStatus: OrderStatus;
  isSpecialPrice: boolean;
  grossMargin: number;
  record: ApprovalRecord;
  emails?: string[];
}

/**
 * 审批状态机（唯一权威的流转逻辑，前端不再自行计算）：
 *   pending  + approve → 特价或毛利<15% ? escalated : vp_approved
 *   escalated + approve → gm_approved（总经理终审）
 *   任意待审状态 + reject → rejected
 */
function nextStatusOf(body: ApprovalRequestBody): OrderStatus | null {
  const { decision, currentStatus, isSpecialPrice, grossMargin } = body;
  if (currentStatus !== "pending" && currentStatus !== "escalated") return null;
  if (decision === "reject") return "rejected";
  if (currentStatus === "escalated") return "gm_approved";
  return isSpecialPrice || grossMargin < 15 ? "escalated" : "vp_approved";
}

/** POST /api/orders/[id]/approval — 提交审批决定并回写鼎捷 T100 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: ApprovalRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体不是合法 JSON" }, { status: 400 });
  }

  if (body.decision !== "approve" && body.decision !== "reject") {
    return NextResponse.json({ ok: false, error: "decision 必须为 approve 或 reject" }, { status: 400 });
  }
  if (!body.record?.user || !body.record?.time) {
    return NextResponse.json({ ok: false, error: "缺少审批记录信息" }, { status: 400 });
  }

  const nextStatus = nextStatusOf(body);
  if (!nextStatus) {
    return NextResponse.json(
      { ok: false, error: `订单当前状态 ${body.currentStatus} 不可审批` },
      { status: 409 }
    );
  }

  try {
    const { source } = await writebackApproval({
      orderId: params.id,
      nextStatus,
      record: body.record,
    });
    // TODO: 审批邮件通知（body.emails）待邮件服务接入后实现
    return NextResponse.json({ ok: true, source, nextStatus });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "ERP 回写失败" },
      { status: 502 }
    );
  }
}
