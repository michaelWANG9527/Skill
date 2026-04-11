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
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.8)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        backdropFilter: "saturate(180%) blur(20px)",
        color: "#ffffff",
        padding: "12px 28px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 400,
        letterSpacing: -0.224,
        zIndex: 200,
        animation: "toastIn 0.3s ease",
        maxWidth: "90vw",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}
