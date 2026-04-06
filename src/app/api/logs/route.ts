import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const role = request.headers.get("x-user-role");

  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.approvalLog.findMany({
    include: {
      order: { select: { erpOrderNo: true, customer: true } },
      user: { select: { displayName: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(logs);
}
