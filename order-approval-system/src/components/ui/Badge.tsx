"use client";

import { OrderStatus } from "@/types";

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; border: string; label: string }> = {
  pending:     { color: "#ff9500", bg: "rgba(255,149,0,0.08)", border: "rgba(255,149,0,0.18)", label: "待审批" },
  vp_approved: { color: "#34c759", bg: "rgba(52,199,89,0.08)", border: "rgba(52,199,89,0.18)", label: "已审批" },
  escalated:   { color: "#af52de", bg: "rgba(175,82,222,0.08)", border: "rgba(175,82,222,0.18)", label: "已上报" },
  rejected:    { color: "#ff3b30", bg: "rgba(255,59,48,0.08)", border: "rgba(255,59,48,0.18)", label: "已拒绝" },
  gm_approved: { color: "#30d158", bg: "rgba(48,209,88,0.08)", border: "rgba(48,209,88,0.18)", label: "终审通过" },
};

export default function Badge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 11px 3px 9px",
        borderRadius: 980,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        whiteSpace: "nowrap",
        letterSpacing: -0.06,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
          boxShadow: `0 0 0 2px ${cfg.bg}`,
        }}
      />
      {cfg.label}
    </span>
  );
}
