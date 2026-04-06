"use client";

import Badge from "./Badge";
import WarningTag from "./WarningTag";

export interface OrderData {
  id: string;
  erpOrderNo: string;
  customer: string;
  customerCode: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  grossMargin: number;
  isSpecialPrice: boolean;
  status: string;
  salesRep: string;
  syncedAt: string;
  logs: Array<{
    id: string;
    action: string;
    comment: string | null;
    createdAt: string;
    user: { displayName: string };
  }>;
}

interface OrderListProps {
  orders: OrderData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function OrderList({ orders, selectedId, onSelect }: OrderListProps) {
  const formatCurrency = (currency: string, amount: number) =>
    (currency === "USD" ? "$" : "¥") + amount.toLocaleString();

  const truncate = (s: string, max: number) =>
    s.length > max ? s.slice(0, max) + "…" : s;

  return (
    <div className="w-full md:w-[300px] flex-shrink-0">
      <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">
        订单列表
      </div>
      <div className="flex flex-col gap-2">
        {orders.map((o) => (
          <div
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${
              selectedId === o.id
                ? "bg-blue-500/5 border-[1.5px] border-blue-500/30"
                : "bg-black/[0.02] border border-black/[0.04] hover:bg-black/[0.04]"
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[15px] font-semibold text-gray-900">
                {truncate(o.customer, 12)}
              </span>
              <Badge status={o.status} />
            </div>
            <div className="flex justify-between text-[13px] text-gray-400">
              <span>{o.partNumber}</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(o.currency, o.totalAmount)}
              </span>
            </div>
            {(o.isSpecialPrice || o.grossMargin < 15) && (
              <div className="flex gap-1.5 mt-1.5">
                {o.isSpecialPrice && <WarningTag label="特殊价格" />}
                {o.grossMargin < 15 && <WarningTag label={`毛利 ${o.grossMargin}%`} />}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-12">
            暂无订单
          </div>
        )}
      </div>
    </div>
  );
}
