import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "订单审批平台 · 希微科技",
  description: "希微科技订单审批管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
