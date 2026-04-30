import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import Link from "next/link";
import {
  Download,
  FileText,
  Shield,
  Clock,
  Link2,
  History,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatFileSize, BIZ_TYPE_LABELS, ACTION_LABELS } from "@/lib/utils";
import { writeAuditLog } from "@/lib/audit";

async function getDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      uploadedBy: { select: { id: true, fullName: true, department: true } },
      links: true,
      versions: {
        orderBy: { version: "desc" },
        select: { id: true, version: true, uploadedAt: true, originalName: true },
      },
      parent: { select: { id: true, version: true, originalName: true } },
      auditLogs: {
        take: 20,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { fullName: true, department: true } } },
      },
    },
  });
}

export default async function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const doc = await getDocument(params.id);

  if (!doc) notFound();

  const isPDF = doc.mimeType === "application/pdf";
  const isImage = doc.mimeType.startsWith("image/");
  const canDelete =
    session?.user?.role === "ADMIN" ||
    (session?.user?.role === "SALES" && doc.uploadedById === session?.user?.id);

  return (
    <div className="max-w-5xl space-y-5">
      {/* 页头 */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-apple-red" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{doc.originalName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              v{doc.version} · {formatFileSize(doc.size)} ·{" "}
              {doc.uploadedBy.fullName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isPDF || isImage) && (
            <a href={`/api/documents/${doc.id}/preview`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                在线预览
              </Button>
            </a>
          )}
          <a href={`/api/documents/${doc.id}/download`}>
            <Button size="sm">
              <Download className="w-4 h-4" strokeWidth={1.5} />
              下载
            </Button>
          </a>
          {canDelete && (
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              删除
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 左侧：文档信息 */}
        <div className="space-y-4">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">文档信息</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">原始文件名</p>
                <p className="font-medium break-all">{doc.originalName}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">文件大小</span>
                <span>{formatFileSize(doc.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">文件类型</span>
                <span className="font-mono text-xs">{doc.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">版本</span>
                <Badge variant="secondary">v{doc.version}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">上传人</span>
                <span>{doc.uploadedBy.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">上传时间</span>
                <span>
                  {format(new Date(doc.uploadedAt), "MM/dd HH:mm", {
                    locale: zhCN,
                  })}
                </span>
              </div>
              {doc.uploadedFromIp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">来源 IP</span>
                  <span className="font-mono text-xs">{doc.uploadedFromIp}</span>
                </div>
              )}
              {doc.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">描述</p>
                  <p className="bg-apple-gray-6 rounded-md p-2 text-xs">
                    {doc.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SHA-256 防篡改 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-apple-green" strokeWidth={1.5} />
                完整性校验
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-2">SHA-256 哈希值</p>
              <p className="font-mono text-[10px] break-all bg-apple-gray-6 rounded-md p-2 select-all text-foreground">
                {doc.sha256}
              </p>
            </CardContent>
          </Card>

          {/* 关联业务对象 */}
          {doc.links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-apple-blue" strokeWidth={1.5} />
                  关联对象
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {doc.links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2 rounded-md bg-apple-gray-6"
                  >
                    <Badge variant="default" className="text-xs">
                      {BIZ_TYPE_LABELS[link.bizType]}
                    </Badge>
                    <span className="font-mono text-xs font-medium text-foreground">
                      {link.bizNo}
                    </span>
                    {link.bizType === "ORDER" && (
                      <Link
                        href={`/orders/${link.bizNo}`}
                        className="text-xs text-apple-blue hover:underline"
                      >
                        查看
                      </Link>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 版本历史 */}
          {(doc.versions.length > 0 || doc.parent) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <History className="w-4 h-4 text-apple-purple" strokeWidth={1.5} />
                  版本历史
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {doc.parent && (
                  <Link
                    href={`/documents/${doc.parent.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-apple-gray-6 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">
                      v{doc.parent.version} (上一版本)
                    </span>
                    <span className="text-xs text-apple-blue">查看</span>
                  </Link>
                )}
                {doc.versions.map((v) => (
                  <Link
                    key={v.id}
                    href={`/documents/${v.id}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-apple-gray-6 transition-colors"
                  >
                    <span className="text-xs">
                      v{v.version}{" "}
                      <span className="text-muted-foreground">
                        · {format(new Date(v.uploadedAt), "M/d HH:mm")}
                      </span>
                    </span>
                    <span className="text-xs text-apple-blue">查看</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：预览 + 审计日志 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 文件预览 */}
          {isPDF && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">在线预览</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <iframe
                  src={`/api/documents/${doc.id}/preview`}
                  className="w-full rounded-lg border border-border"
                  style={{ height: "600px" }}
                  title={doc.originalName}
                />
              </CardContent>
            </Card>
          )}

          {isImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">图片预览</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/documents/${doc.id}/preview`}
                  alt={doc.originalName}
                  className="max-w-full rounded-lg border border-border"
                />
              </CardContent>
            </Card>
          )}

          {/* 审计日志 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                操作记录
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {doc.auditLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  暂无操作记录
                </p>
              ) : (
                <div className="space-y-0">
                  {doc.auditLogs.map((log, idx) => (
                    <div key={log.id}>
                      <div className="flex items-center gap-3 py-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-apple-gray-3 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm">
                            <span className="font-medium">{log.user.fullName}</span>{" "}
                            <span className="text-muted-foreground">
                              {ACTION_LABELS[log.action] || log.action}
                            </span>
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(log.timestamp), "M/d HH:mm")}
                        </span>
                      </div>
                      {idx < doc.auditLogs.length - 1 && (
                        <Separator className="ml-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
