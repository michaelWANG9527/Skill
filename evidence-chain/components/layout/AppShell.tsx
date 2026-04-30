"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-apple-gray-6">
      <Sidebar />
      <TopBar />
      <main
        className="ml-[var(--sidebar-width)] pt-[var(--topbar-height)] min-h-screen"
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
