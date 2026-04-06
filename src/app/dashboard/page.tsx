"use client";

import { useState, useEffect, useCallback } from "react";
import OrderList, { OrderData } from "@/components/OrderList";
import OrderDetail from "@/components/OrderDetail";
import Toast from "@/components/Toast";

interface UserInfo {
  role: string;
  displayName: string;
}

const roleLabel: Record<string, string> = {
  SALES_VP: "销售副总裁",
  RD_VP: "研发副总裁",
  GM: "总经理",
  ADMIN: "管理员",
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>({ role: "SALES_VP", displayName: "销售副总裁" });
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState("SALES_VP");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-test-role": currentRole },
      });
      const data = await res.json();
      setOrders(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }, [currentRole, selectedId]);

  useEffect(() => {
    setUser({ role: currentRole, displayName: roleLabel[currentRole] });
    setSelectedId(null);
    fetchOrders();
  }, [fetchOrders, currentRole]);

  const handleAction = async (action: "approve" | "reject", comment: string) => {
    if (!selectedId) return;

    try {
      const res = await fetch(`/api/orders/${selectedId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-test-role": currentRole },
        body: JSON.stringify({ action, comment }),
      });

      if (!res.ok) {
        const err = await res.json();
        setToast(err.error || "操作失败");
        return;
      }

      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

      const msg =
        updatedOrder.status === "ESCALATED"
          ? "已审批并自动上报至总经理"
          : action === "approve"
          ? updatedOrder.status === "GM_APPROVED"
            ? "终审通过"
            : "审批通过"
          : "已拒绝";

      setToast(msg);
    } catch {
      setToast("网络错误，请重试");
    }
  };

  const selected = orders.find((o) => o.id === selectedId) || null;
  const pendingCount = orders.filter(
    (o) => o.status === "PENDING" || o.status === "ESCALATED"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-4 pb-8">
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="py-6 border-b border-black/[0.08]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-[28px] font-semibold text-gray-900 tracking-tight">
              订单审批
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {pendingCount} 笔待处理 · 希微科技审批平台
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["SALES_VP", "GM"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setCurrentRole(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currentRole === r
                    ? "bg-blue-500 text-white"
                    : "bg-black/[0.04] text-gray-500 hover:bg-black/[0.08]"
                }`}
              >
                {roleLabel[r]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-5 mt-5">
        <OrderList
          orders={orders}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {selected ? (
          <OrderDetail
            order={selected}
            userRole={user?.role || ""}
            onAction={handleAction}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-20">
            请从左侧选择一个订单
          </div>
        )}
      </div>
    </div>
  );
}
