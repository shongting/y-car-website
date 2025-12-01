# 安全增强功能

本文档描述了用户身份验证系统中实施的安全增强功能。

## 实施的安全功能

### 1. HTTPS 强制执行

**位置**: `src/api/middleware/security.ts` - `enforceHttps()`

**功能**:
- 在生产环境中强制所有敏感端点使用 HTTPS
- 检查 `req.secure` 标志和 `x-forwarded-proto` 头
- 拒绝非 HTTPS 请求并返回 403 错误

**配置**:
- 仅在 `NODE_ENV=production` 时启用
- 开发环境允许 HTTP 请求以便于测试

### 2. CSRF 保护

**位置**: `src/api/middleware/security.ts` - `csrfProtection()`

**功能**:
- 验证请求来源，防止跨站请求伪造攻击
- 检查 `Origin` 和 `Referer` 头
- 确保请求来自同一域名

**实施细节**:
- 跳过 GET、HEAD、OPTIONS 请求（安全方法）
- 要求 POST、PUT、DELETE 等修改操作包含有效的 Origin 或 Referer
- 验证 Origin/Referer 的主机名与请求的 Host 头匹配

### 3. 安全响应头

**位置**: `src/api/middleware/security.ts` - `securityHeaders()`

**设置的响应头**:

| 响应头 | 值 | 目的 |
|--------|-----|------|
| `X-Content-Type-Options` | `nosniff` | 防止 MIME 类型嗅探 |
| `X-Frame-Options` | `DENY` | 防止点击劫持攻击 |
| `X-XSS-Protection` | `1; mode=block` | 启用浏览器 XSS 过滤器 |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | 强制使用 HTTPS（HSTS） |
| `Content-Security-Policy` | `default-src 'self'` | 限制资源加载来源 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 控制 Referer 信息泄露 |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | 禁用不必要的浏览器功能 |

### 4. 请求日志记录

**位置**: `src/api/middleware/security.ts` - `requestLogger()`

**记录的信息**:
- 请求时间戳
- HTTP 方法和路径
- 客户端 IP 地址（从 `x-forwarded-for`、`x-real-ip` 或 `socket.remoteAddress` 提取）
- 用户代理字符串
- 请求体（敏感字段已脱敏）
- 响应状态码
- 请求处理时间

**敏感数据保护**:
- 自动脱敏以下字段：`password`、`newPassword`、`sessionToken`、`resetToken`
- 这些字段在日志中显示为 `[REDACTED]`

### 5. 审计日志集成

**位置**: `src/api/routes/auth.ts`

**记录的事件**:
- 登录尝试（成功和失败）
- 注销操作
- 密码重置请求
- 密码重置完成

**每个审计日志包含**:
- 事件类型
- 用户标识符（用户名或用户 ID）
- 成功/失败状态
- 时间戳
- IP 地址
- 用户代理
- 附加元数据（如错误信息、账户锁定状态）

## 使用方法

### 在应用中启用安全中间件

```typescript
import { createApp } from './api/app';
import { AuthenticationService } from './services/AuthenticationService';
import { PasswordService } from './services/PasswordService';
import { AuditLogger } from './services/AuditLogger';

const app = createApp({
  authService: myAuthService,
  passwordService: myPasswordService,
  auditLogger: myAuditLogger  // 可选，用于审计日志记录
});
```

### 提取客户端信息的辅助函数

```typescript
import { getClientIp, getUserAgent } from './api/middleware/security';

// 在路由处理器中使用
router.post('/some-endpoint', (req, res) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  // 使用这些信息进行日志记录或审计
});
```

## 安全最佳实践

### 生产环境配置

1. **设置环境变量**:
   ```bash
   NODE_ENV=production
   ```

2. **使用反向代理**:
   - 配置 Nginx 或其他反向代理处理 SSL/TLS
   - 确保设置正确的头：`X-Forwarded-For`、`X-Real-IP`、`X-Forwarded-Proto`

3. **监控日志**:
   - 定期审查审计日志以发现可疑活动
   - 设置告警以检测异常模式（如大量失败的登录尝试）

### 开发环境配置

1. **允许 HTTP**:
   - 开发环境自动允许 HTTP 请求
   - 无需配置 SSL 证书

2. **测试 CSRF 保护**:
   - 确保测试请求包含正确的 `Origin` 或 `Referer` 头
   - 使用 `supertest` 等工具时，可能需要手动设置这些头

## 测试

安全中间件的测试位于 `src/api/middleware/security.test.ts`。

运行测试：
```bash
npm test -- src/api/middleware/security.test.ts
```

测试覆盖：
- HTTPS 强制执行（开发和生产环境）
- CSRF 保护（各种场景）
- 安全响应头设置
- IP 地址和用户代理提取

## 合规性

这些安全增强功能帮助满足以下要求：

- **需求 7.4**: 记录身份验证事件时包含相关的上下文信息（IP 地址、用户代理）
- **OWASP Top 10**: 防护常见的 Web 应用安全风险
- **GDPR**: 通过审计日志提供可追溯性
- **PCI DSS**: 强制使用加密传输（HTTPS）

## 未来改进

可能的增强功能：
- 实现基于令牌的 CSRF 保护（双重提交 Cookie）
- 添加速率限制到中间件层
- 集成 WAF（Web 应用防火墙）规则
- 实现更细粒度的内容安全策略
- 添加子资源完整性（SRI）支持
