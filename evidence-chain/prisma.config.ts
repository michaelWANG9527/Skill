import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

// 统一把 SQLite 相对路径解析为绝对路径，确保 CLI 与运行时操作同一个数据库文件
function resolveUrl(url: string): string {
  if (url.startsWith("file:")) {
    const p = url.replace(/^file:/, "");
    if (!path.isAbsolute(p)) {
      return "file:" + path.resolve(__dirname, p);
    }
  }
  return url;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: resolveUrl(process.env.DATABASE_URL || "file:./prisma/dev.db"),
  },
});
