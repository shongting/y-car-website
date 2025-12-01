import { AuthEvent } from '../models/AuditLog';

/**
 * 审计日志记录器接口
 * 记录安全事件
 */
export interface AuditLogger {
  /**
   * 记录身份验证事件
   */
  logAuthEvent(event: AuthEvent): Promise<void>;
}
