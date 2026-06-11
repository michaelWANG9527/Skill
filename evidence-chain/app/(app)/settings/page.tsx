"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { KeyRound, History, CheckCircle2, Loader2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ACTION_LABELS, ROLE_LABELS } from "@/lib/utils";

interface ActivityLog {
  id: string;
  action: string;
  ip?: string;
  timestamp: string;
  document?: { originalName: string };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me/activity")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLogs(d.data);
      })
      .finally(() => setLogsLoading(false));
  }, []);

  const handleChangePassword = async () => {
    setMessage(null);
    if (!oldPassword || !newPassword) {
      setMessage({ type: "err", text: "请填写当前密码和新密码" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "err", text: "新密码至少 8 位" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "err", text: "两次输入的新密码不一致" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage({ type: "err", text: data.error || "修改失败" });
        return;
      }
      setMessage({ type: "ok", text: "密码修改成功" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({ type: "err", text: "网络错误，请稍后重试" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold">个人设置</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          账号信息、密码与操作历史
        </p>
      </div>

      {/* 账号信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <UserCircle className="w-4 h-4 text-apple-blue" strokeWidth={1.5} />
            账号信息
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-apple-blue/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-apple-blue">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <div className="text-right space-y-1">
              <Badge variant="default">{ROLE_LABELS[session?.user?.role || "VIEWER"]}</Badge>
              <p className="text-xs text-muted-foreground">{session?.user?.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 修改密码 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-apple-orange" strokeWidth={1.5} />
            修改密码
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">当前密码</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">新密码（至少 8 位）</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">确认新密码</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
          {message && (
            <p
              className={
                message.type === "ok"
                  ? "text-sm text-apple-green flex items-center gap-1.5"
                  : "text-sm text-apple-red bg-red-50 rounded-md px-3 py-2"
              }
            >
              {message.type === "ok" && (
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              )}
              {message.text}
            </p>
          )}
          <Button onClick={handleChangePassword} disabled={saving} size="sm">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中…
              </>
            ) : (
              "保存新密码"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 我的操作历史 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-1.5">
            <History className="w-4 h-4 text-apple-purple" strokeWidth={1.5} />
            我的操作历史（最近 50 条）
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {logsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              暂无操作记录
            </p>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {ACTION_LABELS[log.action] || log.action}
                  </Badge>
                  <span className="flex-1 text-xs text-muted-foreground truncate">
                    {log.document?.originalName || "—"}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {format(new Date(log.timestamp), "MM/dd HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
