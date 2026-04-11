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
        padding: "16px 12px",
        background: "#ffffff",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(0,0,0,0.48)",
          letterSpacing: -0.12,
          marginBottom: 12,
          paddingLeft: 4,
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
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                cursor: "pointer",
                background: isSelected ? "#0071e3" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {/* Row 1: Order ID + Badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "ui-monospace, SFMono-Regular, monospace",
                    color: isSelected ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.48)",
                    letterSpacing: -0.12,
                  }}
                >
                  {order.id}
                </span>
                {!isSelected && <Badge status={order.status} />}
              </div>

              {/* Row 2: Customer */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isSelected ? "#ffffff" : "#1d1d1f",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 3,
                  letterSpacing: -0.224,
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
                  color: isSelected ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)",
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
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {order.isSpecialPrice && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 5,
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
                        padding: "2px 7px",
                        borderRadius: 5,
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
