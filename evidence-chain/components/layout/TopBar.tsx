"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "仪表盘",
  orders: "销售订单",
  customers: "客户管理",
  documents: "文档库",
  upload: "上传文档",
  "audit-logs": "审计日志",
  admin: "管理",
  users: "用户管理",
  settings: "个人设置",
};

export function TopBar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = routeLabels[seg] || decodeURIComponent(seg);
    return { href, label };
  });

  return (
    <header
      className="fixed top-0 left-[var(--sidebar-width)] right-0 h-[var(--topbar-height)] bg-white/80 backdrop-blur-md border-b border-border z-20 flex items-center px-6"
    >
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <Home className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
        {crumbs.map((crumb, idx) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-apple-gray-3" strokeWidth={1.5} />
            {idx === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
