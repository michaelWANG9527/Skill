import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  FolderOpen,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
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
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { uploadedAt: { gte: todayStart } } }),
    prisma.document.count({ where: { uploadedAt: { gte: weekStart } } }),
    prisma.order.count(),
    prisma.customer.count({ where: { active: true } }),
    prisma.document.aggregate({ _sum: { size: true } }),
    prisma.document.findMany({
      take: 8,
      orderBy: { uploadedAt: "desc" },
      include: {
        uploadedBy: { select: { fullName: true } },
        links: true,
      },
    }),
  ]);

  return {
    totalDocs,
    todayDocs,
    weekDocs,
    totalOrders,
    totalCustomers,
    storageUsed: totalSize._sum.size || 0,
    recentDocs,
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

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          早上好，{session?.user?.name?.split("")[0]}
          {session?.user?.name?.slice(1)} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "yyyy年M月d日 EEEE", { locale: zhCN })}
        </p>
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

      {/* 最近上传 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>最近上传</CardTitle>
            <Link
              href="/documents"
              className="text-sm text-apple-blue hover:underline"
            >
              查看全部
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {stats.recentDocs.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen
                className="w-10 h-10 text-apple-gray-3 mx-auto mb-3"
                strokeWidth={1}
              />
              <p className="text-sm text-muted-foreground">暂无文档</p>
              <p className="text-xs text-muted-foreground mt-1">
                点击「上传文档」开始上传第一份文件
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {stats.recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center gap-4 py-3.5 px-1 hover:bg-apple-gray-6 rounded-md -mx-1 px-2 transition-colors duration-150 group"
                >
                  {/* 文件类型标识 */}
                  <div className="w-9 h-9 rounded-lg bg-apple-gray-6 flex items-center justify-center shrink-0 text-xs font-bold text-apple-gray-1 group-hover:bg-apple-gray-5">
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
                      {doc.uploadedBy.fullName} ·{" "}
                      {format(new Date(doc.uploadedAt), "M月d日 HH:mm")}
                    </p>
                  </div>
                  {doc.links.length > 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      {doc.links.length} 个关联
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
