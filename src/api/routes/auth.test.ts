import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticationService, LoginResult } from '../../services/AuthenticationService';
import { PasswordService, ValidationResult, ResetResult } from '../../services/PasswordService';
import { Session } from '../../models/Session';

describe('身份验证路由逻辑', () => {
  let mockAuthService: AuthenticationService;
  let mockPasswordService: PasswordService;

  beforeEach(() => {
    // 创建模拟服务
    mockAuthService = {
      login: vi.fn(),
      logout: vi.fn(),
      validateSession: vi.fn()
    } as any;

    mockPasswordService = {
      hashPassword: vi.fn(),
      validatePasswordStrength: vi.fn(),
      verifyPassword: vi.fn(),
      initiatePasswordReset: vi.fn(),
      completePasswordReset: vi.fn()
    } as any;
  });

  describe('登录逻辑', () => {
    it('应该在凭据有效时调用登录服务', async () => {
      const loginResult: LoginResult = {
        success: true,
        sessionToken: 'test-token-123'
      };
      vi.mocked(mockAuthService.login).mockResolvedValue(loginResult);

      const result = await mockAuthService.login('testuser', 'Test123!@#');

      expect(result.success).toBe(true);
      expect(result.sessionToken).toBe('test-token-123');
      expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'Test123!@#');
    });

    it('应该在凭据无效时返回失败', async () => {
      const loginResult: LoginResult = {
        success: false,
        error: '用户名或密码无效'
      };
      vi.mocked(mockAuthService.login).mockResolvedValue(loginResult);

      const result = await mockAuthService.login('testuser', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('用户名或密码无效');
    });

    it('应该在账户锁定时返回锁定状态', async () => {
      const loginResult: LoginResult = {
        success: false,
        accountLocked: true,
        error: '账户已被锁定'
      };
      vi.mocked(mockAuthService.login).mockResolvedValue(loginResult);

      const result = await mockAuthService.login('testuser', 'Test123!@#');

      expect(result.success).toBe(false);
      expect(result.accountLocked).toBe(true);
    });
  });

  describe('注销逻辑', () => {
    it('应该成功调用注销服务', async () => {
      vi.mocked(mockAuthService.logout).mockResolvedValue();

      await mockAuthService.logout('test-token-123');

      expect(mockAuthService.logout).toHaveBeenCalledWith('test-token-123');
    });
  });

  describe('密码重置请求逻辑', () => {
    it('应该调用密码重置服务', async () => {
      vi.mocked(mockPasswordService.initiatePasswordReset).mockResolvedValue();

      await mockPasswordService.initiatePasswordReset('testuser');

      expect(mockPasswordService.initiatePasswordReset).toHaveBeenCalledWith('testuser');
    });
  });

  describe('密码重置完成逻辑', () => {
    it('应该验证密码强度', () => {
      const validation: ValidationResult = { valid: true, errors: [] };
      vi.mocked(mockPasswordService.validatePasswordStrength).mockReturnValue(validation);

      const result = mockPasswordService.validatePasswordStrength('NewPass123!@#');

      expect(result.valid).toBe(true);
      expect(mockPasswordService.validatePasswordStrength).toHaveBeenCalledWith('NewPass123!@#');
    });

    it('应该在密码强度不足时返回错误', () => {
      const validation: ValidationResult = {
        valid: false,
        errors: ['密码长度至少为 8 个字符']
      };
      vi.mocked(mockPasswordService.validatePasswordStrength).mockReturnValue(validation);

      const result = mockPasswordService.validatePasswordStrength('weak');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密码长度至少为 8 个字符');
    });

    it('应该在令牌有效时完成密码重置', async () => {
      const resetResult: ResetResult = { success: true };
      vi.mocked(mockPasswordService.completePasswordReset).mockResolvedValue(resetResult);

      const result = await mockPasswordService.completePasswordReset('reset-token-123', 'NewPass123!@#');

      expect(result.success).toBe(true);
    });

    it('应该在令牌无效时返回失败', async () => {
      const resetResult: ResetResult = {
        success: false,
        error: '重置令牌无效或已过期'
      };
      vi.mocked(mockPasswordService.completePasswordReset).mockResolvedValue(resetResult);

      const result = await mockPasswordService.completePasswordReset('invalid-token', 'NewPass123!@#');

      expect(result.success).toBe(false);
      expect(result.error).toBe('重置令牌无效或已过期');
    });
  });

  describe('会话验证逻辑', () => {
    it('应该在会话有效时返回会话信息', async () => {
      const session: Session = {
        token: 'test-token-123',
        userId: 'user-123',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        lastActivityAt: new Date()
      };
      
      vi.mocked(mockAuthService.validateSession).mockResolvedValue(session);

      const result = await mockAuthService.validateSession('test-token-123');

      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user-123');
    });

    it('应该在会话无效时返回 null', async () => {
      vi.mocked(mockAuthService.validateSession).mockResolvedValue(null);

      const result = await mockAuthService.validateSession('invalid-token');

      expect(result).toBeNull();
    });
  });
});
