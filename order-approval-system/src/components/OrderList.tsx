"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/types";
import Badge from "@/components/ui/Badge";

interface OrderListProps {
  orders: Order[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const PRIORITY: Record<OrderStatus, number> = {
  pending: 0,
  escalated: 1,
  vp_approved: 2,
  gm_approved: 2,
  rejected: 3,
};

type FilterTab = "all" | "pending" | "done" | "rejected";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待处理" },
  { key: "done", label: "已完成" },
  { key: "rejected", label: "已驳回" },
];

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const pd = PRIORITY[a.status] - PRIORITY[b.status];
    if (pd !== 0) return pd;
    return new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime();
  });
}

function filterByTab(orders: Order[], tab: FilterTab): Order[] {
  switch (tab) {
    case "pending":
      return orders.filter((o) => o.status === "pending" || o.status === "escalated");
    case "done":
      return orders.filter((o) => o.status === "vp_approved" || o.status === "gm_approved");
    case "rejected":
      return orders.filter((o) => o.status === "rejected");
    default:
      return orders;
  }
}

function searchOrders(orders: Order[], q: string): Order[] {
  if (!q.trim()) return orders;
  const lq = q.toLowerCase();
  return orders.filter(
    (o) =>
      o.id.toLowerCase().includes(lq) ||
      o.customer.toLowerCase().includes(lq) ||
      o.partNumber.toLowerCase().includes(lq) ||
      o.endCustomer.toLowerCase().includes(lq) ||
      o.salesRep.toLowerCase().includes(lq)
  );
}

function formatAmount(n: number): string {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrderList({ orders, selectedId, onSelect }: OrderListProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  const filtered = sortOrders(searchOrders(filterByTab(orders, filter), search));
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "escalated").length;

  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fbfbfd",
        borderRight: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Header + Search */}
      <div style={{ padding: "16px 14px 0", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(0,0,0,0.38)",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            marginBottom: 12,
            paddingLeft: 4,
          }}
        >
          订单列表 &middot; {pendingCount} 笔待处理
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <svg
            width="15" height="15" viewBox="0 0 15 15" fill="none"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}
          >
            <circle cx="6.5" cy="6.5" r="5" stroke={searchFocus ? "#0071e3" : "rgba(0,0,0,0.28)"} strokeWidth="1.3" />
            <line x1="10.2" y1="10.2" x2="13.5" y2="13.5" stroke={searchFocus ? "#0071e3" : "rgba(0,0,0,0.28)"} strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="搜索客户、料号、订单号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 32px",
              borderRadius: 8,
              border: "none",
              background: searchFocus ? "#ffffff" : "rgba(0,0,0,0.04)",
              fontSize: 13,
              color: "#1d1d1f",
              outline: "none",
              letterSpacing: -0.08,
              boxSizing: "border-box",
              transition: "all 0.2s ease",
              boxShadow: searchFocus ? "0 0 0 2px rgba(0,113,227,0.3)" : "none",
            }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  flex: 1,
                  padding: "6px 0",
                  borderRadius: 6,
                  border: "none",
                  background: active ? "#0071e3" : "rgba(0,0,0,0.04)",
                  color: active ? "#ffffff" : "rgba(0,0,0,0.56)",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  letterSpacing: -0.06,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order cards */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 14px 14px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: "rgba(0,0,0,0.32)" }}>
            无匹配订单
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((order) => {
            const isSelected = order.id === selectedId;
            const hasRisk = order.isSpecialPrice || order.grossMargin < 15;
            return (
              <div
                key={order.id}
                onClick={() => onSelect(order.id)}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
                style={{
                  padding: "13px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: isSelected ? "#0071e3" : "transparent",
                  transition: "all 0.2s cubic-bezier(0.25,0.1,0.25,1)",
                  boxShadow: isSelected ? "0 2px 10px rgba(0,113,227,0.3)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      color: isSelected ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.38)",
                      letterSpacing: 0.2,
                    }}
                  >
                    {order.id}
                  </span>
                  {!isSelected && <Badge status={order.status} />}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: isSelected ? "#ffffff" : "#1d1d1f",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 4,
                    letterSpacing: -0.3,
                  }}
                >
                  {order.customer}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12,
                    color: isSelected ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.48)",
                    marginBottom: 3,
                    letterSpacing: -0.12,
                  }}
                >
                  <span>{order.partNumber}</span>
                  <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    ¥{formatAmount(order.totalAmountTax)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: isSelected ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    letterSpacing: -0.12,
                  }}
                >
                  {order.endCustomer}
                </div>
                {hasRisk && !isSelected && (
                  <div style={{ display: "flex", gap: 4, marginTop: 7 }}>
                    {order.isSpecialPrice && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 980, background: "rgba(255,149,0,0.10)", color: "#8a5500", fontWeight: 600, letterSpacing: -0.08 }}>
                        特殊价格
                      </span>
                    )}
                    {order.grossMargin < 15 && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 980, background: "rgba(255,59,48,0.08)", color: "#ff3b30", fontWeight: 600, letterSpacing: -0.08 }}>
                        低毛利 {order.grossMargin}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
