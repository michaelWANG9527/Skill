"use client";

export default function WarningTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-500">
      ⚠ {label}
    </span>
  );
}
