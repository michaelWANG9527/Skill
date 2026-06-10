// 种子数据脚本（纯 JavaScript，跨平台兼容，Windows 直接 node prisma/seed.js 即可）
/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

function createClient() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  let adapter;
  if (url.startsWith("file:")) {
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    const p = url.replace(/^file:/, "");
    const abs = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
    adapter = new PrismaBetterSqlite3({ url: "file:" + abs });
  } else {
    const { PrismaPg } = require("@prisma/adapter-pg");
    adapter = new PrismaPg({ connectionString: url });
  }
  return new PrismaClient({ adapter });
}

const prisma = createClient();

async function main() {
  console.log("🌱 开始初始化种子数据...");

  // ---------- 用户 ----------
  const users = [
    { username: "admin", email: "admin@seekwave.com", password: "Admin@123456", fullName: "系统管理员", department: "IT", role: "ADMIN" },
    { username: "sales_demo", email: "sales@seekwave.com", password: "Sales@123456", fullName: "张销售", department: "销售部", role: "SALES" },
    { username: "cs_demo", email: "cs@seekwave.com", password: "Cs@123456", fullName: "王客服", department: "CS", role: "CS" },
    { username: "finance_demo", email: "finance@seekwave.com", password: "Finance@123456", fullName: "李财务", department: "财务部", role: "FINANCE" },
    { username: "auditor_demo", email: "auditor@seekwave.com", password: "Auditor@123456", fullName: "赵审计", department: "法务", role: "AUDITOR" },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        department: u.department,
        role: u.role,
        active: true,
      },
    });
    console.log(`✅ 用户已创建: ${u.username} (${u.fullName})`);
  }

  // ---------- 客户 ----------
  const customersData = [
    { customerCode: "C001", name: "深圳市华强电子有限公司", shortName: "华强电子", country: "中国", contactName: "王总", contactEmail: "wang@huaqiang.com", contactPhone: "0755-88888888" },
    { customerCode: "C002", name: "上海浦东新区科技发展集团", shortName: "浦东科技", country: "中国", contactName: "李总", contactEmail: "li@pudong-tech.com", contactPhone: "021-66666666" },
    { customerCode: "C003", name: "Shenzhen Skyline Communications Ltd.", shortName: "Skyline", country: "中国", contactName: "陈经理", contactEmail: "chen@skyline.com", contactPhone: "0755-66886688" },
  ];

  const customers = {};
  for (const c of customersData) {
    customers[c.customerCode] = await prisma.customer.upsert({
      where: { customerCode: c.customerCode },
      update: {},
      create: { ...c, active: true },
    });
    console.log(`✅ 客户已创建: ${c.customerCode} ${c.name}`);
  }

  // ---------- 订单 ----------
  const ordersData = [
    { orderNo: "SO-2026-001", customerCode: "C001", orderDate: "2026-01-15", amount: 258000, status: "已确认", remark: "Wi-Fi 6 芯片首批采购" },
    { orderNo: "SO-2026-002", customerCode: "C002", orderDate: "2026-02-20", amount: 180000, status: "执行中", remark: "BT5.3 模块采购" },
    { orderNo: "SO-2026-003", customerCode: "C003", orderDate: "2026-03-08", amount: 96000, status: "待确认", remark: "工程样片订单" },
    { orderNo: "SO-2026-004", customerCode: "C001", orderDate: "2026-04-12", amount: 512000, status: "执行中", remark: "Wi-Fi 6E 量产订单（第二批）" },
  ];

  for (const o of ordersData) {
    await prisma.order.upsert({
      where: { orderNo: o.orderNo },
      update: {},
      create: {
        orderNo: o.orderNo,
        customerId: customers[o.customerCode].id,
        orderDate: new Date(o.orderDate),
        amount: o.amount,
        currency: "CNY",
        status: o.status,
        remark: o.remark,
      },
    });
    console.log(`✅ 订单已创建: ${o.orderNo}`);
  }

  console.log("\n🎉 种子数据初始化完成！");
  console.log("\n默认账号：");
  console.log("  管理员: admin / Admin@123456");
  console.log("  销售:   sales_demo / Sales@123456");
  console.log("  客服:   cs_demo / Cs@123456");
  console.log("  财务:   finance_demo / Finance@123456");
  console.log("  审计员: auditor_demo / Auditor@123456");
}

main()
  .catch((e) => {
    console.error("❌ 种子数据初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
