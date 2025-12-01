# 审计日志系统

## 概述

审计日志系统记录所有身份验证相关的安全事件，包括登录、注销、密码重置等操作。系统自动过滤敏感数据（如密码、令牌），确保日志安全且可审计。

## 功能特性

- ✅ 记录所有身份验证事件
- ✅ 自动过滤敏感数据（密码、令牌、密钥等）
- ✅ 包含上下文信息（IP 地址、用户代理）
- ✅ 支持时间范围查询
- ✅ 支持用户维度查询
- ✅ 递归处理嵌套对象中的敏感数据

## 架构

```
┌─────────────────────────────────────┐
│         API 层                       │
│  (自动记录所有身份验证操作)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       AuditLoggerImpl                │
│  - 记录事件                          │
│  - 过滤敏感数据                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    AuditLogRepository                │
│  - 持久化日志                        │
│  - 查询日志                          │
└─────────────────────────────────────┘
```

## 使用方法

### 1. 创建审计日志器

```typescript
import { AuditLoggerImpl } from './services/AuditLoggerImpl';
import { InMemoryAuditLogRepository } from './repositories/InMemoryAuditLogRepository';

// 创建存储库
const repository = new InMemoryAuditLogRepository();

// 创建审计日志器
const auditLogger = new AuditLoggerImpl(repository);
```

### 2. 记录身份验证事件

```typescript
// 记录登录成功
await auditLogger.logAuthEvent({
  type: 'login',
  userId: 'user-123',
  username: 'john.doe',
  success: true,
  timestamp: new Date(),
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  metadata: {
    loginMethod: 'password',
    // 敏感数据会被自动过滤
    password: 'secret123', // 将被替换为 [REDACTED]
  }
});

// 记录登录失败
await auditLogger.logAuthEvent({
  type: 'login',
  username: 'john.doe',
  success: false,
  timestamp: new Date(),
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  metadata: {
    reason: 'invalid_credentials',
    attemptNumber: 3,
  }
});

// 记录注销
await auditLogger.logAuthEvent({
  type: 'logout',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

// 记录密码重置请求
await auditLogger.logAuthEvent({
  type: 'password_reset_request',
  username: 'john.doe',
  success: true,
  timestamp: new Date(),
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

// 记录密码重置完成
await auditLogger.logAuthEvent({
  type: 'password_reset_complete',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  metadata: {
    resetToken: 'token-xyz', // 将被替换为 [REDACTED]
  }
});

// 记录会话过期
await auditLogger.logAuthEvent({
  type: 'session_expired',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
  metadata: {
    reason: 'inactivity_timeout',
    lastActivity: new Date(Date.now() - 3600000),
  }
});
```

### 3. 查询审计日志

```typescript
// 查询特定用户的所有日志
const userLogs = await repository.findByUserId('user-123');

// 查询特定时间范围内的日志
const startTime = new Date('2024-01-01');
const endTime = new Date('2024-01-31');
const timeLogs = await repository.findByTimeRange(startTime, endTime);

// 查询特定日志
const log = await repository.findById('log-id-123');
```

## 事件类型

系统支持以下事件类型：

| 事件类型 | 描述 | 何时记录 |
|---------|------|---------|
| `login` | 用户登录 | 每次登录尝试（成功或失败） |
| `logout` | 用户注销 | 用户主动注销 |
| `password_reset_request` | 密码重置请求 | 用户请求重置密码 |
| `password_reset_complete` | 密码重置完成 | 用户完成密码重置 |
| `session_expired` | 会话过期 | 会话因超时或其他原因过期 |

## 敏感数据过滤

系统自动过滤以下敏感数据（不区分大小写）：

- `password` - 密码
- `passwordHash` - 密码哈希
- `token` - 令牌
- `sessionToken` - 会话令牌
- `resetToken` - 重置令牌
- `secret` - 密钥
- `apiKey` - API 密钥
- `accessToken` - 访问令牌
- `refreshToken` - 刷新令牌
- `authorization` - 授权信息

所有包含这些关键词的字段都会被替换为 `[REDACTED]`。

### 示例

```typescript
// 输入
await auditLogger.logAuthEvent({
  type: 'login',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
  metadata: {
    password: 'secret123',
    sessionToken: 'abc-xyz',
    loginMethod: 'password',
    nested: {
      resetToken: 'token-123',
      deviceInfo: 'iPhone',
    }
  }
});

// 存储的日志
{
  id: 'log-id',
  eventType: 'login',
  userId: 'user-123',
  success: true,
  timestamp: '2024-01-01T00:00:00.000Z',
  metadata: {
    password: '[REDACTED]',
    sessionToken: '[REDACTED]',
    loginMethod: 'password',
    nested: {
      resetToken: '[REDACTED]',
      deviceInfo: 'iPhone',
    }
  }
}
```

## API 集成

审计日志已自动集成到所有身份验证 API 端点：

- `POST /auth/login` - 记录登录尝试
- `POST /auth/logout` - 记录注销
- `POST /auth/password-reset/request` - 记录密码重置请求
- `POST /auth/password-reset/complete` - 记录密码重置完成
- `GET /auth/session/validate` - 不记录（只读操作）

每个端点都会自动记录：
- 请求的 IP 地址
- 用户代理（浏览器信息）
- 操作结果（成功/失败）
- 相关的用户信息

## 最佳实践

### 1. 始终记录安全事件

```typescript
// ✅ 好的做法
try {
  await authService.login(username, password);
  await auditLogger.logAuthEvent({
    type: 'login',
    username,
    success: true,
    timestamp: new Date(),
  });
} catch (error) {
  await auditLogger.logAuthEvent({
    type: 'login',
    username,
    success: false,
    timestamp: new Date(),
  });
  throw error;
}
```

### 2. 包含上下文信息

```typescript
// ✅ 好的做法 - 包含 IP 和用户代理
await auditLogger.logAuthEvent({
  type: 'login',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

// ❌ 不好的做法 - 缺少上下文
await auditLogger.logAuthEvent({
  type: 'login',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
});
```

### 3. 不要手动过滤敏感数据

```typescript
// ✅ 好的做法 - 让系统自动过滤
await auditLogger.logAuthEvent({
  type: 'login',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
  metadata: {
    password: userPassword, // 系统会自动过滤
  }
});

// ❌ 不好的做法 - 手动过滤可能遗漏
await auditLogger.logAuthEvent({
  type: 'login',
  userId: 'user-123',
  success: true,
  timestamp: new Date(),
  metadata: {
    password: '[REDACTED]', // 不必要
  }
});
```

### 4. 定期清理旧日志

```typescript
// 实现日志清理策略（根据需求）
async function cleanupOldLogs() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  // 实现清理逻辑
}
```

## 安全考虑

1. **敏感数据保护**：系统自动过滤所有敏感数据，无需手动处理
2. **访问控制**：只有授权的管理员应该能够访问审计日志
3. **日志完整性**：审计日志应该是只追加的，不应该被修改或删除
4. **存储安全**：在生产环境中，使用安全的数据库存储审计日志
5. **日志保留**：根据合规要求设置适当的日志保留期限

## 故障排查

### 日志未记录

检查：
1. AuditLogger 是否正确初始化
2. 是否传递给 API 路由
3. 是否有错误被静默捕获

### 敏感数据未过滤

检查：
1. 字段名是否包含敏感关键词
2. 是否需要添加新的敏感关键词到过滤列表

### 查询性能问题

考虑：
1. 在数据库中添加索引（userId, timestamp）
2. 实现日志归档策略
3. 使用专门的日志存储系统（如 Elasticsearch）

## 验证需求

此实现满足以下需求：

- ✅ **需求 7.1**：记录登录尝试的时间戳、用户标识符和结果
- ✅ **需求 7.2**：记录密码重置请求的时间戳和用户标识符
- ✅ **需求 7.3**：记录会话创建或失效的事件详情
- ✅ **需求 7.4**：包含相关的上下文信息（IP 地址、用户代理）
- ✅ **需求 7.5**：排除密码和令牌等机密数据

## 相关文件

- `src/models/AuditLog.ts` - 数据模型定义
- `src/services/AuditLogger.ts` - 接口定义
- `src/services/AuditLoggerImpl.ts` - 实现类
- `src/repositories/AuditLogRepository.ts` - 存储库接口
- `src/repositories/InMemoryAuditLogRepository.ts` - 内存存储实现
- `src/api/routes/auth.ts` - API 集成
