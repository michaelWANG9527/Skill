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

const CARD_BG: Record<OrderStatus, string> = {
  pending: "rgba(255,255,255,0.65)",
  vp_approved: "rgba(52,199,89,0.08)",
  gm_approved: "rgba(52,199,89,0.08)",
  rejected: "rgba(255,59,48,0.08)",
  escalated: "rgba(255,149,0,0.08)",
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
        padding: "14px 10px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#86868b",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        订单列表 &middot; {pendingCount} 笔待审
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((order) => {
          const isSelected = order.id === selectedId;
          const hasRisk = order.isSpecialPrice || order.grossMargin < 15;
          return (
            <div
              key={order.id}
              onClick={() => onSelect(order.id)}
              style={{
                padding: "13px 14px",
                borderRadius: 14,
                cursor: "pointer",
                background: isSelected
                  ? "rgba(0,122,255,0.07)"
                  : CARD_BG[order.status],
                border: isSelected
                  ? "1.5px solid rgba(0,122,255,0.25)"
                  : "1px solid rgba(255,255,255,0.5)",
                boxShadow: isSelected
                  ? "0 2px 12px rgba(0,122,255,0.06)"
                  : "0 1px 4px rgba(0,0,0,0.03)",
                transition: "all 0.2s ease",
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
                    fontWeight: 700,
                    fontFamily: "ui-monospace, SFMono-Regular, monospace",
                    color: "#1d1d1f",
                  }}
                >
                  {order.id}
                </span>
                <Badge status={order.status} />
              </div>

              {/* Row 2: Customer */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1d1d1f",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 3,
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
                  color: "#3c3c43",
                  marginBottom: 3,
                }}
              >
                <span>{order.partNumber}</span>
                <span style={{ fontWeight: 600 }}>
                  ¥{formatAmount(order.totalAmountTax)}
                </span>
              </div>

              {/* Row 4: End customer */}
              <div
                style={{
                  fontSize: 11,
                  color: "#86868b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {order.endCustomer}
              </div>

              {/* Row 5: Risk tags */}
              {hasRisk && (
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  {order.isSpecialPrice && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: "rgba(255,149,0,0.10)",
                        color: "#8a5500",
                        fontWeight: 600,
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
                        borderRadius: 6,
                        background: "rgba(255,59,48,0.08)",
                        color: "#c0392b",
                        fontWeight: 600,
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
