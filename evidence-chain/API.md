# API 文档

所有 API 均需登录认证（Cookie-based Session），返回统一格式：

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误描述"
}
```

---

## ERP 集成接口

### 订单文档查询（核心接口）

ERP 跳转 URL 格式（浏览器端直接访问）：

```
GET /orders/{orderNo}
```

**示例**：`http://evidence.seekwave.internal/orders/SO-2026-001`

系统展示该订单的基本信息与所有关联文档列表。

**API 接口版本**（供 ERP 系统调用，需登录态）：

```
GET /api/orders/{orderNo}
```

响应：

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "clxxx",
      "orderNo": "SO-2026-001",
      "orderDate": "2026-01-15T00:00:00.000Z",
      "status": "已确认",
      "amount": "258000.00",
      "currency": "CNY",
      "customer": {
        "customerCode": "C001",
        "name": "深圳市华强电子有限公司"
      }
    },
    "documents": [
      {
        "id": "docxxx",
        "originalName": "PO-2026-001.pdf",
        "mimeType": "application/pdf",
        "size": 204800,
        "sha256": "abc123...",
        "uploadedAt": "2026-01-16T08:30:00.000Z",
        "version": 1,
        "uploadedBy": { "fullName": "张销售", "department": "销售部" }
      }
    ]
  }
}
```

---

## 文档接口

### 上传文档

```
POST /api/documents
Content-Type: multipart/form-data
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | ✅ | 文件（≤50MB，PDF/Word/Excel/图片） |
| description | string | ❌ | 文档描述 |
| links | JSON string | ❌ | 关联业务对象数组 |
| parentId | string | ❌ | 父文档ID（新版本时填写） |

`links` 格式：

```json
[
  { "bizType": "ORDER", "bizId": "SO-2026-001", "bizNo": "SO-2026-001" },
  { "bizType": "CUSTOMER", "bizId": "C001", "bizNo": "C001" }
]
```

`bizType` 枚举：`ORDER` | `CUSTOMER` | `CONTRACT` | `QUOTATION` | `RECONCILIATION` | `REBATE`

### 查询文档列表

```
GET /api/documents?page=1&pageSize=20&keyword=&bizType=ORDER&bizNo=SO-2026-001
```

### 获取文档详情

```
GET /api/documents/{id}
```

### 下载文档

```
GET /api/documents/{id}/download
```

触发浏览器下载，同时记录审计日志。

### 在线预览

```
GET /api/documents/{id}/preview
```

返回文件流，适合 `<iframe src="...">` 或 `<img src="...">` 内嵌显示。

### 删除文档

```
DELETE /api/documents/{id}
```

需要 ADMIN 或文件上传者（SALES 角色）权限。

---

## 订单接口

### 查询订单列表

```
GET /api/orders?page=1&pageSize=20&keyword=&status=
```

### 创建订单

```
POST /api/orders
Content-Type: application/json
```

```json
{
  "orderNo": "SO-2026-003",
  "customerId": "clxxx",
  "orderDate": "2026-03-01",
  "amount": 150000,
  "currency": "CNY",
  "status": "待确认",
  "remark": "备注"
}
```

---

## 客户接口

### 查询客户列表

```
GET /api/customers?keyword=华强
```

### 创建客户

```
POST /api/customers
Content-Type: application/json
```

```json
{
  "customerCode": "C003",
  "name": "北京某科技有限公司",
  "shortName": "北京科技",
  "country": "中国",
  "contactName": "李总",
  "contactEmail": "li@example.com",
  "contactPhone": "010-12345678"
}
```

---

## 审计日志接口（管理员/审计员）

```
GET /api/audit-logs?page=1&pageSize=30&action=UPLOAD&userId=&dateFrom=2026-01-01&dateTo=2026-12-31
```

`action` 枚举：`UPLOAD` | `VIEW` | `DOWNLOAD` | `DELETE` | `LOGIN` | `LOGOUT` | `CREATE_USER` | `UPDATE_USER`

---

## 用户接口（管理员）

### 查询用户列表

```
GET /api/users
```

### 创建用户

```
POST /api/users
Content-Type: application/json
```

```json
{
  "username": "wangwu",
  "email": "wangwu@seekwave.com",
  "password": "Password123",
  "fullName": "王五",
  "department": "销售部",
  "role": "SALES"
}
```

`role` 枚举：`ADMIN` | `SALES` | `CS` | `FINANCE` | `LEGAL` | `AUDITOR` | `VIEWER`
