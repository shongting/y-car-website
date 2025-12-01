import { Router, Request, Response } from 'express';
import { AuthenticationService } from '../../services/AuthenticationService';
import { PasswordService } from '../../services/PasswordService';
import { AuditLogger } from '../../services/AuditLogger';
import { getClientIp, getUserAgent } from '../middleware/security';
import { asyncHandler, validateRequiredFields } from '../middleware/errorHandler';
import { 
  AuthenticationError, 
  AccountLockedError, 
  ValidationError,
  PasswordValidationError,
  InvalidTokenError
} from '../../errors/AuthErrors';

/**
 * 登录请求体
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 注销请求体
 */
interface LogoutRequest {
  sessionToken: string;
}

/**
 * 密码重置请求体
 */
interface PasswordResetRequestBody {
  usernameOrEmail: string;
}

/**
 * 密码重置完成请求体
 */
interface PasswordResetCompleteBody {
  resetToken: string;
  newPassword: string;
}

/**
 * 会话验证请求
 */
interface SessionValidateRequest {
  sessionToken: string;
}

/**
 * 创建身份验证路由
 */
export function createAuthRouter(
  authService: AuthenticationService,
  passwordService: PasswordService,
  auditLogger?: AuditLogger
): Router {
  const router = Router();

  /**
   * POST /auth/login
   * 用户登录端点
   */
  router.post('/login', asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const { username, password } = req.body as LoginRequest;

    // 输入验证
    validateRequiredFields(req.body, [
      { name: 'username', type: 'string' },
      { name: 'password', type: 'string' }
    ]);

    try {
      // 执行登录
      const result = await authService.login(username, password);

      // 记录审计日志
      if (auditLogger) {
        await auditLogger.logAuthEvent({
          type: 'login',
          username,
          success: result.success,
          timestamp: new Date(),
          ipAddress,
          userAgent,
          metadata: {
            accountLocked: result.accountLocked
          }
        });
      }

      if (result.success) {
        return res.status(200).json({
          success: true,
          sessionToken: result.sessionToken
        });
      }

      // 处理账户锁定
      if (result.accountLocked) {
        throw new AccountLockedError(result.error);
      }

      // 处理认证失败
      throw new AuthenticationError(result.error);
    } catch (error) {
      // 记录失败的审计日志
      if (auditLogger) {
        try {
          await auditLogger.logAuthEvent({
            type: 'login',
            username,
            success: false,
            timestamp: new Date(),
            ipAddress,
            userAgent,
            metadata: {
              errorType: error instanceof Error ? error.name : 'Unknown'
            }
          });
        } catch (logError) {
          console.error('审计日志记录失败:', logError);
        }
      }

      throw error;
    }
  }));

  /**
   * POST /auth/logout
   * 用户注销端点
   */
  router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const { sessionToken } = req.body as LogoutRequest;

    // 输入验证
    validateRequiredFields(req.body, [
      { name: 'sessionToken', type: 'string' }
    ]);

    try {
      // 执行注销
      await authService.logout(sessionToken);

      // 记录审计日志
      if (auditLogger) {
        await auditLogger.logAuthEvent({
          type: 'logout',
          success: true,
          timestamp: new Date(),
          ipAddress,
          userAgent
        });
      }

      return res.status(200).json({
        success: true,
        message: '注销成功'
      });
    } catch (error) {
      // 记录失败的审计日志
      if (auditLogger) {
        try {
          await auditLogger.logAuthEvent({
            type: 'logout',
            success: false,
            timestamp: new Date(),
            ipAddress,
            userAgent,
            metadata: {
              errorType: error instanceof Error ? error.name : 'Unknown'
            }
          });
        } catch (logError) {
          console.error('审计日志记录失败:', logError);
        }
      }

      throw error;
    }
  }));

  /**
   * POST /auth/password-reset/request
   * 请求密码重置端点
   */
  router.post('/password-reset/request', asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const { usernameOrEmail } = req.body as PasswordResetRequestBody;

    // 输入验证
    validateRequiredFields(req.body, [
      { name: 'usernameOrEmail', type: 'string' }
    ]);

    try {
      // 执行密码重置请求
      // 注意：为了安全，即使用户不存在也返回成功消息
      await passwordService.initiatePasswordReset(usernameOrEmail);

      // 记录审计日志
      if (auditLogger) {
        await auditLogger.logAuthEvent({
          type: 'password_reset_request',
          username: usernameOrEmail,
          success: true,
          timestamp: new Date(),
          ipAddress,
          userAgent
        });
      }

      return res.status(200).json({
        success: true,
        message: '如果该账户存在，密码重置链接已发送到注册的电子邮件地址'
      });
    } catch (error) {
      // 记录失败的审计日志
      if (auditLogger) {
        try {
          await auditLogger.logAuthEvent({
            type: 'password_reset_request',
            username: usernameOrEmail,
            success: false,
            timestamp: new Date(),
            ipAddress,
            userAgent,
            metadata: {
              errorType: error instanceof Error ? error.name : 'Unknown'
            }
          });
        } catch (logError) {
          console.error('审计日志记录失败:', logError);
        }
      }

      // 即使出错也返回通用消息以防止账户枚举
      return res.status(200).json({
        success: true,
        message: '如果该账户存在，密码重置链接已发送到注册的电子邮件地址'
      });
    }
  }));

  /**
   * POST /auth/password-reset/complete
   * 完成密码重置端点
   */
  router.post('/password-reset/complete', asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const { resetToken, newPassword } = req.body as PasswordResetCompleteBody;

    // 输入验证
    validateRequiredFields(req.body, [
      { name: 'resetToken', type: 'string' },
      { name: 'newPassword', type: 'string' }
    ]);

    // 验证密码强度
    const validation = passwordService.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new PasswordValidationError('密码不符合安全要求', validation.errors);
    }

    try {
      // 执行密码重置
      const result = await passwordService.completePasswordReset(resetToken, newPassword);

      // 记录审计日志
      if (auditLogger) {
        await auditLogger.logAuthEvent({
          type: 'password_reset_complete',
          success: result.success,
          timestamp: new Date(),
          ipAddress,
          userAgent
        });
      }

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: '密码重置成功'
        });
      }

      // 如果重置失败，抛出适当的错误
      throw new InvalidTokenError(result.error || '密码重置失败', 'reset');
    } catch (error) {
      // 记录失败的审计日志
      if (auditLogger) {
        try {
          await auditLogger.logAuthEvent({
            type: 'password_reset_complete',
            success: false,
            timestamp: new Date(),
            ipAddress,
            userAgent,
            metadata: {
              errorType: error instanceof Error ? error.name : 'Unknown'
            }
          });
        } catch (logError) {
          console.error('审计日志记录失败:', logError);
        }
      }

      throw error;
    }
  }));

  /**
   * GET /auth/session/validate
   * 验证会话端点
   */
  router.get('/session/validate', asyncHandler(async (req: Request, res: Response) => {
    const sessionToken = req.query.sessionToken as string || req.headers['authorization']?.replace('Bearer ', '');

    // 输入验证
    if (!sessionToken || typeof sessionToken !== 'string') {
      throw new ValidationError('会话令牌是必需的', 'sessionToken');
    }

    // 验证会话
    const session = await authService.validateSession(sessionToken);

    if (session) {
      return res.status(200).json({
        success: true,
        valid: true,
        session: {
          userId: session.userId,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          lastActivityAt: session.lastActivityAt
        }
      });
    }

    throw new InvalidTokenError('会话无效或已过期', 'session');
  }));

  return router;
}
