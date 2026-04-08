"use client";

import { ApprovalRecord, ApprovalAction } from "@/types";

interface ApprovalTimelineProps {
  records: ApprovalRecord[];
}

const ACTION_CONFIG: Record<
  ApprovalAction,
  { color: string; label: string }
> = {
  submit:   { color: "#007AFF", label: "提交审批" },
  approve:  { color: "#34C759", label: "审批通过" },
  reject:   { color: "#FF3B30", label: "驳回" },
  escalate: { color: "#5856D6", label: "上报审批" },
  comment:  { color: "#86868b", label: "备注" },
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
        padding: "14px 16px",
        borderLeft: "0.5px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.35)",
        WebkitBackdropFilter: "blur(30px)",
        backdropFilter: "blur(30px)",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#86868b",
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        审批记录
      </div>

      {reversed.length === 0 && (
        <div style={{ fontSize: 13, color: "#86868b", textAlign: "center", padding: 20 }}>
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
                paddingBottom: isLast ? 0 : 20,
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
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: cfg.color,
                    border: "2.5px solid rgba(255,255,255,0.95)",
                    boxShadow: `0 0 0 1.5px ${cfg.color}35, 0 1px 3px rgba(0,0,0,0.06)`,
                    flexShrink: 0,
                  }}
                />
                {!isLast && (
                  <div
                    style={{
                      width: 1.5,
                      flex: 1,
                      marginTop: 4,
                      background: `linear-gradient(180deg, ${cfg.color}40, rgba(0,0,0,0.04))`,
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
                    marginBottom: 2,
                  }}
                >
                  {cfg.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#3c3c43",
                    marginBottom: 1,
                  }}
                >
                  {record.user}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8e8e93",
                    fontVariantNumeric: "tabular-nums",
                    marginBottom: record.comment ? 6 : 0,
                  }}
                >
                  {record.time}
                </div>
                {record.comment && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#3c3c43",
                      background: "rgba(0,0,0,0.03)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      borderLeft: `2px solid ${cfg.color}50`,
                      lineHeight: 1.5,
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
