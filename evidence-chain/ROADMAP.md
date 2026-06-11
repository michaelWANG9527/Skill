# 产品路线图

## 第一阶段（已完成）— MVP

- ✅ 文档上传、存储、下载、预览
- ✅ SHA-256 防篡改哈希
- ✅ 多业务对象关联（6 种）
- ✅ 文档版本管理
- ✅ 审计日志（append-only）
- ✅ RBAC 角色权限（7 种角色）
- ✅ ERP URL 跳转集成
- ✅ 本地账号 + 密码认证
- ✅ Docker Compose 一键部署

---

## 第二阶段 — IPO 合规增强

### SSO 单点登录

架构已预留 NextAuth.js 多 Provider 扩展点，接入步骤：

1. **LDAP/AD 集成**：安装 `next-auth-ldap`，在 `lib/auth.ts` 添加 LdapProvider
2. **OAuth2 集成**（如企业微信）：添加对应 Provider，配置回调 URL
3. 迁移期间支持本地账号和 SSO 同时登录

### 可信时间戳（TSA）

为文档上传操作申请 RFC 3161 可信时间戳，提供法律效力证明：

```typescript
// 预留接口位置：lib/tsa.ts
interface TSAConfig {
  endpoint: string;  // 如国家授时中心 TSA 服务
  certPath: string;
}

async function applyTimestamp(sha256: string): Promise<string> {
  // 调用 TSA 服务，返回时间戳令牌
}
```

接入后，每次上传自动申请时间戳并存入数据库，用于 IPO 审计举证。

### WAL 归档

配置 PostgreSQL WAL（Write-Ahead Log）持续归档到对象存储，实现：

- 任意时间点恢复（PITR）
- 审计日志的额外保护层
- 满足 IPO「操作记录不可篡改」要求

```yaml
# PostgreSQL WAL 归档配置（docker-compose.yml 扩展）
postgres:
  environment:
    POSTGRES_INITDB_ARGS: "--wal-segsize=16"
  command: >
    postgres
    -c wal_level=replica
    -c archive_mode=on
    -c archive_command='mc cp %p minio/evidence-wal/%f'
```

### 月度数据快照

每月末自动导出完整数据快照（文档元数据 + 审计日志），加密存储，保留 7 年（满足上市合规要求）。

---

## 第三阶段 — 效率提升

### OCR 全文检索

对上传的 PDF/图片进行 OCR 识别，建立全文索引（Elasticsearch），支持：

- 按合同金额、客户名称等关键词检索文档内容
- 自动提取订单号、金额等结构化字段

技术方案：
- OCR 引擎：PaddleOCR（中文支持好）
- 全文索引：Elasticsearch 8
- 处理队列：Bull（Redis 队列）

### 移动端

PWA 支持，让销售在手机上快速上传客户现场签署的纸质合同照片。

### ERP 双向集成

从鼎捷 T100 ERP 同步订单状态变更，无需手动维护订单数据；支持 ERP 通过 API 主动推送订单创建事件。

### 合同到期预警

扫描关联了合同文档的订单，临近合同到期时向相关销售和法务发送提醒邮件/企业微信消息。
