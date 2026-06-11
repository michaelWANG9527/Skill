import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, ROLES } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateUserSchema = z.object({
  username: z.string().min(3, "用户名至少 3 位").max(32),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位"),
  fullName: z.string().min(1, "姓名不能为空"),
  department: z.string().min(1, "部门不能为空"),
  role: z.enum(ROLES).default("VIEWER"),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);
  if (session.user.role !== "ADMIN") return apiError("无权限", 403);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      department: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { documents: true } },
    },
  });

  return apiSuccess(users);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return apiError("请先登录", 401);
  if (session.user.role !== "ADMIN") return apiError("仅管理员可创建用户", 403);

  const body = await request.json();
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0].message);

  const { username, email, password, fullName, department, role } = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existingUser) return apiError("用户名或邮箱已存在");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, fullName, department, role, active: true },
    select: { id: true, username: true, email: true, fullName: true, department: true, role: true },
  });

  return apiSuccess(user, "用户创建成功");
}
