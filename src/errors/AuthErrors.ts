/**
 * 身份验证错误基类
 */
export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string = 'AUTH_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // 维护正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 凭据无效错误
 */
export class AuthenticationError extends AuthError {
  constructor(message: string = '用户名或密码无效', details?: any) {
    super(message, 'AUTHENTICATION_FAILED', 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * 账户锁定错误
 */
export class AccountLockedError extends AuthError {
  public readonly lockedUntil?: Date;

  constructor(message: string = '账户已被锁定，请稍后再试', lockedUntil?: Date) {
    super(message, 'ACCOUNT_LOCKED', 423, { lockedUntil });
    this.name = 'AccountLockedError';
    this.lockedUntil = lockedUntil;
  }
}

/**
 * 会话过期错误
 */
export class SessionExpiredError extends AuthError {
  constructor(message: string = '会话已过期，请重新登录') {
    super(message, 'SESSION_EXPIRED', 401);
    this.name = 'SessionExpiredError';
  }
}

/**
 * 令牌无效错误
 */
export class InvalidTokenError extends AuthError {
  constructor(message: string = '令牌无效或已过期', tokenType?: string) {
    super(message, 'INVALID_TOKEN', 400, { tokenType });
    this.name = 'InvalidTokenError';
  }
}

/**
 * 密码验证错误
 */
export class PasswordValidationError extends AuthError {
  public readonly validationErrors: string[];

  constructor(message: string = '密码不符合安全要求', validationErrors: string[] = []) {
    super(message, 'PASSWORD_VALIDATION_FAILED', 400, { validationErrors });
    this.name = 'PasswordValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * 速率限制错误
 */
export class RateLimitError extends AuthError {
  public readonly retryAfter?: number;

  constructor(message: string = '请求过于频繁，请稍后再试', retryAfter?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * 用户不存在错误（内部使用，不应暴露给客户端）
 */
export class UserNotFoundError extends AuthError {
  constructor(identifier: string) {
    // 使用通用消息以防止用户枚举
    super('用户名或密码无效', 'USER_NOT_FOUND', 401, { identifier });
    this.name = 'UserNotFoundError';
  }
}

/**
 * 输入验证错误
 */
export class ValidationError extends AuthError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
    this.name = 'ValidationError';
    this.field = field;
  }
}
