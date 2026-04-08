"use client";

import { useState, useCallback } from "react";
import { User, Order, ApprovalRecord } from "@/types";
import { ORDERS } from "@/data/mockData";
import OrderList from "@/components/OrderList";
import OrderDetail from "@/components/OrderDetail";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import Toast from "@/components/ui/Toast";
import Footer from "@/components/ui/Footer";

interface ApprovalPageProps {
  currentUser: User;
  onLogout: () => void;
}

type MobilePanel = "list" | "detail" | "timeline";

export default function ApprovalPage({ currentUser, onLogout }: ApprovalPageProps) {
  const [orders, setOrders] = useState<Order[]>(() =>
    ORDERS.map((o) => ({ ...o, approvalHistory: [...o.approvalHistory] }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("list");

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const handleApprove = useCallback(
    (orderId: string, record: ApprovalRecord, emails: string[]) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const needsEscalation = o.isSpecialPrice || o.grossMargin < 15;
          return {
            ...o,
            status: needsEscalation ? "escalated" as const : "vp_approved" as const,
            approvalHistory: [...o.approvalHistory, record],
          };
        })
      );
      const order = orders.find((o) => o.id === orderId);
      const needsEscalation = order && (order.isSpecialPrice || order.grossMargin < 15);
      if (needsEscalation) {
        showToast("已审批并自动上报至总经理");
      } else {
        showToast("审批通过");
      }
      // TODO: 调用后端 API 发送审批邮件至选中的收件人
      void emails;
    },
    [orders, showToast]
  );

  const handleReject = useCallback(
    (orderId: string, record: ApprovalRecord) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status: "rejected" as const,
            approvalHistory: [...o.approvalHistory, record],
          };
        })
      );
      showToast("订单已驳回，系统已自动向 cs@seekwavetech.com 发送通知邮件");
      // TODO: 调用后端 API 发送驳回通知邮件至 cs@seekwavetech.com
    },
    [showToast]
  );

  const handleSelectOrder = useCallback((id: string) => {
    setSelectedId(id);
    setMobilePanel("detail");
  }, []);

  const mobileTabs: { key: MobilePanel; label: string }[] = [
    { key: "list", label: "订单" },
    { key: "detail", label: "详情" },
    { key: "timeline", label: "流程" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 56,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            alt="SeekWave"
            style={{ height: 28 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1d1d1f",
            }}
          >
            希微科技销售订单审批系统
          </span>
        </div>

        {/* Right: Stats + User + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Pending count */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 13, color: "#86868b" }}>待审批：</span>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#FF3B30",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pendingCount}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 24,
              background: "rgba(0,0,0,0.08)",
            }}
          />

          {/* User capsule */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1a5ca8, #3bb8c3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: 11, color: "#86868b" }}>
                {currentUser.role}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "none",
              color: "#007AFF",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
              padding: "4px 8px",
            }}
          >
            退出登录
          </button>
        </div>
      </header>

      {/* ── Main Content (3-column) ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Desktop: all 3 panels. Mobile: show mobilePanel via CSS class */}
        <div
          className={`order-list-panel${mobilePanel === "list" ? " mobile-active" : ""}`}
        >
          <OrderList
            orders={orders}
            selectedId={selectedId}
            onSelect={handleSelectOrder}
          />
        </div>

        <div
          className={`order-detail-panel${mobilePanel === "detail" ? " mobile-active" : ""}`}
          style={{ flex: 1, minWidth: 0 }}
        >
          <OrderDetail
            order={selectedOrder}
            currentUser={currentUser}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

        <div
          className={`order-timeline-panel${mobilePanel === "timeline" ? " mobile-active" : ""}`}
        >
          <ApprovalTimeline records={selectedOrder?.approvalHistory ?? []} />
        </div>
      </div>

      {/* ── Mobile Tab Bar ── */}
      <nav
        className="mobile-tab-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "none",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
          zIndex: 20,
        }}
      >
        {mobileTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobilePanel(tab.key)}
            style={{
              flex: 1,
              padding: "10px 0 8px",
              background: "none",
              border: "none",
              fontSize: 12,
              fontWeight: mobilePanel === tab.key ? 600 : 400,
              color: mobilePanel === tab.key ? "#007AFF" : "#86868b",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
