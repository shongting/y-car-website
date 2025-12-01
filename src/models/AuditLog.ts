/**
 * 审计日志数据模型
 */
export interface AuditLog {
  id: string;
  eventType: string;
  userId?: string;
  username?: string;
  success: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * 身份验证事件
 */
export interface AuthEvent {
  type: 'login' | 'logout' | 'password_reset_request' | 'password_reset_complete' | 'session_expired';
  userId?: string;
  username?: string;
  success: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
