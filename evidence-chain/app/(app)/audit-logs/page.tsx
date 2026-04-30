"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ScrollText, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTION_LABELS } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  targetType?: string;
  ip?: string;
  timestamp: string;
  user: { fullName: string; department: string; username: string };
  document?: { originalName: string };
  metadata?: Record<string, unknown>;
}

const ACTION_COLORS: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
  UPLOAD: "success",
  VIEW: "secondary",
  DOWNLOAD: "default",
  DELETE: "destructive",
  LOGIN: "secondary",
  LOGOUT: "secondary",
  CREATE_USER: "default",
  UPDATE_USER: "warning",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(action ? { action } : {}),
    });
    try {
      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.items);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportCSV = async () => {
    const params = new URLSearchParams({ pageSize: "10000", ...(action ? { action } : {}) });
    const res = await fetch(`/api/audit-logs?${params}`);
    const data = await res.json();
    if (!data.success) return;

    const rows = [
      ["时间", "操作人", "部门", "操作类型", "关联文档", "IP"],
      ...data.data.items.map((l: AuditLog) => [
        format(new Date(l.timestamp), "yyyy/MM/dd HH:mm:ss"),
        l.user.fullName,
        l.user.department,
        ACTION_LABELS[l.action] || l.action,
        l.document?.originalName || "",
        l.ip || "",
      ]),
    ];

    const csv = rows.map((r) => r.map((c: string) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `审计日志_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            审计日志
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            共 {total} 条记录 · 只读，不可修改
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4" strokeWidth={1.5} />
          导出 CSV
        </Button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2">
        <Select value={action} onValueChange={(v) => { setAction(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="全部操作" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部操作</SelectItem>
            {Object.entries(ACTION_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <div className="flex-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <ScrollText className="w-10 h-10 text-apple-gray-3 mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">暂无审计日志</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {/* 表头 */}
              <div className="flex items-center gap-4 px-4 py-2 bg-apple-gray-6 text-xs font-medium text-muted-foreground">
                <span className="w-36 shrink-0">时间</span>
                <span className="w-24 shrink-0">操作人</span>
                <span className="w-20 shrink-0">操作类型</span>
                <span className="flex-1">关联文档</span>
                <span className="w-28 shrink-0">IP 地址</span>
              </div>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-apple-gray-6 transition-colors text-sm"
                >
                  <span className="w-36 shrink-0 font-mono text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "MM/dd HH:mm:ss")}
                  </span>
                  <div className="w-24 shrink-0">
                    <p className="font-medium text-xs truncate">{log.user.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">{log.user.department}</p>
                  </div>
                  <span className="w-20 shrink-0">
                    <Badge variant={ACTION_COLORS[log.action] || "secondary"} className="text-[10px]">
                      {ACTION_LABELS[log.action] || log.action}
                    </Badge>
                  </span>
                  <span className="flex-1 text-xs text-muted-foreground truncate">
                    {log.document?.originalName || "—"}
                  </span>
                  <span className="w-28 shrink-0 font-mono text-[10px] text-muted-foreground">
                    {log.ip || "—"}
                  </span>
                </div>
              ))}
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
