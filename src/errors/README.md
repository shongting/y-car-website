# 错误处理系统

本文档描述了用户身份验证系统中的错误处理机制。

## 错误类层次结构

所有身份验证相关的错误都继承自 `AuthError` 基类：

```
AuthError (基类)
├── AuthenticationError (凭据无效)
├── AccountLockedError (账户被锁定)
├── SessionExpiredError (会话过期)
├── InvalidTokenError (令牌无效)
├── PasswordValidationError (密码验证失败)
├── RateLimitError (速率限制)
├── UserNotFoundError (用户不存在 - 内部使用)
└── ValidationError (输入验证失败)
```

## 错误类属性

每个 `AuthError` 包含以下属性：

- `message`: 用户友好的错误消息
- `code`: 机器可读的错误代码（例如 `AUTHENTICATION_FAILED`）
- `statusCode`: HTTP 状态码（例如 401, 400, 429）
- `details`: 可选的额外上下文信息
- `name`: 错误类名称

## 使用示例

### 在服务层抛出错误

```typescript
import { AuthenticationError, AccountLockedError } from '../errors/AuthErrors';

async function login(username: string, password: string) {
  const user = await userRepository.findByUsername(username);
  
  if (!user) {
    throw new AuthenticationError('用户名或密码无效');
  }
  
  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    throw new AccountLockedError('账户已被锁定', user.accountLockedUntil);
  }
  
  // ... 其他逻辑
}
```

### 在 API 路由中使用 asyncHandler

```typescript
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../../errors/AuthErrors';

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  if (!username) {
    throw new ValidationError('用户名是必需的', 'username');
  }
  
  const result = await authService.login(username, password);
  res.json({ success: true, sessionToken: result.sessionToken });
}));
```

## 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": "用户友好的错误消息",
  "code": "ERROR_CODE",
  "details": {
    "额外的上下文信息": "..."
  }
}
```

## 安全考虑

### 防止信息泄露

1. **通用错误消息**：对于敏感操作（如登录、密码重置），使用通用消息以防止用户枚举：
   ```typescript
   // ✅ 好的做法
   throw new AuthenticationError('用户名或密码无效');
   
   // ❌ 不好的做法
   throw new Error('用户不存在');
   ```

2. **敏感数据过滤**：`sanitizeErrorDetails` 函数自动移除敏感字段：
   - password
   - passwordHash
   - token
   - sessionToken
   - resetToken

3. **内部错误隐藏**：未知错误（非 AuthError）返回通用的"服务器内部错误"消息。

### 密码重置的特殊处理

密码重置请求始终返回成功消息，即使用户不存在：

```typescript
router.post('/password-reset/request', asyncHandler(async (req, res) => {
  try {
    await passwordService.initiatePasswordReset(usernameOrEmail);
  } catch (error) {
    // 即使出错也返回通用消息
  }
  
  return res.json({
    success: true,
    message: '如果该账户存在，密码重置链接已发送到注册的电子邮件地址'
  });
}));
```

## HTTP 状态码映射

| 错误类型 | 状态码 | 说明 |
|---------|--------|------|
| AuthenticationError | 401 | 未授权 - 凭据无效 |
| SessionExpiredError | 401 | 未授权 - 会话过期 |
| ValidationError | 400 | 错误请求 - 输入验证失败 |
| InvalidTokenError | 400 | 错误请求 - 令牌无效 |
| PasswordValidationError | 400 | 错误请求 - 密码不符合要求 |
| AccountLockedError | 423 | 已锁定 - 账户被锁定 |
| RateLimitError | 429 | 请求过多 - 超过速率限制 |
| 其他错误 | 500 | 服务器内部错误 |

## 错误代码列表

| 代码 | 说明 |
|------|------|
| AUTHENTICATION_FAILED | 身份验证失败 |
| ACCOUNT_LOCKED | 账户已锁定 |
| SESSION_EXPIRED | 会话已过期 |
| INVALID_TOKEN | 令牌无效 |
| PASSWORD_VALIDATION_FAILED | 密码验证失败 |
| RATE_LIMIT_EXCEEDED | 超过速率限制 |
| USER_NOT_FOUND | 用户不存在（内部使用） |
| VALIDATION_ERROR | 输入验证错误 |
| INTERNAL_SERVER_ERROR | 服务器内部错误 |

## 中间件

### errorHandler

全局错误处理中间件，捕获所有未处理的错误并格式化响应。

在 `app.ts` 中使用：

```typescript
import { errorHandler } from './middleware/errorHandler';

// 必须在所有路由之后注册
app.use(errorHandler);
```

### asyncHandler

包装异步路由处理器，自动捕获 Promise 拒绝：

```typescript
import { asyncHandler } from './middleware/errorHandler';

router.post('/endpoint', asyncHandler(async (req, res) => {
  // 任何抛出的错误都会被捕获并传递给 errorHandler
  const result = await someAsyncOperation();
  res.json(result);
}));
```

## 测试

错误处理系统包含完整的单元测试，位于 `src/api/middleware/errorHandler.test.ts`。

运行测试：

```bash
npm test -- src/api/middleware/errorHandler.test.ts
```

## 最佳实践

1. **使用特定的错误类**：根据错误类型选择合适的错误类
2. **提供上下文**：在 details 中包含有用的调试信息（但不包含敏感数据）
3. **使用 asyncHandler**：包装所有异步路由处理器
4. **记录错误**：在服务层记录详细错误，但只向客户端返回安全信息
5. **一致的消息**：使用清晰、一致的错误消息
6. **测试错误路径**：为错误场景编写测试用例
