# 生产环境部署指南

## 服务器要求

- Ubuntu Server 22.04 LTS
- CPU: 4 核+，内存: 8GB+，磁盘: 200GB+（文档存储）
- 已安装 Docker Engine 24+ 和 Docker Compose v2

## 部署步骤

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 克隆代码

```bash
cd /opt
git clone <repo-url> evidence-chain
cd evidence-chain
```

### 3. 配置生产环境变量

```bash
cp .env.example .env
```

编辑 `.env`，**必须修改以下配置**：

```env
# 数据库密码（使用强密码）
DATABASE_URL="postgresql://evidence_user:【强密码】@postgres:5432/evidence_chain?schema=public"

# NextAuth Secret（至少 32 位随机字符串）
# 生成命令：openssl rand -base64 32
NEXTAUTH_URL="http://evidence.seekwave.internal"
NEXTAUTH_SECRET="【openssl rand -base64 32 生成的随机字符串】"

# MinIO 密钥（至少 8 位）
MINIO_ACCESS_KEY="evidence_admin"
MINIO_SECRET_KEY="【强密码，至少12位】"
```

### 4. 构建并启动

```bash
# 构建应用镜像
docker compose build app

# 启动所有服务
docker compose up -d

# 查看状态
docker compose ps
```

### 5. 初始化数据库

```bash
# 执行数据库迁移
docker compose exec app npx prisma migrate deploy

# 创建种子数据（仅首次）
docker compose exec app npm run db:seed
```

### 6. 配置内网 DNS

在公司 DNS 服务器添加：

```
evidence.seekwave.internal  A  <服务器内网IP>
```

### 7. 验证部署

```bash
curl -I http://evidence.seekwave.internal/login
# 期望返回 200 OK
```

## 内网访问配置

### VPN 用户访问

出差员工通过 VPN 连接后，直接访问 `http://evidence.seekwave.internal` 即可。

### 端口说明

| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | Nginx | 主入口（内网） |
| 3000 | Next.js App | 内部端口（不对外） |
| 9000 | MinIO API | 内部端口（不对外） |
| 9001 | MinIO Console | 内部管理（可选对内网开放） |
| 5432 | PostgreSQL | 内部端口（不对外） |

## SSL/HTTPS（可选）

若需 HTTPS，在 `nginx.conf` 中配置证书：

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/certs/evidence.crt;
    ssl_certificate_key /etc/nginx/certs/evidence.key;
    # ...
}
```

并将证书挂载到 nginx 容器。

## 常用运维命令

```bash
# 查看日志
docker compose logs -f app

# 重启应用
docker compose restart app

# 停止所有服务
docker compose down

# 更新部署
git pull
docker compose build app
docker compose up -d app
docker compose exec app npx prisma migrate deploy
```
