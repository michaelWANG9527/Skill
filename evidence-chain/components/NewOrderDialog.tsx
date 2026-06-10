"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
  customerCode: string;
}

const ORDER_STATUSES = ["待确认", "已确认", "执行中", "已完成", "已取消"];

export function NewOrderDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    orderNo: "",
    customerId: "",
    orderDate: new Date().toISOString().slice(0, 10),
    amount: "",
    status: "待确认",
    remark: "",
  });

  useEffect(() => {
    if (!open) return;
    fetch("/api/customers?pageSize=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCustomers(d.data.items);
      })
      .catch(() => {});
  }, [open]);

  const handleCreate = async () => {
    if (!form.orderNo || !form.customerId) {
      setError("请填写订单号并选择客户");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: form.orderNo.trim(),
          customerId: form.customerId,
          orderDate: form.orderDate,
          amount: form.amount ? parseFloat(form.amount) : undefined,
          status: form.status,
          remark: form.remark || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "创建失败");
        return;
      }
      setOpen(false);
      setForm({
        orderNo: "",
        customerId: "",
        orderDate: new Date().toISOString().slice(0, 10),
        amount: "",
        status: "待确认",
        remark: "",
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
        新建订单
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新建销售订单</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">订单号</Label>
                <Input
                  placeholder="SO-2026-005"
                  value={form.orderNo}
                  onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">下单日期</Label>
                <Input
                  type="date"
                  value={form.orderDate}
                  onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">客户</Label>
              <Select
                value={form.customerId}
                onValueChange={(v) => setForm({ ...form, customerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择客户" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}（{c.customerCode}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">金额（CNY，可选）</Label>
                <Input
                  type="number"
                  placeholder="258000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">状态</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">备注（可选）</Label>
              <Input
                placeholder="如：Wi-Fi 6 芯片量产订单"
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
              />
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
                "创建订单"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
