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

/* ── Section title ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#86868b",
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 20,
      }}
    >
      {children}
    </div>
  );
}

/* ── Grid Cell ── */
function Cell({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.85)" }}>
      <div style={{ fontSize: 11, color: "#86868b", marginBottom: 3 }}>{label}</div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: danger ? "#FF3B30" : "#1d1d1f",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ── Info Grid ── */
function InfoGrid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 1,
        background: "rgba(0,0,0,0.04)",
        borderRadius: 12,
        overflow: "hidden",
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
          color: "#86868b",
          fontSize: 15,
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
        padding: "20px 24px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.68)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 8px 40px rgba(0,40,100,0.08), 0 2px 6px rgba(0,0,0,0.03)",
          padding: 24,
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, color: "#1d1d1f" }}>
              {order.customer}
            </div>
            <div style={{ fontSize: 12, color: "#86868b", marginTop: 3 }}>
              ERP: {order.id} &middot; {order.syncedAt}
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
              marginTop: 16,
              padding: "13px 16px",
              borderRadius: 12,
              background: "rgba(255,149,0,0.07)",
              border: "1px solid rgba(255,149,0,0.15)",
              fontSize: 13,
              color: "#8a5500",
              lineHeight: 1.6,
            }}
          >
            {order.isSpecialPrice && (
              <div>⚠ 风险提示：特殊价格订单，审批后将自动上报总经理终审。</div>
            )}
            {order.grossMargin < 15 && (
              <div>⚠ 风险提示：毛利率 {order.grossMargin}% 低于15%标准阈值。</div>
            )}
          </div>
        )}

        {/* ── Approval Actions (only when pending) ── */}
        {isPending && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1d1d1f",
                marginBottom: 10,
              }}
            >
              审批操作
            </div>

            {/* Quick pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {QUICK_OPTIONS.map((opt) => {
                const isActive = selectedPills.has(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => togglePill(opt)}
                    style={{
                      padding: "7px 18px",
                      borderRadius: 22,
                      border: isActive
                        ? "1.5px solid #007AFF"
                        : "1px solid rgba(0,0,0,0.06)",
                      background: isActive
                        ? "rgba(0,122,255,0.08)"
                        : "rgba(255,255,255,0.8)",
                      color: isActive ? "#007AFF" : "#3c3c43",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontWeight: isActive ? 600 : 400,
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
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.6)",
                fontSize: 14,
                color: "#1d1d1f",
                outline: "none",
                resize: "vertical",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(0,122,255,0.5)";
                e.target.style.boxShadow = "0 0 0 4px rgba(0,122,255,0.08)";
                e.target.style.background = "rgba(255,255,255,0.9)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0,0,0,0.06)";
                e.target.style.boxShadow = "none";
                e.target.style.background = "rgba(255,255,255,0.6)";
              }}
            />

            {/* Email CC */}
            <div style={{ marginTop: 12 }}>
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
                          borderRadius: 20,
                          border: isActive ? "none" : "1px solid rgba(0,0,0,0.08)",
                          background: isActive ? "#007AFF" : "rgba(0,0,0,0.03)",
                          color: isActive ? "#fff" : "#3c3c43",
                          fontSize: 12,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontWeight: isActive ? 600 : 400,
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
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              {/* Reject */}
              <button
                onMouseDown={() => setPressedBtn("reject")}
                onMouseUp={() => setPressedBtn(null)}
                onMouseLeave={() => setPressedBtn(null)}
                onClick={handleReject}
                style={{
                  flex: 1,
                  padding: "13px 0",
                  borderRadius: 14,
                  border: "none",
                  background: "rgba(255,59,48,0.08)",
                  color: "#FF3B30",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: pressedBtn === "reject" ? "scale(0.97)" : "scale(1)",
                }}
              >
                拒绝
              </button>

              {/* Approve */}
              <button
                onMouseDown={() => setPressedBtn("approve")}
                onMouseUp={() => setPressedBtn(null)}
                onMouseLeave={() => setPressedBtn(null)}
                onClick={handleApprove}
                style={{
                  flex: 2,
                  padding: "13px 0",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #007AFF, #0055d4)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,122,255,0.25)",
                  transition: "all 0.2s ease",
                  transform: pressedBtn === "approve" ? "scale(0.97)" : "scale(1)",
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
