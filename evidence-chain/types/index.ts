import { Role, BizType } from "@prisma/client";

export type { Role, BizType };

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DocumentWithLinks {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
  uploadedAt: string;
  description?: string | null;
  version: number;
  uploadedBy: {
    id: string;
    fullName: string;
    department: string;
  };
  links: DocumentLinkItem[];
}

export interface DocumentLinkItem {
  id: string;
  bizType: BizType;
  bizId: string;
  bizNo: string;
}

export interface OrderWithCustomer {
  id: string;
  orderNo: string;
  orderDate: string;
  status: string;
  amount?: string | null;
  currency?: string | null;
  remark?: string | null;
  customer: {
    id: string;
    name: string;
    customerCode: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
