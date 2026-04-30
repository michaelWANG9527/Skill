"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Search, Users, ChevronRight, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Customer {
  id: string;
  customerCode: string;
  name: string;
  shortName?: string;
  country?: string;
  contactName?: string;
  createdAt: string;
  _count: { orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ ...(keyword ? { keyword } : {}) });
    try {
      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.items);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">客户管理</h1>
        <p className="text-sm text-muted-foreground mt-0.5">共 {total} 家客户</p>
      </div>

      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder="搜索客户名、编码…"
          className="pl-9"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-apple-gray-3 mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm text-muted-foreground">
                {keyword ? "未找到匹配客户" : "暂无客户数据"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-apple-gray-6 transition-colors group cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-apple-blue/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-apple-blue">
                      {c.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.name}</span>
                      {c.shortName && (
                        <span className="text-xs text-muted-foreground">
                          ({c.shortName})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{c.customerCode}</span>
                      {c.country && ` · ${c.country}`}
                      {c.contactName && ` · 联系人：${c.contactName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{c._count.orders} 个订单</Badge>
                    <ChevronRight
                      className="w-4 h-4 text-apple-gray-3"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
