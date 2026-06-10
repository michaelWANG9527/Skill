"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function NewCustomerDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    customerCode: "",
    name: "",
    shortName: "",
    country: "中国",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleCreate = async () => {
    if (!form.customerCode || !form.name) {
      setError("请填写客户编码和客户名称");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerCode: form.customerCode.trim(),
          name: form.name.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "创建失败");
        return;
      }
      setOpen(false);
      setForm({
        customerCode: "",
        name: "",
        shortName: "",
        country: "中国",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
      onCreated();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" strokeWidth={2} />
        新建客户
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新建客户</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">客户编码（ERP 编码）</Label>
                <Input
                  placeholder="C004"
                  value={form.customerCode}
                  onChange={(e) =>
                    setForm({ ...form, customerCode: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">简称（可选）</Label>
                <Input
                  placeholder="华强电子"
                  value={form.shortName}
                  onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">客户名称</Label>
              <Input
                placeholder="深圳市某某电子有限公司"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">国家/地区</Label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">联系人（可选）</Label>
                <Input
                  placeholder="王总"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">联系邮箱（可选）</Label>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">联系电话（可选）</Label>
                <Input
                  placeholder="0755-88888888"
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm({ ...form, contactPhone: e.target.value })
                  }
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-apple-red bg-red-50 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中…
                </>
              ) : (
                "创建客户"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
