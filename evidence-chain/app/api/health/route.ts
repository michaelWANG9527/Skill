import { prisma } from "@/lib/prisma";
import { getStorageDriver } from "@/lib/storage";

export const dynamic = "force-dynamic";

// 健康检查（供 Nginx/监控系统探活）
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      database: "ok",
      storage: getStorageDriver(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}
