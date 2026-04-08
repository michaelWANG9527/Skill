export type UserRole = "销售副总裁" | "总经理";

export interface User {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
}

export type ApprovalAction = "submit" | "approve" | "reject" | "escalate" | "comment";

export interface ApprovalRecord {
  action: ApprovalAction;
  user: string;
  time: string;
  comment: string;
}

export type OrderStatus = "pending" | "vp_approved" | "escalated" | "gm_approved" | "rejected";

export interface Order {
  id: string;
  customer: string;
  customerCode: string;
  partNumber: string;
  quantity: number;
  unitPriceUsd: number;
  unitPriceCnyTax: number;
  totalAmountTax: number;
  grossMargin: number;
  isSpecialPrice: boolean;
  status: OrderStatus;
  syncedAt: string;
  salesRep: string;
  endCustomer: string;
  endApplication: string;
  paymentTerms: string;
  orderDate: string;
  requiredDeliveryDate: string;
  approvalHistory: ApprovalRecord[];
}
