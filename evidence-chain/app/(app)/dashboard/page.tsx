import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFileSize, ACTION_LABELS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FolderOpen,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  PlusCircle,
  FileText,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { format, startOfDay, startOfWeek } from "date-fns";
import { zhCN } from "date-fns/locale";

async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const [
    totalDocs,
    todayDocs,
    weekDocs,
    totalOrders,
    totalCustomers,
    totalSize,
    recentDocs,
    recentActivity,
    docsByType,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { uploadedAt: { gte: todayStart } } }),
    prisma.document.count({ where: { uploadedAt: { gte: weekStart } } }),
    prisma.order.count(),
    prisma.customer.count({ where: { active: true } }),
    prisma.document.aggregate({ _sum: { size: true } }),
    prisma.document.findMany({
      take: 5,
      orderBy: { uploadedAt: "desc" },
      include: {
        uploadedBy: { select: { fullName: true } },
        links: true,
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { timestamp: "desc" },
      include: { user: { select: { fullName: true } } },
    }),
    prisma.document.groupBy({
      by: ["mimeType"],
      _count: { id: true },
    }),
  ]);

  const pdfCount = docsByType.filter(d => d.mimeType === "application/pdf").reduce((s, d) => s + d._count.id, 0);
  const imgCount = docsByType.filter(d => d.mimeType.startsWith("image/")).reduce((s, d) => s + d._count.id, 0);
  const xlsCount = docsByType.filter(d => d.mimeType.includes("sheet") || d.mimeType.includes("excel")).reduce((s, d) => s + d._count.id, 0);
  const otherCount = totalDocs - pdfCount - imgCount - xlsCount;

  return {
    totalDocs,
    todayDocs,
    weekDocs,
    totalOrders,
    totalCustomers,
    storageUsed: totalSize._sum.size || 0,
    recentDocs,
    recentActivity,
    docsByType: { pdf: pdfCount, img: imgCount, xls: xlsCount, other: otherCount },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "今日上传",
      value: stats.todayDocs,
      unit: "份",
      icon: Upload,
      color: "text-apple-blue",
      bg: "bg-apple-blue/10",
    },
    {
      title: "本周新增",
      value: stats.weekDocs,
      unit: "份",
      icon: TrendingUp,
      color: "text-apple-green",
      bg: "bg-apple-green/10",
    },
    {
      title: "文档总数",
      value: stats.totalDocs,
      unit: "份",
      icon: FolderOpen,
      color: "text-apple-purple",
      bg: "bg-apple-purple/10",
    },
    {
      title: "存储用量",
      value: formatFileSize(stats.storageUsed),
      unit: "",
      icon: Clock,
      color: "text-apple-orange",
      bg: "bg-apple-orange/10",
    },
    {
      title: "销售订单",
      value: stats.totalOrders,
      unit: "个",
      icon: ShoppingCart,
      color: "text-apple-blue",
      bg: "bg-apple-blue/10",
    },
    {
      title: "活跃客户",
      value: stats.totalCustomers,
      unit: "家",
      icon: Users,
      color: "text-apple-green",
      bg: "bg-apple-green/10",
    },
  ];

  // 按上海时区显示问候语
  const hour = parseInt(
    new Intl.DateTimeFormat("zh-CN", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(new Date())
  );
  const greeting =
    hour < 6 ? "夜深了" : hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}，{session?.user?.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "yyyy年M月d日 EEEE", { locale: zhCN })}
          </p>
        </div>
        {/* 快速操作 */}
        <div className="flex items-center gap-2">
          <Link href="/upload">
            <Button size="sm" className="gap-1.5">
              <Upload className="w-3.5 h-3.5" strokeWidth={2} />
              上传文档
            </Button>
          </Link>
          <Link href="/orders">
            <Button size="sm" variant="outline" className="gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" strokeWidth={2} />
              新建订单
            </Button>
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="card-hover">
              <CardContent className="pt-5 pb-4">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {card.value}
                  {card.unit && (
                    <span className="text-sm font-normal text-muted-foreground ml-0.5">
                      {card.unit}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 文档类型分布 */}
      {stats.totalDocs > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              文档类型分布
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "PDF", count: stats.docsByType.pdf, color: "bg-red-100 text-apple-red" },
                { label: "图片", count: stats.docsByType.img, color: "bg-green-100 text-apple-green" },
                { label: "Excel", count: stats.docsByType.xls, color: "bg-emerald-100 text-[#1D6F42]" },
                { label: "其他", count: stats.docsByType.other, color: "bg-apple-gray-6 text-apple-gray-1" },
              ].map(({ label, count, color }) => (
                <div key={label} className={`rounded-xl p-3 ${color}`}>
                  <p className="text-2xl font-semibold">{count}</p>
                  <p className="text-xs mt-0.5 opacity-70">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 最近上传 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">最近上传</CardTitle>
              <Link href="/documents" className="text-xs text-apple-blue hover:underline">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentDocs.length === 0 ? (
              <div className="py-10 text-center">
                <FolderOpen className="w-8 h-8 text-apple-gray-3 mx-auto mb-2" strokeWidth={1} />
                <p className="text-sm text-muted-foreground">暂无文档</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recentDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-3 py-3 hover:bg-apple-gray-6 rounded-md -mx-1 px-2 transition-colors duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-apple-gray-6 flex items-center justify-center shrink-0 text-[10px] font-bold text-apple-gray-1 group-hover:bg-apple-gray-5">
                      {doc.mimeType === "application/pdf"
                        ? "PDF"
                        : doc.mimeType.includes("word")
                        ? "DOC"
                        : doc.mimeType.includes("sheet")
                        ? "XLS"
                        : doc.mimeType.startsWith("image")
                        ? "IMG"
                        : "FILE"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {doc.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.uploadedBy.fullName} · {format(new Date(doc.uploadedAt), "M/d HH:mm")}
                      </p>
                    </div>
                    {doc.links.length > 0 && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {doc.links.length} 关联
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近操作记录 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                最近操作
              </CardTitle>
              <Link href="/audit-logs" className="text-xs text-apple-blue hover:underline">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentActivity.length === 0 ? (
              <div className="py-10 text-center">
                <Clock className="w-8 h-8 text-apple-gray-3 mx-auto mb-2" strokeWidth={1} />
                <p className="text-sm text-muted-foreground">暂无操作记录</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-apple-blue shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">{log.user.fullName}</span>
                        <span className="text-muted-foreground ml-1">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(log.timestamp), "M/d HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
