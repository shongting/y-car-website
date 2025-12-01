import { AuthEvent, AuditLog } from '../models/AuditLog';
import { AuditLogger } from './AuditLogger';
import { AuditLogRepository } from '../repositories/AuditLogRepository';

/**
 * 审计日志记录器实现
 * 记录安全事件并过滤敏感数据
 */
export class AuditLoggerImpl implements AuditLogger {
  constructor(private repository: AuditLogRepository) {}

  /**
   * 记录身份验证事件
   */
  async logAuthEvent(event: AuthEvent): Promise<void> {
    // 过滤敏感数据
    const sanitizedMetadata = this.sanitizeMetadata(event.metadata);

    const logEntry: Omit<AuditLog, 'id'> = {
      eventType: event.type,
      userId: event.userId,
      username: event.username,
      success: event.success,
      timestamp: event.timestamp,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: sanitizedMetadata,
    };

    await this.repository.create(logEntry);
  }

  /**
   * 过滤敏感数据
   * 排除密码、令牌等机密信息
   */
  private sanitizeMetadata(
    metadata?: Record<string, any>
  ): Record<string, any> | undefined {
    if (!metadata) {
      return undefined;
    }

    const sensitiveKeys = [
      'password',
      'passwordHash',
      'token',
      'sessionToken',
      'resetToken',
      'secret',
      'apiKey',
      'accessToken',
      'refreshToken',
      'authorization',
    ];

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // 检查键是否包含敏感词（不区分大小写）
      const isSensitive = sensitiveKeys.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // 递归处理嵌套对象
        sanitized[key] = this.sanitizeMetadata(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
