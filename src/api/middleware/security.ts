import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from '../../services/AuditLogger';

/**
 * 安全中间件配置
 */
export interface SecurityConfig {
  enforceHttps?: boolean;
  csrfProtection?: boolean;
  auditLogger?: AuditLogger;
}

/**
 * 强制 HTTPS 中间件
 * 确保所有敏感端点使用 HTTPS
 */
export function enforceHttps(req: Request, res: Response, next: NextFunction): void {
  // 在生产环境中强制使用 HTTPS
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    res.status(403).json({
      success: false,
      error: '此端点需要 HTTPS 连接'
    });
    return;
  }
  next();
}

/**
 * 安全响应头中间件
 * 添加各种安全相关的 HTTP 响应头
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // 防止 MIME 类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 启用 XSS 过滤器
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 强制使用 HTTPS（HSTS）
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // 内容安全策略
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  // 引用者策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 权限策略
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

/**
 * CSRF 保护中间件
 * 验证请求来源，防止跨站请求伪造攻击
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // 跳过 GET、HEAD、OPTIONS 请求
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 检查 Origin 或 Referer 头
  const origin = req.get('origin');
  const referer = req.get('referer');
  const host = req.get('host');

  // 如果没有 Origin 和 Referer，拒绝请求
  if (!origin && !referer) {
    res.status(403).json({
      success: false,
      error: 'CSRF 验证失败：缺少 Origin 或 Referer 头'
    });
    return;
  }

  // 验证 Origin
  if (origin) {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      res.status(403).json({
        success: false,
        error: 'CSRF 验证失败：Origin 不匹配'
      });
      return;
    }
  }

  // 验证 Referer
  if (referer && !origin) {
    const refererHost = new URL(referer).host;
    if (refererHost !== host) {
      res.status(403).json({
        success: false,
        error: 'CSRF 验证失败：Referer 不匹配'
      });
      return;
    }
  }

  next();
}

/**
 * 请求日志记录中间件
 * 记录所有请求的详细信息，包括 IP 地址和用户代理
 */
export function requestLogger(auditLogger?: AuditLogger) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();

    // 提取客户端 IP 地址
    const ipAddress = 
      req.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.get('x-real-ip') ||
      req.socket.remoteAddress ||
      'unknown';

    // 提取用户代理
    const userAgent = req.get('user-agent') || 'unknown';

    // 记录请求信息
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      ip: ipAddress,
      userAgent: userAgent,
      body: sanitizeRequestBody(req.body)
    });

    // 监听响应完成
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
        ip: ipAddress,
        userAgent: userAgent
      });

      // 如果有审计日志记录器，记录身份验证相关的请求
      if (auditLogger && req.path.startsWith('/auth/')) {
        // 这里可以根据需要记录特定的身份验证事件
        // 实际的身份验证事件应该在各个路由处理器中记录
      }
    });

    next();
  };
}

/**
 * 清理请求体，移除敏感信息
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'newPassword', 'sessionToken', 'resetToken'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * 提取客户端 IP 地址的辅助函数
 */
export function getClientIp(req: Request): string {
  return (
    req.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.get('x-real-ip') ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * 提取用户代理的辅助函数
 */
export function getUserAgent(req: Request): string {
  return req.get('user-agent') || 'unknown';
}
