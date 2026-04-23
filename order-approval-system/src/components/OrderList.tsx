"use client";

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

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const pd = PRIORITY[a.status] - PRIORITY[b.status];
    if (pd !== 0) return pd;
    return new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime();
  });
}

function formatAmount(n: number): string {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrderList({ orders, selectedId, onSelect }: OrderListProps) {
  const sorted = sortOrders(orders);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div
      style={{
        width: 300,
        minWidth: 300,
        height: "100%",
        overflowY: "auto",
        padding: "18px 14px",
        background: "#fbfbfd",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(0,0,0,0.38)",
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 14,
          paddingLeft: 6,
        }}
      >
        订单列表 &middot; {pendingCount} 笔待审
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {sorted.map((order) => {
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
              {/* Row 1: Order ID + Badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
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

              {/* Row 2: Customer */}
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

              {/* Row 3: Part + Amount */}
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

              {/* Row 4: End customer */}
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

              {/* Row 5: Risk tags */}
              {hasRisk && !isSelected && (
                <div style={{ display: "flex", gap: 4, marginTop: 7 }}>
                  {order.isSpecialPrice && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 980,
                        background: "rgba(255,149,0,0.10)",
                        color: "#8a5500",
                        fontWeight: 600,
                        letterSpacing: -0.08,
                      }}
                    >
                      特殊价格
                    </span>
                  )}
                  {order.grossMargin < 15 && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 980,
                        background: "rgba(255,59,48,0.08)",
                        color: "#ff3b30",
                        fontWeight: 600,
                        letterSpacing: -0.08,
                      }}
                    >
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
  );
}
