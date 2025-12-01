import { RateLimiter } from './RateLimiter';

/**
 * 速率限制记录
 */
interface RateLimitRecord {
  attempts: number[];
  lockedUntil?: Date;
}

/**
 * 内存速率限制器实现
 * 使用滑动时间窗口算法跟踪尝试次数
 */
export class InMemoryRateLimiter implements RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  private readonly lockoutDurationMs: number;

  /**
   * 创建速率限制器实例
   * 
   * @param windowMs 时间窗口（毫秒）
   * @param maxAttempts 时间窗口内允许的最大尝试次数
   * @param lockoutDurationMs 超过限制后的锁定时间（毫秒）
   */
  constructor(
    windowMs: number = 15 * 60 * 1000, // 默认 15 分钟
    maxAttempts: number = 5, // 默认 5 次尝试
    lockoutDurationMs: number = 15 * 60 * 1000 // 默认锁定 15 分钟
  ) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
    this.lockoutDurationMs = lockoutDurationMs;
  }

  /**
   * 生成记录键
   */
  private getKey(identifier: string, operation: string): string {
    return `${identifier}:${operation}`;
  }

  /**
   * 清理过期的尝试记录
   */
  private cleanupAttempts(record: RateLimitRecord): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    record.attempts = record.attempts.filter(timestamp => timestamp > cutoff);
  }

  /**
   * 检查操作是否被允许
   * 
   * @param identifier 标识符（如用户名、IP 地址）
   * @param operation 操作类型（如 'login'）
   * @returns 如果允许操作返回 true，否则返回 false
   */
  async checkLimit(identifier: string, operation: string): Promise<boolean> {
    const key = this.getKey(identifier, operation);
    const record = this.records.get(key);

    if (!record) {
      // 没有记录，允许操作
      return true;
    }

    // 清理过期的尝试记录（这会移除滑动窗口之外的尝试）
    this.cleanupAttempts(record);

    // 检查是否在锁定期内（只有在仍然超过限制时才检查锁定）
    if (record.attempts.length >= this.maxAttempts) {
      if (record.lockedUntil && record.lockedUntil > new Date()) {
        return false;
      }
    }

    // 检查尝试次数是否超过限制
    return record.attempts.length < this.maxAttempts;
  }

  /**
   * 记录操作尝试
   * 
   * @param identifier 标识符（如用户名、IP 地址）
   * @param operation 操作类型（如 'login'）
   */
  async recordAttempt(identifier: string, operation: string): Promise<void> {
    const key = this.getKey(identifier, operation);
    const now = Date.now();
    
    let record = this.records.get(key);
    
    if (!record) {
      record = { attempts: [] };
      this.records.set(key, record);
    }

    // 清理过期的尝试记录
    this.cleanupAttempts(record);

    // 添加新的尝试
    record.attempts.push(now);

    // 如果超过限制，设置锁定时间
    if (record.attempts.length >= this.maxAttempts) {
      record.lockedUntil = new Date(now + this.lockoutDurationMs);
    }
  }

  /**
   * 重置标识符的限制
   * 
   * @param identifier 标识符（如用户名、IP 地址）
   * @param operation 操作类型（如 'login'）
   */
  async resetLimit(identifier: string, operation: string): Promise<void> {
    const key = this.getKey(identifier, operation);
    this.records.delete(key);
  }

  /**
   * 清理所有过期的记录（用于维护）
   */
  async cleanup(): Promise<void> {
    const now = new Date();
    
    for (const [key, record] of this.records.entries()) {
      // 清理过期的尝试
      this.cleanupAttempts(record);
      
      // 如果锁定已过期且没有尝试记录，删除整个记录
      if (
        record.attempts.length === 0 &&
        (!record.lockedUntil || record.lockedUntil <= now)
      ) {
        this.records.delete(key);
      }
    }
  }

  /**
   * 获取当前记录数（用于测试和监控）
   */
  getRecordCount(): number {
    return this.records.size;
  }

  /**
   * 清除所有记录（用于测试）
   */
  clear(): void {
    this.records.clear();
  }
}
