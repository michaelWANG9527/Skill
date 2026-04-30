# 证据链系统 (Evidence Chain System)

SeekWave Technology 内部文档管理系统，用于统一存储和管理销售订单、合同、报价单等业务凭证文档，作为鼎捷 T100 ERP 的辅助系统。

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) + TypeScript |
| 样式 | Tailwind CSS（Apple HIG 风格） |
| 数据库 | PostgreSQL 16 + Prisma ORM |
| 文件存储 | MinIO（S3 兼容） |
| 认证 | NextAuth.js v4（Credentials Provider） |
| 部署 | Docker Compose |

## 快速启动（开发环境）

### 前置要求
- Node.js 22+
- Docker & Docker Compose

### 1. 安装依赖

```bash
cd evidence-chain
npm install
```

### 2. 启动依赖服务

```bash
docker compose up postgres minio -d
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，至少修改 NEXTAUTH_SECRET（随机 32 位字符串）
```

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000，使用以下账号登录：

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | Admin@123456 | 管理员 |
| sales_demo | Sales@123456 | 销售 |
| finance_demo | Finance@123456 | 财务 |

## 项目结构

```
evidence-chain/
├── app/
│   ├── (auth)/login/          # 登录页
│   ├── (app)/                 # 需登录的页面（受 NextAuth 保护）
│   │   ├── dashboard/         # 仪表盘
│   │   ├── orders/            # 销售订单（ERP 跳转入口）
│   │   ├── customers/         # 客户管理
│   │   ├── documents/         # 文档库
│   │   ├── upload/            # 上传文档
│   │   ├── audit-logs/        # 审计日志（管理员/审计员）
│   │   └── admin/users/       # 用户管理（管理员）
│   └── api/                   # API Routes
│       ├── documents/         # 文档 CRUD + 下载/预览
│       ├── orders/            # 订单管理
│       ├── customers/         # 客户管理
│       ├── users/             # 用户管理
│       ├── audit-logs/        # 审计日志查询
│       └── auth/[...nextauth] # NextAuth
├── components/
│   ├── ui/                    # 基础 UI 组件（Button、Card、Input 等）
│   └── layout/                # Sidebar、TopBar、AppShell
├── lib/
│   ├── prisma.ts              # Prisma 客户端（单例）
│   ├── minio.ts               # MinIO 文件存储封装
│   ├── auth.ts                # NextAuth 配置
│   ├── audit.ts               # 审计日志工具
│   └── utils.ts               # 通用工具函数
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   └── seed.ts                # 种子数据脚本
├── types/index.ts             # TypeScript 类型定义
├── docker-compose.yml         # 本地开发/生产服务编排
├── Dockerfile                 # 多阶段构建
└── nginx.conf                 # Nginx 反代配置
```

## ERP 集成

鼎捷 T100 ERP 跳转 URL 格式：

```
http://evidence.seekwave.internal/orders/{订单号}
```

示例：`http://evidence.seekwave.internal/orders/SO-2026-001`

系统接收订单号后，自动展示该订单关联的所有文档。无需额外配置，ERP 只需在销售订单页面添加超链接按钮即可。

## 核心功能

- ✅ 文档上传（PDF/Word/Excel/图片，≤50MB，拖拽上传）
- ✅ SHA-256 防篡改哈希（IPO 合规）
- ✅ PDF / 图片在线预览（服务端代理，无需公网）
- ✅ 多业务对象关联（订单/客户/合同/报价/对账/返利）
- ✅ 文档版本管理
- ✅ 完整审计日志（append-only，不可删除修改）
- ✅ RBAC 角色权限控制（7 种角色）
- ✅ ERP URL 跳转集成
- ✅ MinIO S3 兼容存储（可无缝迁移阿里云 OSS）
