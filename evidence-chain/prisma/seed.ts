import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始初始化种子数据...");

  // 创建管理员用户
  const adminHash = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@seekwave.com",
      passwordHash: adminHash,
      fullName: "系统管理员",
      department: "IT",
      role: Role.ADMIN,
      active: true,
    },
  });
  console.log(`✅ 管理员账号已创建: ${admin.username}`);

  // 创建销售用户
  const salesHash = await bcrypt.hash("Sales@123456", 12);
  const sales = await prisma.user.upsert({
    where: { username: "sales_demo" },
    update: {},
    create: {
      username: "sales_demo",
      email: "sales@seekwave.com",
      passwordHash: salesHash,
      fullName: "张销售",
      department: "销售部",
      role: Role.SALES,
      active: true,
    },
  });
  console.log(`✅ 销售账号已创建: ${sales.username}`);

  // 创建财务用户
  const financeHash = await bcrypt.hash("Finance@123456", 12);
  const finance = await prisma.user.upsert({
    where: { username: "finance_demo" },
    update: {},
    create: {
      username: "finance_demo",
      email: "finance@seekwave.com",
      passwordHash: financeHash,
      fullName: "李财务",
      department: "财务部",
      role: Role.FINANCE,
      active: true,
    },
  });
  console.log(`✅ 财务账号已创建: ${finance.username}`);

  // 创建示例客户
  const customer1 = await prisma.customer.upsert({
    where: { customerCode: "C001" },
    update: {},
    create: {
      customerCode: "C001",
      name: "深圳市华强电子有限公司",
      shortName: "华强电子",
      country: "中国",
      contactName: "王总",
      contactEmail: "wang@huaqiang.com",
      contactPhone: "0755-88888888",
      active: true,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { customerCode: "C002" },
    update: {},
    create: {
      customerCode: "C002",
      name: "上海浦东新区科技发展集团",
      shortName: "浦东科技",
      country: "中国",
      contactName: "李总",
      contactEmail: "li@pudong-tech.com",
      contactPhone: "021-66666666",
      active: true,
    },
  });
  console.log(`✅ 示例客户已创建: ${customer1.name}, ${customer2.name}`);

  // 创建示例订单
  const order1 = await prisma.order.upsert({
    where: { orderNo: "SO-2026-001" },
    update: {},
    create: {
      orderNo: "SO-2026-001",
      customerId: customer1.id,
      orderDate: new Date("2026-01-15"),
      amount: 258000.0,
      currency: "CNY",
      status: "已确认",
      remark: "Wi-Fi 6 芯片首批采购",
    },
  });

  const order2 = await prisma.order.upsert({
    where: { orderNo: "SO-2026-002" },
    update: {},
    create: {
      orderNo: "SO-2026-002",
      customerId: customer2.id,
      orderDate: new Date("2026-02-20"),
      amount: 180000.0,
      currency: "CNY",
      status: "执行中",
      remark: "BT5.3 模块采购",
    },
  });
  console.log(`✅ 示例订单已创建: ${order1.orderNo}, ${order2.orderNo}`);

  console.log("\n🎉 种子数据初始化完成！");
  console.log("\n默认账号：");
  console.log("  管理员: admin / Admin@123456");
  console.log("  销售:   sales_demo / Sales@123456");
  console.log("  财务:   finance_demo / Finance@123456");
}

main()
  .catch((e) => {
    console.error("❌ 种子数据初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
