"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import OrderList, { OrderData } from "@/components/OrderList";
import OrderDetail from "@/components/OrderDetail";
import Toast from "@/components/Toast";

interface UserInfo {
  role: string;
  displayName: string;
}

const roleAbbr: Record<string, string> = {
  SALES_VP: "VP",
  RD_VP: "RD",
  GM: "GM",
  ADMIN: "AD",
};

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
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
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
  }, [router, selectedId]);

  useEffect(() => {
    // Get user info from cookie-based session via a lightweight check
    const getUserInfo = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };
    getUserInfo();
    fetchOrders();
  }, [fetchOrders, router]);

  const handleAction = async (action: "approve" | "reject", comment: string) => {
    if (!selectedId) return;

    try {
      const res = await fetch(`/api/orders/${selectedId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-black/[0.03] rounded-full text-[13px] text-gray-900">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                {user ? roleAbbr[user.role] || "U" : "U"}
              </div>
              {user ? roleLabel[user.role] || user.displayName : ""}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
            >
              退出
            </button>
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
