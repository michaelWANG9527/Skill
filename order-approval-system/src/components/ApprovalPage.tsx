"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Order, OrderStatus, ApprovalRecord } from "@/types";
import OrderList from "@/components/OrderList";
import OrderDetail from "@/components/OrderDetail";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import Dashboard from "@/components/Dashboard";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Footer from "@/components/ui/Footer";

interface ApprovalPageProps {
  currentUser: User;
  onLogout: () => void;
}

type MobilePanel = "list" | "detail" | "timeline";
type View = "approval" | "dashboard";

export default function ApprovalPage({ currentUser, onLogout }: ApprovalPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"erp" | "mock" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("list");
  const [activeView, setActiveView] = useState<View>("approval");
  const [confirmReject, setConfirmReject] = useState<{ orderId: string; record: ApprovalRecord } | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "escalated").length;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  // 从后端 API 拉取订单（后端对接鼎捷 T100，未配置时返回演示数据）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok) throw new Error(data.error);
        setOrders(data.orders);
        setDataSource(data.source);
        setSelectedId(data.orders[0]?.id ?? null);
      } catch (err) {
        if (!cancelled) {
          showToast(`订单加载失败：${err instanceof Error ? err.message : "网络错误"}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  /** 提交审批决定到后端（后端为状态机唯一权威并负责回写 ERP） */
  const submitDecision = useCallback(
    async (
      orderId: string,
      decision: "approve" | "reject",
      record: ApprovalRecord,
      emails: string[]
    ): Promise<OrderStatus | null> => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return null;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/approval`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            currentStatus: order.status,
            isSpecialPrice: order.isSpecialPrice,
            grossMargin: order.grossMargin,
            record,
            emails,
          }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: data.nextStatus, approvalHistory: [...o.approvalHistory, record] }
              : o
          )
        );
        return data.nextStatus as OrderStatus;
      } catch (err) {
        showToast(`审批提交失败：${err instanceof Error ? err.message : "网络错误"}`);
        return null;
      }
    },
    [orders, showToast]
  );

  const handleApprove = useCallback(
    async (orderId: string, record: ApprovalRecord, emails: string[]) => {
      const nextStatus = await submitDecision(orderId, "approve", record, emails);
      if (!nextStatus) return;
      const erpSuffix = dataSource === "erp" ? "，已回写鼎捷ERP" : "";
      if (nextStatus === "escalated") {
        showToast(`已审批并自动上报至总经理${erpSuffix}`);
      } else if (nextStatus === "gm_approved") {
        showToast(`终审通过${erpSuffix}`);
      } else {
        showToast(`审批通过${erpSuffix}`);
      }
    },
    [submitDecision, showToast, dataSource]
  );

  const handleRejectRequest = useCallback(
    (orderId: string, record: ApprovalRecord) => {
      setConfirmReject({ orderId, record });
    },
    []
  );

  const handleRejectConfirm = useCallback(async () => {
    if (!confirmReject) return;
    const { orderId, record } = confirmReject;
    setConfirmReject(null);
    const nextStatus = await submitDecision(orderId, "reject", record, []);
    if (!nextStatus) return;
    const erpSuffix = dataSource === "erp" ? "，已回写鼎捷ERP" : "";
    showToast(`订单已驳回${erpSuffix}，系统已自动向 cs@seekwavetech.com 发送通知邮件`);
  }, [confirmReject, submitDecision, showToast, dataSource]);

  const handleSelectOrder = useCallback((id: string) => {
    setSelectedId(id);
    setMobilePanel("detail");
    setActiveView("approval");
  }, []);

  const handleDashboardNav = useCallback((id: string) => {
    setSelectedId(id);
    setActiveView("approval");
    setMobilePanel("detail");
  }, []);

  const mobileTabs: { key: MobilePanel; label: string; icon: React.ReactNode }[] = [
    {
      key: "list",
      label: "订单",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="2.5" rx="1" fill="currentColor"/><rect x="3" y="8.75" width="14" height="2.5" rx="1" fill="currentColor"/><rect x="3" y="13.5" width="10" height="2.5" rx="1" fill="currentColor"/></svg>,
    },
    {
      key: "detail",
      label: "详情",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3"/></svg>,
    },
    {
      key: "timeline",
      label: "流程",
      icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="5" r="2" fill="currentColor"/><circle cx="6" cy="10" r="2" fill="currentColor"/><circle cx="6" cy="15" r="2" fill="currentColor"/><line x1="6" y1="7" x2="6" y2="8" stroke="currentColor" strokeWidth="1.2"/><line x1="6" y1="12" x2="6" y2="13" stroke="currentColor" strokeWidth="1.2"/><line x1="10" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.2"/><line x1="10" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.2"/><line x1="10" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.2"/></svg>,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f7",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: 64,
          background: "rgba(22,22,23,0.82)",
          backdropFilter: "saturate(200%) blur(24px)",
          WebkitBackdropFilter: "saturate(200%) blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Logo + Title + View Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/logo.png"
            alt="SeekWave"
            style={{ height: 36, filter: "brightness(10)" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#f5f5f7", letterSpacing: -0.3 }}>
              希微科技
            </span>
            <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.56)", letterSpacing: -0.1, marginLeft: 8 }}>
              销售订单审批系统
            </span>
          </div>

          {/* View tabs */}
          <div
            style={{
              display: "flex",
              marginLeft: 16,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: 2,
            }}
          >
            {(["approval", "dashboard"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: activeView === v ? "rgba(255,255,255,0.16)" : "transparent",
                  color: activeView === v ? "#ffffff" : "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: activeView === v ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  letterSpacing: -0.06,
                }}
              >
                {v === "approval" ? "审批" : "仪表盘"}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Stats + User + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Data source tag */}
          {dataSource && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 980,
                background: dataSource === "erp" ? "rgba(52,199,89,0.16)" : "rgba(255,255,255,0.08)",
                color: dataSource === "erp" ? "#30d158" : "rgba(255,255,255,0.5)",
              }}
            >
              {dataSource === "erp" ? "鼎捷T100 已连接" : "演示数据"}
            </span>
          )}

          {/* Pending capsule */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 980,
              background: pendingCount > 0 ? "rgba(255,69,58,0.12)" : "rgba(52,199,89,0.12)",
            }}
          >
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: -0.08 }}>
              {pendingCount > 0 ? "待处理" : "已清空"}
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: pendingCount > 0 ? "#ff453a" : "#34c759",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {pendingCount}
            </span>
          </div>

          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#f5f5f7", letterSpacing: -0.1 }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", letterSpacing: -0.06 }}>
                {currentUser.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "#64d2ff",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: 980,
              letterSpacing: -0.08,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          >
            退出登录
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "rgba(0,0,0,0.42)",
              fontSize: 14,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ animation: "spin 0.9s linear infinite" }}>
              <circle cx="14" cy="14" r="11" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
              <path d="M14 3a11 11 0 0 1 11 11" stroke="#0071e3" strokeWidth="3" strokeLinecap="round" />
            </svg>
            正在从 ERP 同步订单数据...
          </div>
        )}
        {!loading && activeView === "dashboard" && (
          <Dashboard orders={orders} onNavigateToOrder={handleDashboardNav} />
        )}
        {!loading && activeView === "approval" && (
          <>
            <div className={`order-list-panel${mobilePanel === "list" ? " mobile-active" : ""}`}>
              <OrderList orders={orders} selectedId={selectedId} onSelect={handleSelectOrder} />
            </div>
            <div
              className={`order-detail-panel${mobilePanel === "detail" ? " mobile-active" : ""}`}
              style={{ flex: 1, minWidth: 0 }}
            >
              <OrderDetail
                order={selectedOrder}
                currentUser={currentUser}
                onApprove={handleApprove}
                onReject={handleRejectRequest}
              />
            </div>
            <div className={`order-timeline-panel${mobilePanel === "timeline" ? " mobile-active" : ""}`}>
              <ApprovalTimeline records={selectedOrder?.approvalHistory ?? []} />
            </div>
          </>
        )}
      </div>

      {/* ── Mobile Tab Bar ── */}
      {activeView === "approval" && (
        <nav
          className="mobile-tab-bar"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "none",
            background: "rgba(22,22,23,0.82)",
            backdropFilter: "saturate(200%) blur(24px)",
            WebkitBackdropFilter: "saturate(200%) blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            zIndex: 20,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {mobileTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobilePanel(tab.key)}
              style={{
                flex: 1,
                padding: "8px 0 6px",
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                fontSize: 10,
                fontWeight: mobilePanel === tab.key ? 600 : 400,
                color: mobilePanel === tab.key ? "#64d2ff" : "rgba(255,255,255,0.38)",
                cursor: "pointer",
                transition: "color 0.2s ease",
                letterSpacing: -0.06,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <Footer />

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* ── Reject Confirmation ── */}
      {confirmReject && (
        <ConfirmModal
          title="确认驳回"
          message={`确定要驳回此订单吗？驳回后系统将自动向 CS 发送通知邮件。`}
          confirmLabel="确认驳回"
          cancelLabel="再想想"
          danger
          onConfirm={handleRejectConfirm}
          onCancel={() => setConfirmReject(null)}
        />
      )}
    </div>
  );
}
