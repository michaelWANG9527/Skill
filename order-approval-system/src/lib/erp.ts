/**
 * 鼎捷 T100 ERP 对接客户端（仅服务端使用）
 *
 * 通过环境变量配置连接信息（见项目根目录 .env.example）：
 *   T100_BASE_URL       — T100 ESP 网关地址，如 https://erp.example.com:8080
 *   T100_API_TOKEN      — 网关签发的 API token
 *   T100_ENTERPRISE_NO  — 企业编号
 *   T100_SITE           — 营运据点（工厂别），如 SW01
 *   T100_QUERY_SERVICE  — 订单查询服务名（默认 sales.order.approval.query）
 *   T100_WRITEBACK_SERVICE — 审批回写服务名（默认 sales.order.approval.update）
 *
 * 未配置 T100_BASE_URL 时自动降级为内置演示数据，前端功能不受影响。
 */

import { Order, OrderStatus, ApprovalRecord } from "@/types";
import { ORDERS } from "@/data/mockData";

const cfg = {
  baseUrl: process.env.T100_BASE_URL,
  token: process.env.T100_API_TOKEN,
  enterprise: process.env.T100_ENTERPRISE_NO ?? "99",
  site: process.env.T100_SITE ?? "SW01",
  queryService: process.env.T100_QUERY_SERVICE ?? "sales.order.approval.query",
  writebackService: process.env.T100_WRITEBACK_SERVICE ?? "sales.order.approval.update",
};

export function erpConfigured(): boolean {
  return Boolean(cfg.baseUrl && cfg.token);
}

/** T100 标准报文信封：{ std_data: { parameter: ... } }，返回 execution.code === "0" 表示成功 */
async function callT100<T>(service: string, parameter: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${cfg.baseUrl}/api/${cfg.enterprise}/${service}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      token: cfg.token!,
    },
    body: JSON.stringify({
      std_data: {
        parameter: { site: cfg.site, ...parameter },
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`T100 网关返回 HTTP ${res.status}`);
  }

  const body = await res.json();
  const execution = body?.std_data?.execution;
  if (execution && execution.code !== "0") {
    throw new Error(`T100 业务错误 [${execution.code}]: ${execution.description ?? "未知错误"}`);
  }
  return body?.std_data?.parameter as T;
}

/** T100 单据签核状态码 ↔ 本系统状态映射 */
const T100_STATUS_MAP: Record<string, OrderStatus> = {
  N: "pending",      // 未签核
  S: "escalated",    // 签核中（已上报）
  Y: "gm_approved",  // 已核准
  V: "rejected",     // 已驳回（作废）
};

const STATUS_TO_T100: Record<OrderStatus, string> = {
  pending: "N",
  escalated: "S",
  vp_approved: "Y",
  gm_approved: "Y",
  rejected: "V",
};

/** T100 订单查询返回的原始字段（xmdc = 订单单头档） */
interface T100OrderRow {
  xmdcdocno: string;       // 订单单号
  xmdc001: string;         // 客户编号
  xmdc002: string;         // 客户名称
  xmdcud001: string;       // 料号
  xmdc012: number;         // 数量
  xmdc013: number;         // 美元单价
  xmdc014: number;         // 人民币含税单价
  xmdc015: number;         // 含税总额
  xmdcud002: number;       // 毛利率
  xmdcud003: string;       // 特价标记 Y/N
  xmdcstatus: string;      // 签核状态
  xmdcdate: string;        // 订单日期
  xmdc016: string;         // 要求交期
  xmdcud004: string;       // 终端客户
  xmdcud005: string;       // 终端应用
  xmdc017: string;         // 付款条件
  xmdcud006: string;       // 业务员
  xmdctime: string;        // 同步时间
}

function mapT100Row(row: T100OrderRow): Order {
  return {
    id: row.xmdcdocno,
    customer: row.xmdc002,
    customerCode: row.xmdc001,
    partNumber: row.xmdcud001,
    quantity: row.xmdc012,
    unitPriceUsd: row.xmdc013,
    unitPriceCnyTax: row.xmdc014,
    totalAmountTax: row.xmdc015,
    grossMargin: row.xmdcud002,
    isSpecialPrice: row.xmdcud003 === "Y",
    status: T100_STATUS_MAP[row.xmdcstatus] ?? "pending",
    syncedAt: row.xmdctime,
    salesRep: row.xmdcud006,
    endCustomer: row.xmdcud004,
    endApplication: row.xmdcud005,
    paymentTerms: row.xmdc017,
    orderDate: row.xmdcdate,
    requiredDeliveryDate: row.xmdc016,
    approvalHistory: [],
  };
}

/** 从 T100 拉取待审批订单；未配置 ERP 时返回演示数据 */
export async function fetchOrders(): Promise<{ orders: Order[]; source: "erp" | "mock" }> {
  if (!erpConfigured()) {
    return {
      orders: ORDERS.map((o) => ({ ...o, approvalHistory: [...o.approvalHistory] })),
      source: "mock",
    };
  }
  const result = await callT100<{ order: T100OrderRow[] }>(cfg.queryService, {
    status: "N,S", // 未签核 + 签核中
  });
  return { orders: (result.order ?? []).map(mapT100Row), source: "erp" };
}

/**
 * 审批结果回写 T100：把对应销售订单的签核状态调整为核准/驳回，
 * 并附带审批人与审批意见（写入单据签核历程）。
 */
export async function writebackApproval(params: {
  orderId: string;
  nextStatus: OrderStatus;
  record: ApprovalRecord;
}): Promise<{ source: "erp" | "mock" }> {
  if (!erpConfigured()) {
    // 演示模式：无 ERP 可回写，直接成功
    return { source: "mock" };
  }
  await callT100(cfg.writebackService, {
    docno: params.orderId,
    status: STATUS_TO_T100[params.nextStatus],
    approver: params.record.user,
    approve_time: params.record.time,
    comment: params.record.comment,
  });
  return { source: "erp" };
}
