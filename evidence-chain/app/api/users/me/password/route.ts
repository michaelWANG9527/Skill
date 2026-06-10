import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { writeAuditLog, getClientIp } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(8, "新密码至少 8 位"),
});

// 修改本人密码
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);

  const body = await request.json();
  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return apiError("用户不存在", 404);

  const valid = await bcrypt.compare(parsed.data.oldPassword, user.passwordHash);
  if (!valid) return apiError("当前密码不正确");

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await writeAuditLog({
    userId: user.id,
    action: "CHANGE_PASSWORD",
    targetType: "USER",
    targetId: user.id,
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent") || undefined,
  });

  return apiSuccess(null, "密码修改成功");
}
