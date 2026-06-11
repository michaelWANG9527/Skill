"use client";

import { Order } from "@/types";

interface DashboardProps {
  orders: Order[];
  onNavigateToOrder: (id: string) => void;
}

function KpiCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 160,
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.42)", letterSpacing: 0.3, textTransform: "uppercase" }}>
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.5, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.42)", letterSpacing: -0.08 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 60, fontSize: 12, color: "rgba(0,0,0,0.56)", letterSpacing: -0.08, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ width: 28, fontSize: 12, fontWeight: 600, color: "#1d1d1f", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{count}</span>
    </div>
  );
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr.replace(" ", "T"));
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86400000));
}

export default function Dashboard({ orders, onNavigateToOrder }: DashboardProps) {
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const approved = orders.filter((o) => o.status === "vp_approved" || o.status === "gm_approved").length;
  const escalated = orders.filter((o) => o.status === "escalated").length;
  const rejected = orders.filter((o) => o.status === "rejected").length;

  const totalAmount = orders.reduce((s, o) => s + o.totalAmountTax, 0);
  const avgMargin = total > 0 ? orders.reduce((s, o) => s + o.grossMargin, 0) / total : 0;

  const urgentOrders = orders
    .filter((o) => o.status === "pending" || o.status === "escalated")
    .map((o) => ({ ...o, waitDays: daysSince(o.syncedAt) }))
    .sort((a, b) => b.waitDays - a.waitDays);

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        overflowY: "auto",
        padding: "28px 32px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard
          label="待审批"
          value={pending}
          sub={escalated > 0 ? `含 ${escalated} 笔待终审` : undefined}
          color="#ff9500"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#ff9500" strokeWidth="1.5"/><path d="M9 5v4l3 2" stroke="#ff9500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <KpiCard
          label="已通过"
          value={approved}
          sub={`审批率 ${total > 0 ? ((approved / total) * 100).toFixed(0) : 0}%`}
          color="#34c759"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#34c759" strokeWidth="1.5"/><path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#34c759" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        />
        <KpiCard
          label="已驳回"
          value={rejected}
          color="#ff3b30"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#ff3b30" strokeWidth="1.5"/><path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="#ff3b30" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        />
        <KpiCard
          label="订单总额"
          value={`¥${(totalAmount / 10000).toFixed(1)}万`}
          sub={`平均毛利率 ${avgMargin.toFixed(1)}%`}
          color="#0071e3"
          icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="6" width="14" height="9" rx="2" stroke="#0071e3" strokeWidth="1.5"/><path d="M5 6V4.5A2.5 2.5 0 0 1 7.5 2h3A2.5 2.5 0 0 1 13 4.5V6" stroke="#0071e3" strokeWidth="1.5"/><line x1="2" y1="10" x2="16" y2="10" stroke="#0071e3" strokeWidth="1.5"/></svg>}
        />
      </div>

      {/* Two-column: Status Distribution + Urgent Orders */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {/* Status Distribution */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: "#ffffff",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.04)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            padding: "22px 24px",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.2, marginBottom: 20 }}>
            审批状态分布
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <StatusBar label="待审批" count={pending} total={total} color="#ff9500" />
            <StatusBar label="已上报" count={escalated} total={total} color="#af52de" />
            <StatusBar label="已通过" count={approved} total={total} color="#34c759" />
            <StatusBar label="已驳回" count={rejected} total={total} color="#ff3b30" />
          </div>
        </div>

        {/* Urgent / Aging Orders */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: "#ffffff",
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.04)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            padding: "22px 24px",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.2, marginBottom: 16 }}>
            待处理订单时效
          </div>
          {urgentOrders.length === 0 ? (
            <div style={{ fontSize: 13, color: "rgba(0,0,0,0.36)", textAlign: "center", padding: 24 }}>
              所有订单已处理完毕
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {urgentOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => onNavigateToOrder(o.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", letterSpacing: -0.1 }}>
                      {o.customer}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", letterSpacing: 0.1, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                      {o.id}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 980,
                      background: o.waitDays >= 3 ? "rgba(255,59,48,0.08)" : o.waitDays >= 1 ? "rgba(255,149,0,0.08)" : "rgba(0,0,0,0.04)",
                      color: o.waitDays >= 3 ? "#ff3b30" : o.waitDays >= 1 ? "#ff9500" : "rgba(0,0,0,0.56)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {o.waitDays === 0 ? "今天" : `${o.waitDays}天`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
