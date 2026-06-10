import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-apple-gray-6 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-apple-md flex items-center justify-center mx-auto mb-5">
          <FileQuestion className="w-8 h-8 text-apple-gray-2" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-semibold text-foreground">页面不存在</h1>
        <p className="text-sm text-muted-foreground mt-2">
          您访问的页面可能已删除，或订单号 / 文档编号有误
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-5 px-5 py-2 rounded-md bg-apple-blue text-white text-sm font-medium hover:bg-[#0066DD] transition-colors duration-200 active:scale-[0.98]"
        >
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
