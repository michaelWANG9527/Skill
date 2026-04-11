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
        padding: "16px 16px",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        background: "#ffffff",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(0,0,0,0.48)",
          letterSpacing: -0.12,
          marginBottom: 20,
        }}
      >
        审批记录
      </div>

      {reversed.length === 0 && (
        <div style={{ fontSize: 14, color: "rgba(0,0,0,0.48)", textAlign: "center", padding: 24, letterSpacing: -0.224 }}>
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
                gap: 12,
                paddingBottom: isLast ? 0 : 24,
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
                  width: 10,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: cfg.color,
                    flexShrink: 0,
                  }}
                />
                {!isLast && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      marginTop: 4,
                      background: "rgba(0,0,0,0.08)",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: cfg.color,
                    marginBottom: 2,
                    letterSpacing: -0.224,
                  }}
                >
                  {cfg.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#1d1d1f",
                    marginBottom: 1,
                    letterSpacing: -0.12,
                  }}
                >
                  {record.user}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(0,0,0,0.48)",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: record.comment ? 8 : 0,
                    letterSpacing: -0.12,
                  }}
                >
                  {record.time}
                </div>
                {record.comment && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(0,0,0,0.8)",
                      background: "#f5f5f7",
                      borderRadius: 6,
                      padding: "8px 10px",
                      lineHeight: 1.43,
                      letterSpacing: -0.12,
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
