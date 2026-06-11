"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  department: string;
  role: string;
  active: boolean;
  createdAt: string;
  _count: { documents: number };
}

const ROLE_VARIANT: Record<string, "default" | "success" | "warning" | "secondary"> = {
  ADMIN: "destructive" as never,
  SALES: "default",
  CS: "success",
  FINANCE: "warning",
  LEGAL: "secondary",
  AUDITOR: "secondary",
  VIEWER: "secondary",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "", email: "", password: "", fullName: "", department: "", role: "VIEWER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setShowDialog(false);
      setForm({ username: "", email: "", password: "", fullName: "", department: "", role: "VIEWER" });
      fetchUsers();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            用户管理
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">共 {users.length} 名用户</p>
        </div>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4" strokeWidth={2} />
          新建用户
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 px-4 py-2 bg-apple-gray-6 text-xs font-medium text-muted-foreground">
                <span className="w-8" />
                <span className="flex-1">用户</span>
                <span className="w-24 shrink-0">部门</span>
                <span className="w-20 shrink-0">角色</span>
                <span className="w-16 shrink-0 text-right">文档数</span>
                <span className="w-24 shrink-0 text-right">创建时间</span>
              </div>
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 px-4 py-3 hover:bg-apple-gray-6 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-apple-blue/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-apple-blue">
                      {u.fullName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{u.username} · {u.email}</p>
                  </div>
                  <span className="w-24 shrink-0 text-sm text-muted-foreground">{u.department}</span>
                  <span className="w-20 shrink-0">
                    <Badge variant={ROLE_VARIANT[u.role] || "secondary"} className="text-[10px]">
                      {ROLE_LABELS[u.role]}
                    </Badge>
                  </span>
                  <span className="w-16 shrink-0 text-right text-sm text-muted-foreground">
                    {u._count.documents}
                  </span>
                  <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                    {format(new Date(u.createdAt), "yyyy/MM/dd")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新建用户对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新建用户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">姓名</Label>
                <Input placeholder="张三" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">用户名</Label>
                <Input placeholder="zhangsan" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">邮箱</Label>
              <Input type="email" placeholder="zhangsan@seekwave.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">密码</Label>
              <Input type="password" placeholder="至少 8 位" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">部门</Label>
                <Input placeholder="销售部" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">角色</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <p className="text-sm text-apple-red bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "创建中…" : "创建用户"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
