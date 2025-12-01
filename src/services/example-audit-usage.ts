/**
 * 审计日志使用示例
 * 
 * 此文件展示如何在应用程序中使用审计日志记录器
 */

import { AuditLoggerImpl } from './AuditLoggerImpl';
import { InMemoryAuditLogRepository } from '../repositories/InMemoryAuditLogRepository';

/**
 * 创建审计日志器实例
 */
export function createAuditLogger(): AuditLoggerImpl {
  const repository = new InMemoryAuditLogRepository();
  return new AuditLoggerImpl(repository);
}

/**
 * 使用示例
 */
async function example() {
  const auditLogger = createAuditLogger();

  // 记录登录成功事件
  await auditLogger.logAuthEvent({
    type: 'login',
    userId: 'user-123',
    username: 'john.doe',
    success: true,
    timestamp: new Date(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    metadata: {
      loginMethod: 'password',
      // 敏感数据会被自动过滤
      password: 'secret123', // 将被替换为 [REDACTED]
      sessionToken: 'abc123', // 将被替换为 [REDACTED]
    }
  });

  // 记录密码重置请求
  await auditLogger.logAuthEvent({
    type: 'password_reset_request',
    username: 'john.doe',
    success: true,
    timestamp: new Date(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  });

  // 记录会话过期事件
  await auditLogger.logAuthEvent({
    type: 'session_expired',
    userId: 'user-123',
    success: true,
    timestamp: new Date(),
    metadata: {
      reason: 'inactivity_timeout',
      lastActivity: new Date(Date.now() - 3600000), // 1小时前
    }
  });
}
