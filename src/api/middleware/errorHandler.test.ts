import { describe, it, expect } from 'vitest';
import { formatErrorResponse, sanitizeErrorDetails } from './errorHandler';
import {
  AuthError,
  AuthenticationError,
  AccountLockedError,
  SessionExpiredError,
  InvalidTokenError,
  PasswordValidationError,
  RateLimitError,
  ValidationError
} from '../../errors/AuthErrors';

describe('错误处理', () => {
  describe('formatErrorResponse', () => {
    it('应该格式化 AuthenticationError', () => {
      const error = new AuthenticationError('测试错误');
      const response = formatErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toBe('测试错误');
      expect(response.code).toBe('AUTHENTICATION_FAILED');
    });

    it('应该格式化 AccountLockedError', () => {
      const lockedUntil = new Date('2024-12-31');
      const error = new AccountLockedError('账户已锁定', lockedUntil);
      const response = formatErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toBe('账户已锁定');
      expect(response.code).toBe('ACCOUNT_LOCKED');
      expect(response.details).toBeDefined();
    });

    it('应该格式化 PasswordValidationError', () => {
      const errors = ['密码太短', '缺少特殊字符'];
      const error = new PasswordValidationError('密码无效', errors);
      const response = formatErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.code).toBe('PASSWORD_VALIDATION_FAILED');
      expect(response.details?.validationErrors).toEqual(errors);
    });

    it('应该格式化 RateLimitError', () => {
      const error = new RateLimitError('请求过多', 60);
      const response = formatErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.details?.retryAfter).toBe(60);
    });

    it('应该处理未知错误并隐藏细节', () => {
      const error = new Error('内部数据库错误');
      const response = formatErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toBe('服务器内部错误');
      expect(response.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.details).toBeUndefined();
    });
  });

  describe('sanitizeErrorDetails', () => {
    it('应该移除敏感字段', () => {
      const details = {
        username: 'testuser',
        password: 'secret123',
        token: 'abc123',
        sessionToken: 'xyz789',
        resetToken: 'reset456',
        passwordHash: 'hash123',
        otherField: 'safe'
      };

      const sanitized = sanitizeErrorDetails(details);

      expect(sanitized.username).toBe('testuser');
      expect(sanitized.otherField).toBe('safe');
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.token).toBeUndefined();
      expect(sanitized.sessionToken).toBeUndefined();
      expect(sanitized.resetToken).toBeUndefined();
      expect(sanitized.passwordHash).toBeUndefined();
    });

    it('应该处理 undefined 详情', () => {
      const sanitized = sanitizeErrorDetails(undefined);
      expect(sanitized).toBeUndefined();
    });

    it('应该处理空对象', () => {
      const sanitized = sanitizeErrorDetails({});
      expect(sanitized).toEqual({});
    });
  });

  describe('错误类', () => {
    it('AuthenticationError 应该有正确的属性', () => {
      const error = new AuthenticationError();
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_FAILED');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('用户名或密码无效');
    });

    it('AccountLockedError 应该包含锁定时间', () => {
      const lockedUntil = new Date('2024-12-31');
      const error = new AccountLockedError('账户已锁定', lockedUntil);
      expect(error.lockedUntil).toBe(lockedUntil);
      expect(error.statusCode).toBe(423);
    });

    it('SessionExpiredError 应该有正确的状态码', () => {
      const error = new SessionExpiredError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('SESSION_EXPIRED');
    });

    it('InvalidTokenError 应该包含令牌类型', () => {
      const error = new InvalidTokenError('令牌无效', 'reset');
      expect(error.details?.tokenType).toBe('reset');
      expect(error.statusCode).toBe(400);
    });

    it('PasswordValidationError 应该包含验证错误', () => {
      const errors = ['太短', '缺少数字'];
      const error = new PasswordValidationError('密码无效', errors);
      expect(error.validationErrors).toEqual(errors);
      expect(error.statusCode).toBe(400);
    });

    it('RateLimitError 应该包含重试时间', () => {
      const error = new RateLimitError('请求过多', 120);
      expect(error.retryAfter).toBe(120);
      expect(error.statusCode).toBe(429);
    });

    it('ValidationError 应该包含字段名', () => {
      const error = new ValidationError('用户名是必需的', 'username');
      expect(error.field).toBe('username');
      expect(error.statusCode).toBe(400);
    });
  });
});
