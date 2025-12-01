/**
 * 速率限制器接口
 * 防止暴力攻击
 */
export interface RateLimiter {
  /**
   * 检查操作是否被允许
   */
  checkLimit(identifier: string, operation: string): Promise<boolean>;

  /**
   * 记录操作尝试
   */
  recordAttempt(identifier: string, operation: string): Promise<void>;

  /**
   * 重置标识符的限制
   */
  resetLimit(identifier: string, operation: string): Promise<void>;
}
