"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "确认",
  cancelLabel = "取消",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 340,
          maxWidth: "90vw",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.04)",
          padding: "28px 24px 20px",
          animation: "cardEntrance 0.25s cubic-bezier(0.25,0.1,0.25,1) both",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1d1d1f",
            letterSpacing: -0.3,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "rgba(0,0,0,0.56)",
            letterSpacing: -0.1,
            lineHeight: 1.5,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          {message}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: "rgba(0,0,0,0.05)",
              color: "#1d1d1f",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              letterSpacing: -0.1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: danger ? "#ff3b30" : "#0071e3",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              letterSpacing: -0.1,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
