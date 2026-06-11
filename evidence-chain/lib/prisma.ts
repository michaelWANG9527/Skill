import path from "path";
import { PrismaClient } from "@prisma/client";

// 根据 DATABASE_URL 自动选择数据库驱动：
// - file:...         → SQLite（零依赖，默认，无需安装任何数据库）
// - postgresql://... → PostgreSQL（生产环境，需用 schema.postgresql.prisma 重新 generate）
function createPrismaClient() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";

  let adapter;
  if (url.startsWith("file:")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    adapter = new PrismaBetterSqlite3({ url: resolveSqliteUrl(url) });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaPg } = require("@prisma/adapter-pg");
    adapter = new PrismaPg({ connectionString: url });
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// 把相对路径统一解析为基于项目根目录的绝对路径，
// 避免 CLI 与运行时对 SQLite 相对路径解析不一致的问题
export function resolveSqliteUrl(url: string): string {
  const p = url.replace(/^file:/, "");
  if (path.isAbsolute(p)) return "file:" + p;
  return "file:" + path.resolve(process.cwd(), p);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
