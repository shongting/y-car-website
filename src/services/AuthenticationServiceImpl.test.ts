import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationServiceImpl } from './AuthenticationServiceImpl';
import { UserRepository } from '../repositories/UserRepository';
import { IPasswordService } from './PasswordService';
import { SessionService } from './SessionService';
import { RateLimiter } from './RateLimiter';
import { AuditLogger } from './AuditLogger';
import { User } from '../models/User';
import { Session } from '../models/Session';
import {
  ValidationError,
  RateLimitError,
} from '../errors/AuthErrors';

describe('AuthenticationServiceImpl', () => {
  let authService: AuthenticationServiceImpl;
  let mockUserRepository: UserRepository;
  let mockPasswordService: IPasswordService;
  let mockSessionService: SessionService;
  let mockRateLimiter: RateLimiter;
  let mockAuditLogger: AuditLogger;

  const testUser: User = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
    failedLoginAttempts: 0,
  };

  const testSession: Session = {
    token: 'session-token-123',
    userId: 'user-123',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000), // 1 小时后
    lastActivityAt: new Date(),
  };

  beforeEach(() => {
    // 创建 mock 对象
    mockUserRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUsername: vi.fn(),
      findByEmail: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockPasswordService = {
      hashPassword: vi.fn(),
      validatePasswordStrength: vi.fn(),
      verifyPassword: vi.fn(),
      initiatePasswordReset: vi.fn(),
      completePasswordReset: vi.fn(),
    };

    mockSessionService = {
      createSession: vi.fn(),
      getSession: vi.fn(),
      invalidateSession: vi.fn(),
      invalidateAllUserSessions: vi.fn(),
      cleanupExpiredSessions: vi.fn(),
    };

    mockRateLimiter = {
      checkLimit: vi.fn(),
      recordAttempt: vi.fn(),
      resetLimit: vi.fn(),
    };

    mockAuditLogger = {
      logAuthEvent: vi.fn(),
    };

    authService = new AuthenticationServiceImpl(
      mockUserRepository,
      mockPasswordService,
      mockSessionService,
      mockRateLimiter,
      mockAuditLogger
    );
  });

  describe('login', () => {
    it('应该在凭据有效时成功登录', async () => {
      // 设置 mocks
      vi.mocked(mockRateLimiter.checkLimit).mockResolvedValue(true);
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(testUser);
      vi.mocked(mockPasswordService.verifyPassword).mockResolvedValue(true);
      vi.mocked(mockSessionService.createSession).mockResolvedValue(testSession);

      // 执行登录
      const result = await authService.login('testuser', 'password123');

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.sessionToken).toBe('session-token-123');
      expect(result.error).toBeUndefined();

      // 验证调用
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith('testuser', 'login');
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(mockSessionService.createSession).toHaveBeenCalledWith('user-123');
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', expect.objectContaining({
        failedLoginAttempts: 0,
        accountLockedUntil: undefined,
      }));
      expect(mockRateLimiter.resetLimit).toHaveBeenCalledWith('testuser', 'login');
      expect(mockAuditLogger.logAuthEvent).toHaveBeenCalled();
    });

    it('应该在用户不存在时拒绝登录', async () => {
      vi.mocked(mockRateLimiter.checkLimit).mockResolvedValue(true);
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(null);

      const result = await authService.login('nonexistent', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('用户名或密码无效');
      expect(result.sessionToken).toBeUndefined();
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith('nonexistent', 'login');
    });

    it('应该在密码无效时拒绝登录', async () => {
      vi.mocked(mockRateLimiter.checkLimit).mockResolvedValue(true);
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(testUser);
      vi.mocked(mockPasswordService.verifyPassword).mockResolvedValue(false);

      const result = await authService.login('testuser', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('用户名或密码无效');
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', expect.objectContaining({
        failedLoginAttempts: 1,
      }));
      expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith('testuser', 'login');
    });

    it('应该在达到最大失败次数后锁定账户', async () => {
      const userWithFailedAttempts = {
        ...testUser,
        failedLoginAttempts: 4, // 已经失败 4 次
      };

      vi.mocked(mockRateLimiter.checkLimit).mockResolvedValue(true);
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(userWithFailedAttempts);
      vi.mocked(mockPasswordService.verifyPassword).mockResolvedValue(false);

      const result = await authService.login('testuser', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.accountLocked).toBe(true);
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', expect.objectContaining({
        failedLoginAttempts: 5,
        accountLockedUntil: expect.any(Date),
      }));
    });

    it('应该在账户被锁定时拒绝登录', async () => {
      const lockedUser = {
        ...testUser,
        accountLockedUntil: new Date(Date.now() + 900000), // 15 分钟后
      };

      vi.mocked(mockRateLimiter.checkLimit).mockResolvedValue(true);
      vi.mocked(mockUserRepository.findByUsername).mockResolvedValue(lockedUser);

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(result.accountLocked).toBe(true);
      expect(result.error).toBe('账户已被锁定，请稍后再试');
      expect(mockPasswordService.verifyPassword).not.toHaveBeenCalled();
    });

    it('应该在超过速率限制时抛出错误', async () => {
      vi.mocked(mockRateLimiter.checkLimit).mockResolvedValue(false);

      await expect(authService.login('testuser', 'password123')).rejects.toThrow(RateLimitError);
      expect(mockUserRepository.findByUsername).not.toHaveBeenCalled();
    });

    it('应该在输入为空时抛出验证错误', async () => {
      await expect(authService.login('', 'password123')).rejects.toThrow(ValidationError);
      await expect(authService.login('testuser', '')).rejects.toThrow(ValidationError);
    });
  });

  describe('logout', () => {
    it('应该成功注销有效会话', async () => {
      vi.mocked(mockSessionService.getSession).mockResolvedValue(testSession);

      await authService.logout('session-token-123');

      expect(mockSessionService.getSession).toHaveBeenCalledWith('session-token-123');
      expect(mockSessionService.invalidateSession).toHaveBeenCalledWith('session-token-123');
      expect(mockAuditLogger.logAuthEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'logout',
          userId: 'user-123',
          success: true,
        })
      );
    });

    it('应该在会话不存在时静默成功', async () => {
      vi.mocked(mockSessionService.getSession).mockResolvedValue(null);

      await authService.logout('invalid-token');

      expect(mockSessionService.invalidateSession).not.toHaveBeenCalled();
    });

    it('应该在令牌为空时抛出验证错误', async () => {
      await expect(authService.logout('')).rejects.toThrow(ValidationError);
    });
  });

  describe('validateSession', () => {
    it('应该返回有效会话', async () => {
      vi.mocked(mockSessionService.getSession).mockResolvedValue(testSession);

      const result = await authService.validateSession('session-token-123');

      expect(result).toEqual(testSession);
      expect(mockSessionService.getSession).toHaveBeenCalledWith('session-token-123');
    });

    it('应该在会话不存在时返回 null', async () => {
      vi.mocked(mockSessionService.getSession).mockResolvedValue(null);

      const result = await authService.validateSession('invalid-token');

      expect(result).toBeNull();
    });

    it('应该在会话过期时使其失效并返回 null', async () => {
      const expiredSession = {
        ...testSession,
        expiresAt: new Date(Date.now() - 1000), // 已过期
      };

      vi.mocked(mockSessionService.getSession).mockResolvedValue(expiredSession);

      const result = await authService.validateSession('session-token-123');

      expect(result).toBeNull();
      expect(mockSessionService.invalidateSession).toHaveBeenCalledWith('session-token-123');
      expect(mockAuditLogger.logAuthEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session_expired',
          userId: 'user-123',
          success: false,
        })
      );
    });

    it('应该在令牌为空时返回 null', async () => {
      const result = await authService.validateSession('');

      expect(result).toBeNull();
      expect(mockSessionService.getSession).not.toHaveBeenCalled();
    });
  });
});
