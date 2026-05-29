"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed top-5 left-1/2 toast-enter z-50"
      style={{ transform: "translateX(-50%)" }}
    >
      <div className="glass-card rounded-2xl px-6 py-2.5 text-sm font-medium text-gray-900 shadow-lg">
        {message}
      </div>
    </div>
  );
}
