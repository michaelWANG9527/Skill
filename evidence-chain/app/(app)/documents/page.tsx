"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  FolderOpen,
  SlidersHorizontal,
  FileText,
  Image,
  FileSpreadsheet,
  Eye,
  Download,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFileSize, BIZ_TYPE_LABELS } from "@/lib/utils";

interface Document {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  version: number;
  description?: string;
  uploadedBy: { fullName: string; department: string };
  links: Array<{ bizType: string; bizNo: string }>;
}

function getFileInfo(mimeType: string) {
  if (mimeType === "application/pdf")
    return { label: "PDF", icon: FileText, color: "text-apple-red", bg: "bg-red-50" };
  if (mimeType.startsWith("image/"))
    return { label: "图片", icon: Image, color: "text-apple-green", bg: "bg-green-50" };
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return { label: "Excel", icon: FileSpreadsheet, color: "text-[#1D6F42]", bg: "bg-emerald-50" };
  return { label: "文档", icon: FileText, color: "text-apple-blue", bg: "bg-blue-50" };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [bizType, setBizType] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(keyword ? { keyword } : {}),
      ...(bizType ? { bizType } : {}),
      ...(bizNo ? { bizNo } : {}),
    });
    try {
      const res = await fetch(`/api/documents?${params}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data.items);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, keyword, bizType, bizNo]);

  useEffect(() => {
    const t = setTimeout(fetchDocs, 300);
    return () => clearTimeout(t);
  }, [fetchDocs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">文档库</h1>
          <p className="text-sm text-muted-foreground mt-0.5">共 {total} 份文档</p>
        </div>
        <Link href="/upload">
          <Button size="sm">上传文档</Button>
        </Link>
      </div>

      {/* 搜索与筛选 */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="搜索文件名、描述…"
            className="pl-9"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-apple-blue text-apple-blue" : ""}
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          筛选
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-3 items-end">
              <div className="w-40">
                <p className="text-xs text-muted-foreground mb-1.5">业务类型</p>
                <Select value={bizType} onValueChange={(v) => { setBizType(v === "ALL" ? "" : v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="全部类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">全部类型</SelectItem>
                    {Object.entries(BIZ_TYPE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 max-w-xs">
                <p className="text-xs text-muted-foreground mb-1.5">业务编号</p>
                <Input
                  placeholder="如 SO-2026-001"
                  className="h-8 text-xs"
                  value={bizNo}
                  onChange={(e) => { setBizNo(e.target.value); setPage(1); }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setBizType(""); setBizNo(""); setKeyword(""); }}
                className="text-xs"
              >
                清空筛选
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 文档列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center">
              <FolderOpen className="w-10 h-10 text-apple-gray-3 mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">
                {keyword || bizType || bizNo ? "未找到匹配文档" : "文档库为空"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {documents.map((doc) => {
                const fileInfo = getFileInfo(doc.mimeType);
                const FileIcon = fileInfo.icon;
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-apple-gray-6 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${fileInfo.bg} flex items-center justify-center shrink-0`}>
                      <FileIcon className={`w-5 h-5 ${fileInfo.color}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/documents/${doc.id}`} className="hover:underline">
                        <p className="text-sm font-medium truncate">{doc.originalName}</p>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {doc.uploadedBy.fullName} · {format(new Date(doc.uploadedAt), "M月d日 HH:mm")} · {formatFileSize(doc.size)}
                        </span>
                        {doc.links.slice(0, 2).map((l, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] py-0">
                            {BIZ_TYPE_LABELS[l.bizType]} {l.bizNo}
                          </Badge>
                        ))}
                      </div>
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
                      <Link href={`/documents/${doc.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {total > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>第 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} 条，共 {total} 条</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>上一页</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= total}>下一页</Button>
          </div>
        </div>
      )}
    </div>
  );
}
