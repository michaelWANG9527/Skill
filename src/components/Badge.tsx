"use client";

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待审批", color: "#FF9500" },
  VP_APPROVED: { label: "VP已批", color: "#34C759" },
  ESCALATED: { label: "已上报", color: "#5856D6" },
  REJECTED: { label: "已拒绝", color: "#FF3B30" },
  GM_APPROVED: { label: "终审通过", color: "#30D158" },
  GM_REJECTED: { label: "终审拒绝", color: "#FF3B30" },
};

export default function Badge({ status }: { status: string }) {
  const s = statusMap[status] || statusMap.PENDING;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.color + "18", color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}
