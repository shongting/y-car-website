import { AuthenticationService, LoginResult } from './AuthenticationService';
import { Session } from '../models/Session';
import { SessionService } from './SessionService';
import { IPasswordService } from './PasswordService';
import { UserRepository } from '../repositories/UserRepository';
import { RateLimiter } from './RateLimiter';
import { AuditLogger } from './AuditLogger';
import {
  AuthenticationError,
  AccountLockedError,
  RateLimitError,
  SessionExpiredError,
  ValidationError,
} from '../errors/AuthErrors';

/**
 * 身份验证服务实现
 * 负责核心身份验证操作：登录、注销和会话验证
 */
export class AuthenticationServiceImpl implements AuthenticationService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;
  private readonly RATE_LIMIT_OPERATION = 'login';

  constructor(
    private userRepository: UserRepository,
    private passwordService: IPasswordService,
    private sessionService: SessionService,
    private rateLimiter: RateLimiter,
    private auditLogger: AuditLogger
  ) {}

  /**
   * 使用凭据对用户进行身份验证
   * 
   * 实现需求：
   * - 1.1: 验证有效凭据并创建会话
   * - 1.2: 拒绝无效凭据
   * - 1.3: 返回会话令牌
   * - 1.4: 实施速率限制和账户锁定
   * 
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果
   */
  async login(username: string, password: string): Promise<LoginResult> {
    const startTime = Date.now();
    let userId: string | undefined;
    let success = false;

    try {
      // 验证输入
      if (!username || !password) {
        throw new ValidationError('用户名和密码不能为空');
      }

      // 检查速率限制
      const isAllowed = await this.rateLimiter.checkLimit(username, this.RATE_LIMIT_OPERATION);
      if (!isAllowed) {
        await this.auditLogger.logAuthEvent({
          type: 'login',
          username,
          success: false,
          timestamp: new Date(),
          metadata: { reason: 'rate_limit_exceeded' },
        });

        throw new RateLimitError('登录尝试过于频繁，请稍后再试');
      }

      // 查找用户
      const user = await this.userRepository.findByUsername(username);
      
      if (!user) {
        // 记录失败的尝试（用于速率限制）
        await this.rateLimiter.recordAttempt(username, this.RATE_LIMIT_OPERATION);
        
        await this.auditLogger.logAuthEvent({
          type: 'login',
          username,
          success: false,
          timestamp: new Date(),
          metadata: { reason: 'user_not_found' },
        });

        // 返回通用错误消息以防止用户枚举
        return {
          success: false,
          error: '用户名或密码无效',
        };
      }

      userId = user.id;

      // 检查账户是否被锁定
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        await this.auditLogger.logAuthEvent({
          type: 'login',
          userId: user.id,
          username,
          success: false,
          timestamp: new Date(),
          metadata: { 
            reason: 'account_locked',
            lockedUntil: user.accountLockedUntil.toISOString(),
          },
        });

        return {
          success: false,
          error: '账户已被锁定，请稍后再试',
          accountLocked: true,
        };
      }

      // 验证密码
      const isPasswordValid = await this.passwordService.verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        // 增加失败尝试计数
        const failedAttempts = user.failedLoginAttempts + 1;
        const updates: any = {
          failedLoginAttempts: failedAttempts,
          updatedAt: new Date(),
        };

        // 如果达到最大失败次数，锁定账户
        if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000);
          updates.accountLockedUntil = lockoutUntil;
        }

        await this.userRepository.update(user.id, updates);

        // 记录失败的尝试（用于速率限制）
        await this.rateLimiter.recordAttempt(username, this.RATE_LIMIT_OPERATION);

        await this.auditLogger.logAuthEvent({
          type: 'login',
          userId: user.id,
          username,
          success: false,
          timestamp: new Date(),
          metadata: { 
            reason: 'invalid_password',
            failedAttempts,
            accountLocked: failedAttempts >= this.MAX_FAILED_ATTEMPTS,
          },
        });

        // 返回通用错误消息
        return {
          success: false,
          error: '用户名或密码无效',
          accountLocked: failedAttempts >= this.MAX_FAILED_ATTEMPTS,
        };
      }

      // 登录成功 - 重置失败尝试计数并更新最后登录时间
      await this.userRepository.update(user.id, {
        failedLoginAttempts: 0,
        accountLockedUntil: undefined,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      });

      // 重置速率限制
      await this.rateLimiter.resetLimit(username, this.RATE_LIMIT_OPERATION);

      // 创建会话
      const session = await this.sessionService.createSession(user.id);

      success = true;

      await this.auditLogger.logAuthEvent({
        type: 'login',
        userId: user.id,
        username,
        success: true,
        timestamp: new Date(),
        metadata: {
          sessionToken: session.token,
        },
      });

      return {
        success: true,
        sessionToken: session.token,
      };
    } catch (error) {
      // 记录错误
      await this.auditLogger.logAuthEvent({
        type: 'login',
        userId,
        username,
        success: false,
        timestamp: new Date(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // 重新抛出已知的错误类型
      if (
        error instanceof ValidationError ||
        error instanceof RateLimitError ||
        error instanceof AccountLockedError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }

      // 对于未知错误，返回通用错误
      return {
        success: false,
        error: '登录失败，请稍后再试',
      };
    }
  }

  /**
   * 使会话失效
   * 
   * 实现需求：
   * - 2.1: 使会话令牌失效
   * - 2.3: 从服务器端存储中删除会话数据
   * 
   * @param sessionToken 会话令牌
   */
  async logout(sessionToken: string): Promise<void> {
    if (!sessionToken) {
      throw new ValidationError('会话令牌不能为空');
    }

    // 获取会话以记录用户信息
    const session = await this.sessionService.getSession(sessionToken);
    
    if (session) {
      // 使会话失效
      await this.sessionService.invalidateSession(sessionToken);

      // 记录注销事件
      await this.auditLogger.logAuthEvent({
        type: 'logout',
        userId: session.userId,
        success: true,
        timestamp: new Date(),
        metadata: {
          sessionToken,
        },
      });
    }
    // 如果会话不存在，静默成功（幂等操作）
  }

  /**
   * 验证会话令牌
   * 
   * 实现需求：
   * - 5.3: 检查令牌是否存在、有效且未过期
   * 
   * @param sessionToken 会话令牌
   * @returns 会话对象，如果无效则返回 null
   */
  async validateSession(sessionToken: string): Promise<Session | null> {
    if (!sessionToken) {
      return null;
    }

    // 获取会话
    const session = await this.sessionService.getSession(sessionToken);

    if (!session) {
      return null;
    }

    // 检查会话是否过期
    const now = new Date();
    if (now > session.expiresAt) {
      // 会话已过期，使其失效
      await this.sessionService.invalidateSession(sessionToken);

      await this.auditLogger.logAuthEvent({
        type: 'session_expired',
        userId: session.userId,
        success: false,
        timestamp: new Date(),
        metadata: {
          sessionToken,
          expiresAt: session.expiresAt.toISOString(),
        },
      });

      return null;
    }

    // 会话有效
    return session;
  }
}
