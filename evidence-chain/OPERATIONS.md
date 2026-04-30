# 日常运维手册

## 备份策略

### PostgreSQL 数据库备份

**自动备份脚本**（建议加入 crontab，每日凌晨 2 点执行）：

```bash
#!/bin/bash
# /opt/evidence-chain/scripts/backup-db.sh

BACKUP_DIR="/opt/backups/evidence-chain"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_${DATE}.sql.gz"

mkdir -p "${BACKUP_DIR}"

docker compose -f /opt/evidence-chain/docker-compose.yml exec -T postgres \
  pg_dump -U evidence_user evidence_chain | gzip > "${BACKUP_FILE}"

echo "[$(date)] 数据库备份完成: ${BACKUP_FILE}"

# 删除 30 天前的备份
find "${BACKUP_DIR}" -name "db_*.sql.gz" -mtime +30 -delete
```

```bash
# 添加到 crontab
crontab -e
# 添加以下行：
0 2 * * * /opt/evidence-chain/scripts/backup-db.sh >> /var/log/evidence-backup.log 2>&1
```

### MinIO 文件备份

MinIO 数据存储在 Docker volume `evidence-chain_minio_data` 中。

```bash
# 备份 MinIO 数据到本地
docker run --rm \
  -v evidence-chain_minio_data:/source:ro \
  -v /opt/backups/minio:/backup \
  alpine tar czf /backup/minio_$(date +%Y%m%d).tar.gz -C /source .
```

## 数据库恢复

```bash
# 从备份文件恢复
gunzip -c /opt/backups/evidence-chain/db_20260430_020000.sql.gz | \
  docker compose exec -T postgres psql -U evidence_user evidence_chain
```

## 监控

### 检查服务健康状态

```bash
# 查看所有容器状态
docker compose ps

# 查看资源使用
docker stats --no-stream

# 查看应用日志（最近 100 行）
docker compose logs --tail=100 app

# 实时跟踪日志
docker compose logs -f app
```

### 磁盘空间监控

```bash
# 查看 Docker volumes 占用
docker system df -v

# 查看服务器磁盘
df -h
```

## 升级流程

```bash
cd /opt/evidence-chain

# 1. 拉取最新代码
git pull origin main

# 2. 构建新镜像
docker compose build app

# 3. 停止旧版本（停机时间约 30 秒）
docker compose stop app

# 4. 执行数据库迁移
docker compose run --rm app npx prisma migrate deploy

# 5. 启动新版本
docker compose up -d app

# 6. 验证
docker compose logs --tail=20 app
curl -I http://evidence.seekwave.internal/login
```

## 用户管理

用户管理通过系统内置的「用户管理」页面操作（管理员账号登录后访问）。

**重置用户密码**（紧急情况，通过数据库直接操作）：

```bash
# 生成新密码哈希（将 NewPassword123 替换为实际密码）
docker compose exec app node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('NewPassword123', 12).then(h => console.log(h));
"

# 在数据库中更新
docker compose exec postgres psql -U evidence_user evidence_chain -c \
  "UPDATE \"User\" SET \"passwordHash\" = '上面生成的哈希' WHERE username = 'target_user';"
```

## 审计日志导出

审计日志可通过系统界面导出 CSV，也可直接查询数据库：

```sql
-- 查询特定时间段的操作记录
SELECT
  to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as "时间",
  u."fullName" as "操作人",
  u.department as "部门",
  al.action as "操作",
  al.ip as "IP",
  d."originalName" as "文档"
FROM "AuditLog" al
JOIN "User" u ON al."userId" = u.id
LEFT JOIN "Document" d ON al."documentId" = d.id
WHERE al.timestamp BETWEEN '2026-01-01' AND '2026-12-31'
ORDER BY al.timestamp DESC;
```

## 常见问题

### 上传文件失败

1. 检查 MinIO 是否正常运行：`docker compose ps minio`
2. 查看 MinIO 日志：`docker compose logs minio`
3. 确认 bucket 是否存在（首次自动创建，若失败需手动创建）

### 无法登录

1. 确认数据库服务正常：`docker compose ps postgres`
2. 检查 NEXTAUTH_SECRET 是否设置
3. 验证用户是否 active=true

### 数据库连接失败

```bash
# 测试数据库连接
docker compose exec postgres pg_isready -U evidence_user -d evidence_chain
```
