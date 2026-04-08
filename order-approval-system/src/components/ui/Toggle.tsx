"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <span
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: 44,
          height: 26,
          borderRadius: 13,
          background: checked ? "#34C759" : "#e5e5ea",
          transition: "background 0.2s ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.06)",
            transition: "left 0.2s ease",
          }}
        />
      </span>
      {label && (
        <span style={{ fontSize: 13, color: "#3c3c43" }}>{label}</span>
      )}
    </label>
  );
}
