import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES, ORDER_STATUS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const role = request.headers.get("x-user-role");

  let where = {};

  if (role === ROLES.SALES_VP) {
    where = {
      status: {
        in: [
          ORDER_STATUS.PENDING,
          ORDER_STATUS.VP_APPROVED,
          ORDER_STATUS.ESCALATED,
          ORDER_STATUS.REJECTED,
        ],
      },
    };
  } else if (role === ROLES.GM || role === ROLES.RD_VP) {
    where = {
      status: {
        in: [
          ORDER_STATUS.ESCALATED,
          ORDER_STATUS.GM_APPROVED,
          ORDER_STATUS.GM_REJECTED,
          ORDER_STATUS.VP_APPROVED,
        ],
      },
    };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { syncedAt: "desc" },
    include: {
      logs: {
        include: { user: { select: { displayName: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json(orders);
}
