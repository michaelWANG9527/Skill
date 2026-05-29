import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // Create users
  const users = [
    { username: "sales_vp", role: "SALES_VP", displayName: "销售副总裁" },
    { username: "rd_vp", role: "RD_VP", displayName: "研发副总裁" },
    { username: "gm", role: "GM", displayName: "总经理" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: { ...u, password: passwordHash },
    });
  }

  // Create mock orders
  const orders = [
    {
      erpOrderNo: "SO240401-0087",
      customer: "小米科技有限公司",
      customerCode: "C-XM-001",
      partNumber: "SWT6621-AH",
      quantity: 50000,
      unitPrice: 2.85,
      totalAmount: 142500.0,
      currency: "CNY",
      grossMargin: 12.5,
      isSpecialPrice: true,
      status: "PENDING",
      salesRep: "Lisa Chen",
      syncedAt: new Date("2026-04-06T09:32:00Z"),
    },
    {
      erpOrderNo: "SO240401-0088",
      customer: "影石创新科技",
      customerCode: "C-YS-003",
      partNumber: "SWT6621-SE",
      quantity: 20000,
      unitPrice: 3.2,
      totalAmount: 64000.0,
      currency: "CNY",
      grossMargin: 28.3,
      isSpecialPrice: false,
      status: "PENDING",
      salesRep: "Lisa Chen",
      syncedAt: new Date("2026-04-06T10:15:00Z"),
    },
    {
      erpOrderNo: "SO240401-0091",
      customer: "Microsoft (Teams Project)",
      customerCode: "C-MS-007",
      partNumber: "SWT6621-G",
      quantity: 100000,
      unitPrice: 2.45,
      totalAmount: 245000.0,
      currency: "USD",
      grossMargin: 18.7,
      isSpecialPrice: false,
      status: "PENDING",
      salesRep: "Kevin Zhang",
      syncedAt: new Date("2026-04-06T11:02:00Z"),
    },
  ];

  for (const o of orders) {
    await prisma.order.upsert({
      where: { erpOrderNo: o.erpOrderNo },
      update: {},
      create: o,
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
