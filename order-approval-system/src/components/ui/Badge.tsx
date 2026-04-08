"use client";

import { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  pending:     { color: "#FF9500", bg: "rgba(255,149,0,0.10)", label: "待审批" },
  vp_approved: { color: "#34C759", bg: "rgba(52,199,89,0.10)", label: "已审批" },
  escalated:   { color: "#5856D6", bg: "rgba(88,86,214,0.10)", label: "已上报" },
  rejected:    { color: "#FF3B30", bg: "rgba(255,59,48,0.10)", label: "已拒绝" },
  gm_approved: { color: "#30D158", bg: "rgba(48,209,88,0.10)", label: "终审通过" },
};

export default function Badge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        background: cfg.bg,
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
