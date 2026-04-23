"use client";

import { useState } from "react";
import { Order, User, ApprovalRecord } from "@/types";
import { QUICK_OPTIONS, PRESET_EMAILS } from "@/data/mockData";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";

interface OrderDetailProps {
  order: Order | null;
  currentUser: User;
  onApprove: (orderId: string, record: ApprovalRecord, emails: string[]) => void;
  onReject: (orderId: string, record: ApprovalRecord) => void;
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtUsd(n: number): string {
  return n.toFixed(4);
}

function nowStr(): string {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(0,0,0,0.38)",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 10,
        marginTop: 28,
      }}
    >
      {children}
    </div>
  );
}

function Cell({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.42)", marginBottom: 5, letterSpacing: -0.08 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: danger ? "#ff3b30" : "#1d1d1f",
          letterSpacing: -0.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoGrid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        background: "#f5f5f7",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

export default function OrderDetail({
  order,
  currentUser,
  onApprove,
  onReject,
}: OrderDetailProps) {
  const [comment, setComment] = useState("");
  const [selectedPills, setSelectedPills] = useState<Set<string>>(new Set());
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);
  const [manualEdit, setManualEdit] = useState(false);

  if (!order) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(0,0,0,0.48)",
          fontSize: 17,
          letterSpacing: -0.374,
        }}
      >
        请从左侧选择一笔订单
      </div>
    );
  }

  const needsEscalation = order.isSpecialPrice || order.grossMargin < 15;
  const isPending = order.status === "pending";

  const togglePill = (text: string) => {
    if (manualEdit) return;
    const next = new Set(selectedPills);
    if (next.has(text)) {
      next.delete(text);
    } else {
      next.add(text);
    }
    setSelectedPills(next);
    setComment(Array.from(next).join("；"));
  };

  const handleCommentChange = (val: string) => {
    setComment(val);
    setManualEdit(true);
    setSelectedPills(new Set());
  };

  const resetForm = () => {
    setComment("");
    setSelectedPills(new Set());
    setEmailEnabled(false);
    setSelectedEmails(new Set());
    setManualEdit(false);
  };

  const handleApprove = () => {
    const action = needsEscalation ? "escalate" : "approve";
    const record: ApprovalRecord = {
      action: action as ApprovalRecord["action"],
      user: currentUser.name,
      time: nowStr(),
      comment: comment || (needsEscalation ? "同意并上报总经理" : "审批通过"),
    };
    onApprove(order.id, record, Array.from(selectedEmails));
    resetForm();
  };

  const handleReject = () => {
    const record: ApprovalRecord = {
      action: "reject",
      user: currentUser.name,
      time: nowStr(),
      comment: comment || "驳回",
    };
    onReject(order.id, record);
    resetForm();
  };

  const toggleEmail = (email: string) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.add(email);
    }
    setSelectedEmails(next);
  };

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        overflowY: "auto",
        padding: "22px 28px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
          border: "1px solid rgba(0,0,0,0.04)",
          padding: 32,
          animation: "fadeSlideIn 0.3s ease",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#1d1d1f",
                letterSpacing: -0.5,
                lineHeight: 1.15,
              }}
            >
              {order.customer}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(0,0,0,0.42)",
                marginTop: 8,
                letterSpacing: -0.1,
                lineHeight: 1.3,
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
              }}
            >
              {order.id} &middot; 同步于 {order.syncedAt}
            </div>
          </div>
          <Badge status={order.status} />
        </div>

        {/* ── Section 1: 终端信息 ── */}
        <SectionTitle>终端信息</SectionTitle>
        <InfoGrid cols={2}>
          <Cell label="终端客户" value={order.endCustomer} />
          <Cell label="终端应用" value={order.endApplication} />
        </InfoGrid>

        {/* ── Section 2: 产品与价格 ── */}
        <SectionTitle>产品与价格</SectionTitle>
        <InfoGrid cols={3}>
          <Cell label="料号" value={order.partNumber} />
          <Cell label="数量" value={`${fmt(order.quantity, 0)} pcs`} />
          <Cell
            label="毛利率"
            value={`${order.grossMargin}%`}
            danger={order.grossMargin < 15}
          />
          <Cell label="美元单价" value={`$${fmtUsd(order.unitPriceUsd)}`} />
          <Cell label="人民币含税单价" value={`¥${fmtUsd(order.unitPriceCnyTax)}`} />
          <Cell label="总金额（含税）" value={`¥${fmt(order.totalAmountTax)}`} />
        </InfoGrid>

        {/* ── Section 3: 商务条款 ── */}
        <SectionTitle>商务条款</SectionTitle>
        <InfoGrid cols={3}>
          <Cell label="客户账期" value={order.paymentTerms} />
          <Cell label="订单日期" value={order.orderDate} />
          <Cell label="需要到货日期" value={order.requiredDeliveryDate} />
        </InfoGrid>

        {/* ── Section 4: 销售信息 ── */}
        <SectionTitle>销售信息</SectionTitle>
        <InfoGrid cols={2}>
          <Cell label="销售负责人" value={order.salesRep} />
          <Cell label="客户编码" value={order.customerCode} />
        </InfoGrid>

        {/* ── Risk Warning ── */}
        {(order.isSpecialPrice || order.grossMargin < 15) && (
          <div
            style={{
              marginTop: 24,
              padding: "14px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(255,149,0,0.08), rgba(255,179,64,0.06))",
              border: "1px solid rgba(255,149,0,0.15)",
              fontSize: 13,
              color: "#8a5500",
              lineHeight: 1.5,
              letterSpacing: -0.1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {order.isSpecialPrice && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1 14h14L8 1.5z" stroke="#ff9500" strokeWidth="1.3" fill="rgba(255,149,0,0.1)"/><line x1="8" y1="6" x2="8" y2="10" stroke="#ff9500" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="12" r="0.8" fill="#ff9500"/></svg>
                特殊价格订单，审批后将自动上报总经理终审
              </div>
            )}
            {order.grossMargin < 15 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L1 14h14L8 1.5z" stroke="#ff9500" strokeWidth="1.3" fill="rgba(255,149,0,0.1)"/><line x1="8" y1="6" x2="8" y2="10" stroke="#ff9500" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="12" r="0.8" fill="#ff9500"/></svg>
                毛利率 {order.grossMargin}% 低于 15% 标准阈值
              </div>
            )}
          </div>
        )}

        {/* ── Approval Actions (only when pending) ── */}
        {isPending && (
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1d1d1f",
                marginBottom: 12,
                letterSpacing: -0.224,
              }}
            >
              审批操作
            </div>

            {/* Quick pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {QUICK_OPTIONS.map((opt) => {
                const isActive = selectedPills.has(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => togglePill(opt)}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "#f5f5f7";
                    }}
                    style={{
                      padding: "7px 18px",
                      borderRadius: 980,
                      border: isActive
                        ? "1px solid rgba(0,113,227,0.4)"
                        : "1px solid rgba(0,0,0,0.06)",
                      background: isActive ? "rgba(0,113,227,0.08)" : "#f5f5f7",
                      color: isActive ? "#0071e3" : "rgba(0,0,0,0.72)",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.25,0.1,0.25,1)",
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: -0.1,
                    }}
                  >
                    {isActive ? "✓ " : ""}
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <textarea
              placeholder="输入审批备注（可选）..."
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              style={{
                width: "100%",
                minHeight: 68,
                padding: "12px 16px",
                border: "none",
                borderRadius: 8,
                background: "#f5f5f7",
                fontSize: 17,
                color: "#1d1d1f",
                outline: "none",
                resize: "vertical",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
                fontFamily: "inherit",
                letterSpacing: -0.374,
                lineHeight: 1.47,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 2px #0071e3";
                e.target.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "inset 0 0 0 1px rgba(0,0,0,0.04)";
                e.target.style.background = "#f5f5f7";
              }}
            />

            {/* Email CC */}
            <div style={{ marginTop: 14 }}>
              <Toggle
                checked={emailEnabled}
                onChange={setEmailEnabled}
                label="将审批意见发送至邮箱"
              />
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: emailEnabled ? 80 : 0,
                  opacity: emailEnabled ? 1 : 0,
                  transition: "max-height 0.35s ease, opacity 0.25s ease",
                  marginTop: emailEnabled ? 10 : 0,
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PRESET_EMAILS.map((email) => {
                    const isActive = selectedEmails.has(email);
                    return (
                      <button
                        key={email}
                        onClick={() => toggleEmail(email)}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 980,
                          border: isActive ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
                          background: isActive ? "#0071e3" : "#f5f5f7",
                          color: isActive ? "#ffffff" : "rgba(0,0,0,0.8)",
                          fontSize: 12,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontWeight: isActive ? 600 : 400,
                          letterSpacing: -0.12,
                        }}
                      >
                        {isActive ? "✓ " : ""}
                        {email}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {/* Reject */}
              <button
                onMouseDown={() => setPressedBtn("reject")}
                onMouseUp={() => setPressedBtn(null)}
                onMouseLeave={(e) => {
                  setPressedBtn(null);
                  e.currentTarget.style.background = "#1d1d1f";
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#333336";
                }}
                onClick={handleReject}
                style={{
                  flex: 1,
                  padding: "13px 15px",
                  borderRadius: 10,
                  border: "none",
                  background: "#1d1d1f",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.25,0.1,0.25,1)",
                  transform: pressedBtn === "reject" ? "scale(0.975)" : "scale(1)",
                  letterSpacing: -0.2,
                }}
              >
                拒绝
              </button>

              {/* Approve */}
              <button
                onMouseDown={() => setPressedBtn("approve")}
                onMouseUp={() => setPressedBtn(null)}
                onMouseLeave={(e) => {
                  setPressedBtn(null);
                  e.currentTarget.style.background = "#0071e3";
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#005bbd";
                }}
                onClick={handleApprove}
                style={{
                  flex: 2,
                  padding: "13px 15px",
                  borderRadius: 10,
                  border: "none",
                  background: "#0071e3",
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.25,0.1,0.25,1)",
                  transform: pressedBtn === "approve" ? "scale(0.975)" : "scale(1)",
                  letterSpacing: -0.2,
                  boxShadow: "0 2px 8px rgba(0,113,227,0.25)",
                }}
              >
                {needsEscalation ? "同意并上报" : "同意"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
