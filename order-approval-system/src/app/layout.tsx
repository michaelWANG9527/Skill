import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "希微科技 - 销售订单审批系统",
  description: "SeekWave Technology Sales Order Approval System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
