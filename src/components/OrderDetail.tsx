"use client";

import { useState } from "react";
import Badge from "./Badge";
import type { OrderData } from "./OrderList";

interface OrderDetailProps {
  order: OrderData;
  userRole: string;
  onAction: (action: "approve" | "reject", comment: string) => void;
}

export default function OrderDetail({ order, userRole, onAction }: OrderDetailProps) {
  const [comment, setComment] = useState("");

  const currencySymbol = order.currency === "USD" ? "$" : "¥";

  const canApprove =
    (userRole === "SALES_VP" && order.status === "PENDING") ||
    ((userRole === "GM" || userRole === "RD_VP") && order.status === "ESCALATED");

  const needsEscalation = order.isSpecialPrice || order.grossMargin < 15;

  const infoItems = [
    { label: "料号", value: order.partNumber },
    { label: "数量", value: order.quantity.toLocaleString() + " pcs" },
    { label: "单价", value: currencySymbol + order.unitPrice.toFixed(4) },
    { label: "总金额", value: currencySymbol + order.totalAmount.toLocaleString() },
    { label: "毛利率", value: order.grossMargin + "%", warn: order.grossMargin < 15 },
    { label: "销售负责人", value: order.salesRep },
  ];

  const handleAction = (action: "approve" | "reject") => {
    onAction(action, comment);
    setComment("");
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="glass-card rounded-2xl p-5 md:p-7">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl md:text-[22px] font-semibold text-gray-900">
              {order.customer}
            </h2>
            <p className="text-[13px] text-gray-400 mt-1">
              ERP 单号: {order.erpOrderNo} · 同步于{" "}
              {new Date(order.syncedAt).toLocaleString("zh-CN")}
            </p>
          </div>
          <Badge status={order.status} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-px bg-black/[0.04] rounded-2xl overflow-hidden mb-6">
          {infoItems.map((item, i) => (
            <div key={i} className="p-3.5 md:p-4 bg-white/90">
              <div className="text-xs text-gray-400 mb-1">{item.label}</div>
              <div
                className={`text-base font-semibold tabular-nums ${
                  item.warn ? "text-red-500" : "text-gray-900"
                }`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Risk Alerts */}
        {needsEscalation && (
          <div className="p-3.5 md:p-4 rounded-xl bg-orange-50 border border-orange-200 mb-6 text-[13px] text-orange-800 leading-relaxed">
            <span className="font-semibold">⚠ 风险提示：</span>
            {order.isSpecialPrice &&
              " 该订单包含特殊价格，审批通过后将自动上报总经理终审。"}
            {order.grossMargin < 15 &&
              ` 毛利率 ${order.grossMargin}% 低于标准阈值 (15%)，需上级复核。`}
          </div>
        )}

        {/* Approval History */}
        {order.logs && order.logs.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">
              审批记录
            </div>
            <div className="space-y-2">
              {order.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 text-[13px] text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5"
                >
                  <span className="font-medium text-gray-700">
                    {log.user.displayName}
                  </span>
                  <span>
                    {log.action === "APPROVE" && "审批通过"}
                    {log.action === "REJECT" && "拒绝"}
                    {log.action === "ESCALATE" && "审批并上报"}
                    {log.action === "GM_APPROVE" && "终审通过"}
                    {log.action === "GM_REJECT" && "终审拒绝"}
                  </span>
                  {log.comment && (
                    <span className="text-gray-400">&ldquo;{log.comment}&rdquo;</span>
                  )}
                  <span className="ml-auto text-gray-300 text-xs">
                    {new Date(log.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comment Box */}
        {canApprove && (
          <>
            <div className="mb-5">
              <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">
                审批意见
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="输入审批备注（可选）..."
                className="w-full min-h-[80px] p-3 md:p-4 border border-black/[0.08] rounded-xl text-sm bg-black/[0.02] outline-none resize-y transition-colors focus:border-blue-400/50 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleAction("reject")}
                className="flex-1 py-3.5 rounded-2xl bg-red-500/[0.08] text-red-500 text-base font-semibold transition-all active:scale-[0.97] hover:bg-red-500/[0.12]"
              >
                拒绝
              </button>
              <button
                onClick={() => handleAction("approve")}
                className="flex-[2] py-3.5 rounded-2xl bg-blue-500 text-white text-base font-semibold transition-all active:scale-[0.97] hover:bg-blue-600"
              >
                {userRole === "SALES_VP" && needsEscalation
                  ? "同意并上报"
                  : "同意"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
