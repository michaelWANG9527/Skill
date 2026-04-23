"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        top: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(22,22,23,0.82)",
        WebkitBackdropFilter: "saturate(200%) blur(24px)",
        backdropFilter: "saturate(200%) blur(24px)",
        color: "#f5f5f7",
        padding: "12px 28px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: -0.1,
        zIndex: 200,
        animation: "toastIn 0.35s cubic-bezier(0.25,0.1,0.25,1)",
        maxWidth: "90vw",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      {message}
    </div>
  );
}
