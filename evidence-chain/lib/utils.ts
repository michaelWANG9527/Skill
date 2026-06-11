import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHash } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 计算 Buffer 的 SHA-256 哈希（防篡改证据）
export function calculateSHA256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 生成唯一存储 key
export function generateStorageKey(
  bizType: string,
  originalName: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop() || "bin";
  return `${bizType}/${timestamp}-${random}.${ext}`;
}

// 获取文件 MIME 类型对应的图标名
export function getMimeTypeLabel(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType.includes("docx")
  )
    return "Word";
  if (mimeType.includes("excel") || mimeType.includes("sheet")) return "Excel";
  if (mimeType.startsWith("image/")) return "图片";
  return "文件";
}

// 业务类型取值（替代数据库枚举，兼容 SQLite；API 层用 Zod 校验）
export const BIZ_TYPES = [
  "ORDER",
  "CUSTOMER",
  "CONTRACT",
  "QUOTATION",
  "RECONCILIATION",
  "REBATE",
] as const;
export type BizType = (typeof BIZ_TYPES)[number];

// 角色取值
export const ROLES = [
  "ADMIN",
  "SALES",
  "CS",
  "FINANCE",
  "LEGAL",
  "AUDITOR",
  "VIEWER",
] as const;
export type Role = (typeof ROLES)[number];

// 业务类型中文名
export const BIZ_TYPE_LABELS: Record<string, string> = {
  ORDER: "销售订单",
  CUSTOMER: "客户",
  CONTRACT: "销售合同",
  QUOTATION: "客户报价",
  RECONCILIATION: "对账单",
  REBATE: "返利单",
};

// 角色中文名
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理员",
  SALES: "销售",
  CS: "客服",
  FINANCE: "财务",
  LEGAL: "法务",
  AUDITOR: "审计员",
  VIEWER: "访客",
};

// 操作类型中文名
export const ACTION_LABELS: Record<string, string> = {
  UPLOAD: "上传文件",
  VIEW: "查看文件",
  DOWNLOAD: "下载文件",
  DELETE: "删除文件",
  LOGIN: "用户登录",
  LOGOUT: "用户登出",
  CREATE_USER: "创建用户",
  UPDATE_USER: "更新用户",
  CHANGE_PASSWORD: "修改密码",
  LINK_DOCUMENT: "关联文档",
};

// 统一 API 响应格式
export function apiSuccess<T>(data: T, message?: string) {
  return Response.json({ success: true, data, message });
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
