import { describe, it, expect, beforeEach } from 'vitest';
import { PasswordService } from './PasswordService';
import { InMemoryResetTokenRepository } from '../repositories/InMemoryResetTokenRepository';
import { InvalidTokenError, UserNotFoundError } from '../errors/AuthErrors';
import { UserRepository } from '../repositories/UserRepository';
import { SessionService } from './SessionService';
import { EmailService } from './EmailService';
import { User } from '../models/User';
import { Session } from '../models/Session';

/**
 * 用于测试的内存用户存储库实现
 */
class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private idCounter = 1;

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: `user-${this.idCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return { ...user };
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return { ...user };
      }
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return { ...user };
      }
    }
    return null;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`用户不存在: ${id}`);
    }
    const updatedUser = { ...user, ...updates, id, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return { ...updatedUser };
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async clear(): Promise<void> {
    this.users.clear();
  }
}

/**
 * 用于测试的模拟会话服务
 */
class MockSessionService implements SessionService {
  private invalidatedSessions: Set<string> = new Set();
  private invalidatedUserSessions: Set<string> = new Set();

  async createSession(userId: string): Promise<Session> {
    return {
      token: `session-${userId}-${Date.now()}`,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      lastActivityAt: new Date(),
    };
  }

  async getSession(sessionToken: string): Promise<Session | null> {
    if (this.invalidatedSessions.has(sessionToken)) {
      return null;
    }
    return {
      token: sessionToken,
      userId: 'test-user',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      lastActivityAt: new Date(),
    };
  }

  async invalidateSession(sessionToken: string): Promise<void> {
    this.invalidatedSessions.add(sessionToken);
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    this.invalidatedUserSessions.add(userId);
  }

  async cleanupExpiredSessions(): Promise<void> {
    // 模拟实现
  }

  wasUserSessionsInvalidated(userId: string): boolean {
    return this.invalidatedUserSessions.has(userId);
  }

  clear(): void {
    this.invalidatedSessions.clear();
    this.invalidatedUserSessions.clear();
  }
}

/**
 * 用于测试的模拟电子邮件服务
 */
class MockEmailService implements EmailService {
  public sentEmails: Array<{ email: string; token: string; username: string }> = [];

  async sendPasswordResetEmail(email: string, resetToken: string, username: string): Promise<void> {
    this.sentEmails.push({ email, token: resetToken, username });
  }

  clear(): void {
    this.sentEmails = [];
  }
}

describe('PasswordService - 密码重置功能', () => {
  let passwordService: PasswordService;
  let userRepository: InMemoryUserRepository;
  let resetTokenRepository: InMemoryResetTokenRepository;
  let sessionService: MockSessionService;
  let emailService: MockEmailService;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    resetTokenRepository = new InMemoryResetTokenRepository();
    sessionService = new MockSessionService();
    emailService = new MockEmailService();

    passwordService = new PasswordService(
      userRepository,
      resetTokenRepository,
      sessionService,
      emailService
    );

    // 清理所有数据
    await userRepository.clear();
    await resetTokenRepository.clear();
    sessionService.clear();
    emailService.clear();
  });

  describe('initiatePasswordReset', () => {
    it('应该为有效用户名生成重置令牌', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        failedLoginAttempts: 0,
      });

      // 发起密码重置
      await passwordService.initiatePasswordReset('testuser');

      // 验证令牌已创建
      const tokens = await resetTokenRepository.findByUserId(user.id);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].userId).toBe(user.id);
      expect(tokens[0].used).toBe(false);
    });

    it('应该为有效电子邮件生成重置令牌', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        failedLoginAttempts: 0,
      });

      // 发起密码重置
      await passwordService.initiatePasswordReset('test@example.com');

      // 验证令牌已创建
      const tokens = await resetTokenRepository.findByUserId(user.id);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].userId).toBe(user.id);
    });

    it('应该发送重置电子邮件', async () => {
      // 创建测试用户
      await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        failedLoginAttempts: 0,
      });

      // 发起密码重置
      await passwordService.initiatePasswordReset('testuser');

      // 验证电子邮件已发送
      expect(emailService.sentEmails).toHaveLength(1);
      expect(emailService.sentEmails[0].email).toBe('test@example.com');
      expect(emailService.sentEmails[0].username).toBe('testuser');
    });

    it('应该使之前的重置令牌失效', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        failedLoginAttempts: 0,
      });

      // 第一次重置请求
      await passwordService.initiatePasswordReset('testuser');
      const firstTokens = await resetTokenRepository.findByUserId(user.id);
      expect(firstTokens).toHaveLength(1);
      const firstToken = firstTokens[0];

      // 第二次重置请求
      await passwordService.initiatePasswordReset('testuser');

      // 验证第一个令牌已失效
      const updatedFirstToken = await resetTokenRepository.findByToken(firstToken.token);
      expect(updatedFirstToken?.used).toBe(true);

      // 验证有新令牌
      const allTokens = await resetTokenRepository.findByUserId(user.id);
      const activeTokens = allTokens.filter(t => !t.used);
      expect(activeTokens).toHaveLength(1);
    });

    it('对于不存在的用户应该静默返回（防止账户枚举）', async () => {
      // 尝试为不存在的用户重置密码
      await expect(passwordService.initiatePasswordReset('nonexistent')).resolves.not.toThrow();

      // 验证没有令牌被创建
      expect(emailService.sentEmails).toHaveLength(0);
    });

    it('应该为空输入静默返回', async () => {
      await expect(passwordService.initiatePasswordReset('')).resolves.not.toThrow();
      expect(emailService.sentEmails).toHaveLength(0);
    });
  });

  describe('completePasswordReset', () => {
    it('应该使用有效令牌成功重置密码', async () => {
      // 创建测试用户
      const oldPassword = 'OldPassword123!';
      const oldPasswordHash = await passwordService.hashPassword(oldPassword);
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: oldPasswordHash,
        failedLoginAttempts: 0,
      });

      // 生成重置令牌
      await passwordService.initiatePasswordReset('testuser');
      const tokens = await resetTokenRepository.findByUserId(user.id);
      const resetToken = tokens[0].token;

      // 完成密码重置
      const newPassword = 'NewPassword456!';
      const result = await passwordService.completePasswordReset(resetToken, newPassword);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // 验证密码已更新
      const updatedUser = await userRepository.findById(user.id);
      expect(updatedUser).not.toBeNull();
      const isNewPasswordValid = await passwordService.verifyPassword(newPassword, updatedUser!.passwordHash);
      expect(isNewPasswordValid).toBe(true);
    });

    it('应该拒绝无效的令牌', async () => {
      const newPassword = 'NewPassword456!';
      
      await expect(
        passwordService.completePasswordReset('invalid-token', newPassword)
      ).rejects.toThrow(InvalidTokenError);
    });

    it('应该拒绝已使用的令牌', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await passwordService.hashPassword('OldPassword123!'),
        failedLoginAttempts: 0,
      });

      // 生成并使用令牌
      await passwordService.initiatePasswordReset('testuser');
      const tokens = await resetTokenRepository.findByUserId(user.id);
      const resetToken = tokens[0].token;

      // 第一次使用令牌
      await passwordService.completePasswordReset(resetToken, 'NewPassword456!');

      // 尝试再次使用相同令牌
      await expect(
        passwordService.completePasswordReset(resetToken, 'AnotherPassword789!')
      ).rejects.toThrow(InvalidTokenError);
    });

    it('应该拒绝过期的令牌', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await passwordService.hashPassword('OldPassword123!'),
        failedLoginAttempts: 0,
      });

      // 手动创建过期令牌
      const expiredToken = await resetTokenRepository.create({
        token: 'expired-token',
        userId: user.id,
        createdAt: new Date(Date.now() - 7200000), // 2小时前
        expiresAt: new Date(Date.now() - 3600000), // 1小时前过期
        used: false,
      });

      // 尝试使用过期令牌
      await expect(
        passwordService.completePasswordReset(expiredToken.token, 'NewPassword456!')
      ).rejects.toThrow(InvalidTokenError);
    });

    it('应该拒绝弱密码', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await passwordService.hashPassword('OldPassword123!'),
        failedLoginAttempts: 0,
      });

      // 生成重置令牌
      await passwordService.initiatePasswordReset('testuser');
      const tokens = await resetTokenRepository.findByUserId(user.id);
      const resetToken = tokens[0].token;

      // 尝试使用弱密码
      const result = await passwordService.completePasswordReset(resetToken, 'weak');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('应该使所有用户会话失效', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await passwordService.hashPassword('OldPassword123!'),
        failedLoginAttempts: 0,
      });

      // 生成重置令牌
      await passwordService.initiatePasswordReset('testuser');
      const tokens = await resetTokenRepository.findByUserId(user.id);
      const resetToken = tokens[0].token;

      // 完成密码重置
      await passwordService.completePasswordReset(resetToken, 'NewPassword456!');

      // 验证会话已失效
      expect(sessionService.wasUserSessionsInvalidated(user.id)).toBe(true);
    });

    it('应该标记令牌为已使用', async () => {
      // 创建测试用户
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await passwordService.hashPassword('OldPassword123!'),
        failedLoginAttempts: 0,
      });

      // 生成重置令牌
      await passwordService.initiatePasswordReset('testuser');
      const tokens = await resetTokenRepository.findByUserId(user.id);
      const resetToken = tokens[0].token;

      // 完成密码重置
      await passwordService.completePasswordReset(resetToken, 'NewPassword456!');

      // 验证令牌已标记为已使用
      const updatedToken = await resetTokenRepository.findByToken(resetToken);
      expect(updatedToken?.used).toBe(true);
    });

    it('应该拒绝重用最近的密码', async () => {
      // 创建测试用户
      const oldPassword = 'OldPassword123!';
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await passwordService.hashPassword(oldPassword),
        failedLoginAttempts: 0,
      });

      // 生成重置令牌
      await passwordService.initiatePasswordReset('testuser');
      const tokens = await resetTokenRepository.findByUserId(user.id);
      const resetToken = tokens[0].token;

      // 尝试使用相同的旧密码
      const result = await passwordService.completePasswordReset(resetToken, oldPassword);

      expect(result.success).toBe(false);
      expect(result.error).toContain('不能使用最近使用过的密码');
    });

    it('应该更新密码历史', async () => {
      // 创建测试用户
      const oldPassword = 'OldPassword123!';
      const oldPasswordHash = await passwordService.hashPassword(oldPassword);
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: oldPasswordHash,
        failedLoginAttempts: 0,
        passwordHistory: [],
      });

      // 生成重置令牌
      await passwordService.initiatePasswordReset('testuser');
      const tokens = await resetTokenRepository.findByUserId(user.id);
      const resetToken = tokens[0].token;

      // 完成密码重置
      const newPassword = 'NewPassword456!';
      await passwordService.completePasswordReset(resetToken, newPassword);

      // 验证密码历史已更新
      const updatedUser = await userRepository.findById(user.id);
      expect(updatedUser?.passwordHistory).toBeDefined();
      expect(updatedUser?.passwordHistory?.length).toBeGreaterThan(0);
      
      // 旧密码应该在历史中
      const oldPasswordInHistory = await passwordService.verifyPassword(
        oldPassword,
        updatedUser!.passwordHistory![0]
      );
      expect(oldPasswordInHistory).toBe(true);
    });

    it('应该拒绝空令牌', async () => {
      const result = await passwordService.completePasswordReset('', 'NewPassword456!');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('重置令牌不能为空');
    });

    it('应该拒绝空密码', async () => {
      const result = await passwordService.completePasswordReset('some-token', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('新密码不能为空');
    });
  });
});
