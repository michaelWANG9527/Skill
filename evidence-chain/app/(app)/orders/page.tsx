"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NewOrderDialog } from "@/components/NewOrderDialog";

interface Order {
  id: string;
  orderNo: string;
  orderDate: string;
  status: string;
  amount?: number;
  currency?: string;
  documentCount: number;
  customer: { id: string; name: string; customerCode: string };
}

const STATUS_VARIANTS: Record<string, "default" | "success" | "warning" | "secondary"> = {
  已确认: "success",
  执行中: "default",
  已完成: "secondary",
  已取消: "secondary",
  待确认: "warning",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      ...(keyword ? { keyword } : {}),
    });
    try {
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.items);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">销售订单</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            共 {total} 个订单
          </p>
        </div>
        <NewOrderDialog onCreated={fetchOrders} />
      </div>

      {/* 搜索栏 */}
      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder="搜索订单号、客户名…"
          className="pl-9"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* 订单列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart
                className="w-10 h-10 text-apple-gray-3 mx-auto mb-3"
                strokeWidth={1}
              />
              <p className="text-sm text-muted-foreground">
                {keyword ? "未找到匹配订单" : "暂无订单数据"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.orderNo}`}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-apple-gray-6 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-apple-gray-6 group-hover:bg-white group-hover:shadow-apple flex items-center justify-center shrink-0 transition-all">
                    <ShoppingCart
                      className="w-4.5 h-4.5 text-apple-blue"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-mono">
                        {order.orderNo}
                      </span>
                      <Badge
                        variant={STATUS_VARIANTS[order.status] || "secondary"}
                      >
                        {order.status}
                      </Badge>
                      {order.documentCount > 0 ? (
                        <Badge variant="secondary" className="text-[10px]">
                          📎 {order.documentCount} 份
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          无归档
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.customer.name} ·{" "}
                      {format(new Date(order.orderDate), "yyyy/MM/dd")}
                      {order.amount && (
                        <span className="ml-2 font-medium text-foreground">
                          {order.currency || "CNY"}{" "}
                          {Number(order.amount).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-apple-gray-3 group-hover:text-apple-gray-1 transition-colors"
                    strokeWidth={1.5}
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {total > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            第 {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, total)} 条，共 {total} 条
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= total}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
