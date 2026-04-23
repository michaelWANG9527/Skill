"use client";

import { ApprovalRecord, ApprovalAction } from "@/types";

interface ApprovalTimelineProps {
  records: ApprovalRecord[];
}

const ACTION_CONFIG: Record<
  ApprovalAction,
  { color: string; label: string }
> = {
  submit:   { color: "#0071e3", label: "提交审批" },
  approve:  { color: "#34c759", label: "审批通过" },
  reject:   { color: "#ff3b30", label: "驳回" },
  escalate: { color: "#af52de", label: "上报审批" },
  comment:  { color: "#8e8e93", label: "备注" },
};

export default function ApprovalTimeline({ records }: ApprovalTimelineProps) {
  const reversed = [...records].reverse();

  return (
    <div
      style={{
        width: 260,
        minWidth: 260,
        height: "100%",
        overflowY: "auto",
        padding: "18px 18px",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        background: "#fbfbfd",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(0,0,0,0.38)",
          letterSpacing: 0.6,
          textTransform: "uppercase",
          marginBottom: 22,
        }}
      >
        审批记录
      </div>

      {reversed.length === 0 && (
        <div style={{ fontSize: 13, color: "rgba(0,0,0,0.36)", textAlign: "center", padding: 28, letterSpacing: -0.1 }}>
          暂无记录
        </div>
      )}

      <div style={{ position: "relative" }}>
        {reversed.map((record, i) => {
          const cfg = ACTION_CONFIG[record.action];
          const isLast = i === reversed.length - 1;
          return (
            <div
              key={`${record.time}-${i}`}
              style={{
                display: "flex",
                gap: 14,
                paddingBottom: isLast ? 0 : 26,
                position: "relative",
                animation: i === 0 ? "fadeSlideIn 0.3s ease" : undefined,
              }}
            >
              {/* Timeline dot + line */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                  width: 12,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: i === 0 ? cfg.color : "transparent",
                    border: i === 0 ? "none" : `2px solid ${cfg.color}`,
                    flexShrink: 0,
                    boxShadow: i === 0 ? `0 0 0 3px ${cfg.color}22` : "none",
                    transition: "all 0.3s ease",
                  }}
                />
                {!isLast && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      marginTop: 5,
                      background: "rgba(0,0,0,0.06)",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: cfg.color,
                    marginBottom: 3,
                    letterSpacing: -0.1,
                  }}
                >
                  {cfg.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#1d1d1f",
                    marginBottom: 2,
                    letterSpacing: -0.08,
                    fontWeight: 500,
                  }}
                >
                  {record.user}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(0,0,0,0.38)",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: record.comment ? 8 : 0,
                    letterSpacing: 0,
                    fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  }}
                >
                  {record.time}
                </div>
                {record.comment && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(0,0,0,0.72)",
                      background: "rgba(0,0,0,0.03)",
                      borderRadius: 8,
                      border: "1px solid rgba(0,0,0,0.04)",
                      padding: "8px 12px",
                      lineHeight: 1.5,
                      letterSpacing: -0.08,
                    }}
                  >
                    {record.comment}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
