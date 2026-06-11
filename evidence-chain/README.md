# 证据链系统 (Evidence Chain System)

SeekWave Technology 内部文档管理系统，用于统一存储和管理销售订单、合同、报价单等业务凭证文档，作为鼎捷 T100 ERP 的辅助系统。

**两种运行模式，自动切换：**

| 模式 | 数据库 | 文件存储 | 适用场景 | 前置要求 |
|------|--------|----------|----------|----------|
| 轻量模式（默认） | SQLite 文件 | 本地 `./storage` 目录 | 体验、演示、小团队 | **只需 Node.js** |
| 生产模式 | PostgreSQL 16 | MinIO（S3 兼容） | 正式上线、内网部署 | Docker Compose |

## 🚀 快速启动（Windows，无需 Docker）

> 适合在自己电脑上快速体验完整系统

1. 安装 [Node.js LTS](https://nodejs.org/zh-cn)（一路下一步即可）
2. 下载本仓库代码，进入 `evidence-chain` 文件夹
3. **双击 `setup.bat`**（首次安装，约 3-10 分钟）
4. **双击 `start.bat`**（启动系统，浏览器会自动打开）
5. 用 `admin` / `Admin@123456` 登录

> 详细图文步骤见 [WINDOWS_GUIDE.md](./WINDOWS_GUIDE.md)

命令行方式（macOS / Linux 同样适用）：

```bash
cd evidence-chain
cp .env.example .env
npm install
npm run setup     # 生成数据库 + 默认账号
npm run dev       # 启动，访问 http://localhost:3000
```

### 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | Admin@123456 | 管理员 |
| sales_demo | Sales@123456 | 销售 |
| cs_demo | Cs@123456 | 客服 |
| finance_demo | Finance@123456 | 财务 |
| auditor_demo | Auditor@123456 | 审计员 |

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) + TypeScript |
| 样式 | Tailwind CSS（Apple HIG 设计语言） |
| 数据库 | SQLite（默认）/ PostgreSQL 16，Prisma ORM v7 |
| 文件存储 | 本地目录（默认）/ MinIO（S3 兼容，可迁移阿里云 OSS） |
| 认证 | NextAuth.js v4（Credentials，预留 LDAP/OAuth2） |
| 测试 | Vitest |
| 部署 | 双击脚本（轻量）/ Docker Compose（生产） |

## 与鼎捷 T100 ERP 集成

### 方式一：URL 跳转（零开发量，第一阶段）

ERP 销售订单界面添加一个超链接按钮即可：

```
http://<本系统地址>/orders/{订单号}
例如：http://evidence.seekwave.internal/orders/SO-2026-001
```

用户点击后直接看到该订单的全部归档文档。

### 方式二：订单自动同步（推荐，服务端 API）

ERP 在订单核准后调用本系统接口，自动建档（客户不存在时自动创建）：

```
POST /api/erp/orders
Header:  X-API-Key: <ERP_API_KEY 环境变量配置的密钥>
Body: {
  "orderNo": "SO-2026-005",
  "customerCode": "C001",
  "customerName": "深圳市华强电子有限公司",
  "orderDate": "2026-06-01",
  "amount": 320000,
  "status": "已确认",
  "remark": "备注"
}
```

ERP 也可反查某订单的归档情况（可在 ERP 界面显示"已归档 N 份"）：

```
GET /api/erp/orders?orderNo=SO-2026-001
Header:  X-API-Key: <密钥>
```

完整接口文档见 [API.md](./API.md)。

## 项目结构

```
evidence-chain/
├── setup.bat / start.bat      # Windows 一键安装/启动
├── app/
│   ├── (auth)/login/          # 登录页
│   ├── (app)/                 # 业务页面（需登录）
│   │   ├── dashboard/         # 仪表盘
│   │   ├── orders/            # 销售订单 + ERP 跳转着陆页
│   │   ├── customers/         # 客户管理
│   │   ├── documents/         # 文档库 + 文档详情（PDF 预览）
│   │   ├── upload/            # 拖拽上传
│   │   ├── settings/          # 个人设置（改密码 + 操作历史）
│   │   ├── audit-logs/        # 审计日志（管理员/审计员）
│   │   └── admin/users/       # 用户管理（管理员）
│   └── api/
│       ├── documents/         # 文档 CRUD + 下载/预览
│       ├── orders/ customers/ users/
│       ├── erp/orders/        # 鼎捷 ERP 服务端集成（X-API-Key）
│       ├── audit-logs/        # 审计日志查询
│       └── health/            # 健康检查
├── lib/
│   ├── prisma.ts              # 数据库（SQLite/PostgreSQL 自动切换）
│   ├── storage.ts             # 文件存储（本地/MinIO 自动切换）
│   ├── auth.ts audit.ts utils.ts
│   └── utils.test.ts          # 单元测试
├── prisma/
│   ├── schema.prisma          # SQLite 版（默认）
│   ├── schema.postgresql.prisma  # PostgreSQL 版（生产）
│   └── seed.js                # 种子数据（纯 JS，跨平台）
└── docker-compose.yml         # 生产部署（PG + MinIO + Nginx）
```

## 核心功能

- ✅ 文档上传（PDF/Word/Excel/图片，≤50MB，拖拽 + 进度条 + 重复检测）
- ✅ SHA-256 防篡改哈希（IPO 合规底稿）
- ✅ PDF / 图片在线预览（服务端代理，文件不暴露公网）
- ✅ 多业务对象关联（订单/客户/合同/报价/对账/返利，多对多）
- ✅ 文档版本管理
- ✅ 审计日志：上传/查看/下载/删除/登录全留痕，append-only
- ✅ RBAC 七种角色（管理员/销售/客服/财务/法务/审计员/访客）
- ✅ ERP 集成：URL 跳转 + 服务端订单同步 API
- ✅ 个人设置：修改密码、查看本人操作历史
- ✅ 健康检查接口 `/api/health`（运维监控）

## 文档索引

- [WINDOWS_GUIDE.md](./WINDOWS_GUIDE.md) — Windows 小白图文指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) — 生产环境部署（含 ERP 对接与服务器准备清单）
- [OPERATIONS.md](./OPERATIONS.md) — 运维手册（备份/恢复/监控）
- [API.md](./API.md) — API 文档（重点：ERP 集成接口）
- [ROADMAP.md](./ROADMAP.md) — 第二阶段规划（SSO、TSA 时间戳、OCR）
