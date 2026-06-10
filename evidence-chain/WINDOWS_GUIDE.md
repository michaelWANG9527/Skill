# Windows 电脑运行指南（小白版）

本系统的轻量模式**不需要 Docker、不需要安装任何数据库**，只需要 Node.js。

## 第一步：安装 Node.js（只需装一次）

1. 浏览器打开 https://nodejs.org/zh-cn
2. 点击绿色的「下载 Node.js (LTS)」按钮
3. 双击下载的安装包，一路点「下一步」直到完成
4. 验证：按 `Win + R`，输入 `cmd` 回车，在黑窗口输入 `node -v`，
   显示版本号（如 `v22.x.x`）就成功了

## 第二步：获取代码（只需做一次）

**方法 A（推荐，不需要 Git）：**

1. 打开仓库的 GitHub 页面
2. 点绿色「Code」按钮 →「Download ZIP」
3. 解压到 `C:\`，进入解压后的文件夹里的 `evidence-chain` 文件夹

**方法 B（已安装 Git）：**

```cmd
cd C:\
git clone https://github.com/michaelWANG9527/Skill.git
cd Skill\evidence-chain
```

## 第三步：一键安装（只需做一次）

打开 `evidence-chain` 文件夹，**双击 `setup.bat`**。

黑窗口会自动完成 4 件事（约 3-10 分钟，取决于网速）：

1. 创建配置文件
2. 下载依赖包（最慢的一步，耐心等待）
3. 创建数据库（SQLite 文件，就在项目文件夹里）
4. 创建演示账号和示例数据

看到 `SETUP COMPLETE!` 就成功了，按任意键关闭窗口。

> 如果下载依赖很慢，先在 cmd 执行一次：
> `npm config set registry https://registry.npmmirror.com`
> 然后重新双击 setup.bat

## 第四步：启动系统（每次使用时）

**双击 `start.bat`**。

- 约 15 秒后浏览器自动打开系统页面
- 如果没自动打开，手动访问 http://localhost:3000

⚠️ **黑窗口必须保持开着**，关掉窗口 = 关闭系统。

## 第五步：登录

| 账号 | 密码 | 能做什么 |
|------|------|---------|
| admin | Admin@123456 | 全部功能（推荐先用这个） |
| sales_demo | Sales@123456 | 上传文档、建订单 |
| finance_demo | Finance@123456 | 查看与下载 |
| auditor_demo | Auditor@123456 | 查看审计日志 |

## 建议的体验路线

1. **仪表盘** — 看统计卡片
2. **销售订单** → 点 `SO-2026-001` — 这就是将来 ERP 跳转过来的页面，
   能看到这个订单的采购订单 PDF 和盖章合同
3. 点开一份文档 — **PDF 在线预览 + SHA-256 防篡改哈希 + 操作记录**
4. **上传文档** — 拖一个 PDF 进去，关联到订单试试
5. **审计日志** — 你刚才的每一步操作（查看、上传）都被记下来了
6. **用户管理** — 给同事建账号
7. **个人设置** — 改密码、看自己的操作历史

## 常见问题

**双击 setup.bat 一闪而过？**
→ Node.js 没装好。重做第一步，装完后重启电脑再试。

**浏览器显示「无法访问此网站」？**
→ start.bat 的黑窗口被关掉了，重新双击 start.bat。

**端口被占用（EADDRINUSE）？**
→ 你开了两个 start.bat 窗口，关掉多余的。

**数据存在哪里？**
→ 数据库：`prisma\dev.db` 文件；上传的文件：`storage\` 文件夹。
   备份系统 = 复制这两个东西。

**想重置所有数据重新开始？**
→ 关闭系统，删除 `prisma\dev.db` 和 `storage` 文件夹，重新双击 setup.bat。
