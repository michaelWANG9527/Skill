import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES, ORDER_STATUS, MARGIN_THRESHOLD } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testRole = request.headers.get("x-test-role");
    const role = testRole || request.headers.get("x-user-role");

    // In test mode, look up user by role
    let userId = request.headers.get("x-user-id");
    if (!userId && testRole) {
      const testUser = await prisma.user.findFirst({ where: { role: testRole } });
      userId = testUser?.id || null;
    }

    if (!userId || !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, comment } = await request.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    let newStatus: string;
    let logAction: string;

    if (role === ROLES.SALES_VP) {
      if (order.status !== ORDER_STATUS.PENDING) {
        return NextResponse.json(
          { error: "该订单不在待审批状态" },
          { status: 400 }
        );
      }

      if (action === "reject") {
        newStatus = ORDER_STATUS.REJECTED;
        logAction = "REJECT";
      } else {
        // Auto-escalate if special price or low margin
        if (order.isSpecialPrice || order.grossMargin < MARGIN_THRESHOLD) {
          newStatus = ORDER_STATUS.ESCALATED;
          logAction = "ESCALATE";
        } else {
          newStatus = ORDER_STATUS.VP_APPROVED;
          logAction = "APPROVE";
        }
      }
    } else if (role === ROLES.GM || role === ROLES.RD_VP) {
      if (order.status !== ORDER_STATUS.ESCALATED) {
        return NextResponse.json(
          { error: "该订单不在上报待审状态" },
          { status: 400 }
        );
      }

      if (action === "reject") {
        newStatus = ORDER_STATUS.GM_REJECTED;
        logAction = "GM_REJECT";
      } else {
        newStatus = ORDER_STATUS.GM_APPROVED;
        logAction = "GM_APPROVE";
      }
    } else {
      return NextResponse.json(
        { error: "您没有审批权限" },
        { status: 403 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: params.id },
        data: { status: newStatus },
        include: {
          logs: {
            include: { user: { select: { displayName: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.approvalLog.create({
        data: {
          orderId: params.id,
          userId,
          action: logAction,
          comment: comment || null,
          ipAddress: ip,
        },
      }),
    ]);

    return NextResponse.json(updatedOrder);
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
