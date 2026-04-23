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
          width: 42,
          height: 26,
          borderRadius: 13,
          background: checked ? "#34c759" : "rgba(0,0,0,0.12)",
          transition: "background 0.25s cubic-bezier(0.25,0.1,0.25,1)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.06)",
            transition: "left 0.25s cubic-bezier(0.25,0.1,0.25,1)",
          }}
        />
      </span>
      {label && (
        <span style={{ fontSize: 13, color: "rgba(0,0,0,0.72)", letterSpacing: -0.1 }}>{label}</span>
      )}
    </label>
  );
}
