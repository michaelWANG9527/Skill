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
          background: checked ? "#34c759" : "#e5e5ea",
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
            background: "#ffffff",
            boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0px, 0 0 1px rgba(0,0,0,0.06)",
            transition: "left 0.2s ease",
          }}
        />
      </span>
      {label && (
        <span style={{ fontSize: 14, color: "rgba(0,0,0,0.8)", letterSpacing: -0.224 }}>{label}</span>
      )}
    </label>
  );
}
