# 身份验证 API

此目录包含用户身份验证系统的 HTTP API 实现。

## 目录结构

```
src/api/
├── app.ts           # Express 应用配置
├── server.ts        # 服务器启动函数
├── routes/
│   └── auth.ts      # 身份验证路由
├── example.ts       # 使用示例
└── README.md        # 本文件
```

## API 端点

### 1. 登录

**端点:** `POST /auth/login`

**请求体:**
```json
{
  "username": "string",
  "password": "string"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "sessionToken": "string"
}
```

**失败响应 (401):**
```json
{
  "success": false,
  "error": "用户名或密码无效"
}
```

**账户锁定响应 (423):**
```json
{
  "success": false,
  "error": "账户已被锁定"
}
```

**验证错误 (400):**
```json
{
  "success": false,
  "error": "用户名是必需的"
}
```

### 2. 注销

**端点:** `POST /auth/logout`

**请求体:**
```json
{
  "sessionToken": "string"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "message": "注销成功"
}
```

**验证错误 (400):**
```json
{
  "success": false,
  "error": "会话令牌是必需的"
}
```

### 3. 请求密码重置

**端点:** `POST /auth/password-reset/request`

**请求体:**
```json
{
  "usernameOrEmail": "string"
}
```

**响应 (200):**
```json
{
  "success": true,
  "message": "如果该账户存在，密码重置链接已发送到注册的电子邮件地址"
}
```

**注意:** 为了安全，即使用户不存在也返回成功消息，以防止账户枚举。

**验证错误 (400):**
```json
{
  "success": false,
  "error": "用户名或电子邮件是必需的"
}
```

### 4. 完成密码重置

**端点:** `POST /auth/password-reset/complete`

**请求体:**
```json
{
  "resetToken": "string",
  "newPassword": "string"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "message": "密码重置成功"
}
```

**失败响应 (400):**
```json
{
  "success": false,
  "error": "重置令牌无效或已过期"
}
```

**密码强度不足 (400):**
```json
{
  "success": false,
  "error": "密码不符合安全要求",
  "details": [
    "密码长度至少为 8 个字符",
    "密码必须包含至少一个特殊字符"
  ]
}
```

### 5. 验证会话

**端点:** `GET /auth/session/validate`

**请求方式 1 - 查询参数:**
```
GET /auth/session/validate?sessionToken=abc123...
```

**请求方式 2 - Authorization 头:**
```
GET /auth/session/validate
Authorization: Bearer abc123...
```

**成功响应 (200):**
```json
{
  "success": true,
  "valid": true,
  "session": {
    "userId": "string",
    "createdAt": "ISO8601 日期时间",
    "expiresAt": "ISO8601 日期时间",
    "lastActivityAt": "ISO8601 日期时间"
  }
}
```

**会话无效响应 (401):**
```json
{
  "success": false,
  "valid": false,
  "error": "会话无效或已过期"
}
```

**验证错误 (400):**
```json
{
  "success": false,
  "error": "会话令牌是必需的"
}
```

## HTTP 状态码

- `200 OK` - 请求成功
- `400 Bad Request` - 输入验证失败
- `401 Unauthorized` - 认证失败
- `423 Locked` - 账户被锁定
- `500 Internal Server Error` - 服务器错误

## 安全特性

### 输入验证
所有端点都包含输入验证，确保：
- 必需字段存在
- 数据类型正确
- 密码符合安全要求

### 错误处理
- 通用错误消息防止信息泄露
- 密码重置请求始终返回成功消息（防止账户枚举）
- 登录失败消息不区分用户名和密码错误

### 安全响应头
应用自动设置以下安全响应头：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## 使用示例

### 使用 curl

**登录:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!@#"}'
```

**注销:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"abc123..."}'
```

**验证会话:**
```bash
curl -X GET "http://localhost:3000/auth/session/validate?sessionToken=abc123..."
```

或使用 Authorization 头:
```bash
curl -X GET http://localhost:3000/auth/session/validate \
  -H "Authorization: Bearer abc123..."
```

### 使用 JavaScript/TypeScript

```typescript
import { createApp } from './api/app';
import { AuthenticationService } from './services/AuthenticationService';
import { PasswordService } from './services/PasswordService';

// 创建服务实例
const authService: AuthenticationService = /* ... */;
const passwordService = new PasswordService();

// 创建应用
const app = createApp({
  authService,
  passwordService
});

// 启动服务器
app.listen(3000, () => {
  console.log('服务器运行在端口 3000');
});
```

## 开发注意事项

### 依赖项
API 实现依赖以下服务：
- `AuthenticationService` - 处理登录、注销和会话验证（任务 6）
- `PasswordService` - 处理密码哈希、验证和重置（任务 2 和 7）

### 测试
运行 API 测试：
```bash
npm test -- src/api/routes/auth.test.ts
```

### 未来改进
- [ ] 添加请求日志记录
- [ ] 实现 CSRF 保护
- [ ] 添加 API 速率限制
- [ ] 实现 API 版本控制
- [ ] 添加 OpenAPI/Swagger 文档
- [ ] 实现请求 ID 跟踪
