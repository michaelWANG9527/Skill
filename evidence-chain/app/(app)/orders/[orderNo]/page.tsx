import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BizType } from "@prisma/client";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";
import {
  ShoppingCart,
  Building2,
  Calendar,
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  Download,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getOrderData(orderNo: string) {
  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { customer: true },
  });

  if (!order) return null;

  const links = await prisma.documentLink.findMany({
    where: { bizType: BizType.ORDER, bizNo: orderNo },
    include: {
      document: {
        include: {
          uploadedBy: { select: { fullName: true, department: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { order, documents: links.map((l) => l.document) };
}

function getFileTypeLabel(mimeType: string) {
  if (mimeType === "application/pdf") return { label: "PDF", icon: FileText, color: "text-apple-red" };
  if (mimeType.startsWith("image/")) return { label: "图片", icon: Image, color: "text-apple-green" };
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return { label: "Excel", icon: FileSpreadsheet, color: "text-[#1D6F42]" };
  return { label: "文档", icon: FileText, color: "text-apple-blue" };
}

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "secondary"> = {
  已确认: "success",
  执行中: "default",
  已完成: "secondary",
  已取消: "secondary",
  待确认: "warning",
};

export default async function OrderDetailPage({
  params,
}: {
  params: { orderNo: string };
}) {
  const session = await getServerSession(authOptions);
  const data = await getOrderData(params.orderNo);
  if (!data) notFound();

  const { order, documents } = data;
  const canUpload = session?.user?.role
    ? ["ADMIN", "SALES", "CS"].includes(session.user.role)
    : false;

  return (
    <div className="max-w-5xl space-y-5">
      {/* 页头 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-5 h-5 text-apple-blue" strokeWidth={1.5} />
            <h1 className="text-xl font-semibold">{order.orderNo}</h1>
            <Badge variant={STATUS_VARIANTS[order.status] || "secondary"}>
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {order.customer.name} · {format(new Date(order.orderDate), "yyyy年M月d日", { locale: zhCN })}
          </p>
        </div>
        {canUpload && (
          <Link
            href={`/upload?bizType=ORDER&bizNo=${order.orderNo}&bizId=${order.orderNo}`}
          >
            <Button size="sm">
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              上传文档
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 左侧：订单信息 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">订单信息</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">订单编号</span>
                <span className="font-mono font-medium">{order.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">下单日期</span>
                <span>{format(new Date(order.orderDate), "yyyy/MM/dd")}</span>
              </div>
              {order.amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">金额</span>
                  <span className="font-semibold">
                    {order.currency || "CNY"}{" "}
                    {Number(order.amount).toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">状态</span>
                <Badge variant={STATUS_VARIANTS[order.status] || "secondary"}>
                  {order.status}
                </Badge>
              </div>
              {order.remark && (
                <div>
                  <span className="text-muted-foreground">备注</span>
                  <p className="mt-1 text-foreground bg-apple-gray-6 rounded-md p-2 text-xs">
                    {order.remark}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">客户信息</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  {order.customer.shortName && (
                    <p className="text-xs text-muted-foreground">
                      {order.customer.shortName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">客户编码</span>
                <span className="font-mono">{order.customer.customerCode}</span>
              </div>
              {order.customer.country && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">国家/地区</span>
                  <span>{order.customer.country}</span>
                </div>
              )}
              <Link
                href={`/customers?code=${order.customer.customerCode}`}
                className="text-xs text-apple-blue hover:underline"
              >
                查看客户详情 →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：关联文档 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  关联文档
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    共 {documents.length} 份
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {documents.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-apple-gray-6 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-apple-gray-3" strokeWidth={1} />
                  </div>
                  <p className="text-sm text-muted-foreground">暂无关联文档</p>
                  {canUpload && (
                    <Link
                      href={`/upload?bizType=ORDER&bizNo=${order.orderNo}&bizId=${order.orderNo}`}
                    >
                      <Button variant="outline" size="sm" className="mt-3">
                        <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
                        上传第一份文档
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const fileType = getFileTypeLabel(doc.mimeType);
                    const FileIcon = fileType.icon;
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-apple-gray-6 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-apple-gray-6 group-hover:bg-white group-hover:shadow-apple flex items-center justify-center shrink-0 transition-all">
                          <FileIcon
                            className={`w-5 h-5 ${fileType.color}`}
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.uploadedBy.fullName} ·{" "}
                            {format(new Date(doc.uploadedAt), "M月d日 HH:mm")} ·{" "}
                            {formatFileSize(doc.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/documents/${doc.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </Button>
                          </Link>
                          <a href={`/api/documents/${doc.id}/download`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </Button>
                          </a>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          v{doc.version}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
