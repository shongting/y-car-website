import express, { Express, Request, Response, NextFunction } from 'express';
import { createAuthRouter } from './routes/auth';
import { AuthenticationService } from '../services/AuthenticationService';
import { PasswordService } from '../services/PasswordService';
import { AuditLogger } from '../services/AuditLogger';
import { 
  enforceHttps, 
  securityHeaders, 
  csrfProtection, 
  requestLogger 
} from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

/**
 * 应用程序依赖项
 */
export interface AppDependencies {
  authService: AuthenticationService;
  passwordService: PasswordService;
  auditLogger?: AuditLogger;
}

/**
 * 创建并配置 Express 应用
 */
export function createApp(dependencies: AppDependencies): Express {
  const app = express();

  // 基础中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 安全中间件
  // 1. 请求日志记录（包含 IP 和用户代理）
  app.use(requestLogger(dependencies.auditLogger));

  // 2. 安全响应头
  app.use(securityHeaders);

  // 3. HTTPS 强制执行（仅在生产环境）
  app.use(enforceHttps);

  // 4. CSRF 保护
  app.use(csrfProtection);

  // 健康检查端点
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // 身份验证路由
  app.use('/auth', createAuthRouter(
    dependencies.authService, 
    dependencies.passwordService,
    dependencies.auditLogger
  ));

  // 404 处理
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: '未找到端点',
      code: 'NOT_FOUND'
    });
  });

  // 全局错误处理中间件（必须在所有路由之后）
  app.use(errorHandler);

  return app;
}
