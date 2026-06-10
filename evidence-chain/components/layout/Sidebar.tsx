"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FolderOpen,
  Upload,
  ScrollText,
  Settings,
  UserCog,
  LogOut,
  FileStack,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "仪表盘" },
  { href: "/orders", icon: ShoppingCart, label: "销售订单" },
  { href: "/customers", icon: Users, label: "客户管理" },
  { href: "/documents", icon: FolderOpen, label: "文档库" },
  { href: "/upload", icon: Upload, label: "上传文档" },
  { href: "/settings", icon: Settings, label: "个人设置" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  // 审计日志：管理员 + 审计员可见；用户管理：仅管理员
  const adminNavItems = [
    ...(role === "ADMIN" || role === "AUDITOR"
      ? [{ href: "/audit-logs", icon: ScrollText, label: "审计日志" }]
      : []),
    ...(role === "ADMIN"
      ? [{ href: "/admin/users", icon: UserCog, label: "用户管理" }]
      : []),
  ];
  const isAdmin = adminNavItems.length > 0;

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-white border-r border-border flex flex-col z-30"
      style={{ boxShadow: "1px 0 0 0 #e5e5ea" }}
    >
      {/* Logo 区域 */}
      <div className="h-[var(--topbar-height)] flex items-center px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-apple-blue flex items-center justify-center">
            <FileStack className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">证据链系统</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">SeekWave Technology</p>
          </div>
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150",
                  active
                    ? "bg-apple-blue/10 text-apple-blue font-medium"
                    : "text-apple-gray-1 hover:bg-apple-gray-6 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("w-4 h-4 shrink-0", active ? "text-apple-blue" : "")}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="w-3 h-3 text-apple-blue" strokeWidth={2} />
                )}
              </Link>
            );
          })}
        </div>

        {/* 管理员菜单 */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              管理
            </p>
            <div className="space-y-0.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150",
                      active
                        ? "bg-apple-blue/10 text-apple-blue font-medium"
                        : "text-apple-gray-1 hover:bg-apple-gray-6 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn("w-4 h-4 shrink-0", active ? "text-apple-blue" : "")}
                      strokeWidth={active ? 2 : 1.5}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* 用户信息 + 退出 */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-apple-blue/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-apple-blue">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">
              {session?.user?.name || "用户"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {ROLE_LABELS[session?.user?.role || "VIEWER"]}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-md text-muted-foreground hover:text-apple-red hover:bg-apple-red/10 transition-colors duration-150"
            title="退出登录"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
