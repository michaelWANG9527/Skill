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
        background: "#f5f5f7",
      }}
    >
      {/* ── Header — Apple dark translucent glass nav ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 48,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            alt="SeekWave"
            style={{ height: 24, filter: "brightness(10)" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: -0.224,
            }}
          >
            希微科技销售订单审批系统
          </span>
        </div>

        {/* Right: Stats + User + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Pending count */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.48)" }}>待审批</span>
            <span
              style={{
                fontSize: 21,
                fontWeight: 600,
                color: "#ff453a",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: 0.231,
                lineHeight: 1.19,
              }}
            >
              {pendingCount}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.16)",
            }}
          />

          {/* User capsule */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#272729",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 400, color: "#ffffff" }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.48)" }}>
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
              color: "#2997ff",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 400,
              padding: "4px 8px",
              letterSpacing: -0.12,
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
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
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
              color: mobilePanel === tab.key ? "#2997ff" : "rgba(255,255,255,0.48)",
              cursor: "pointer",
              transition: "color 0.2s ease",
              letterSpacing: -0.12,
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
