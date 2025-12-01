import { AuditLog } from '../models/AuditLog';
import { AuditLogRepository } from './AuditLogRepository';
import { randomUUID } from 'crypto';

/**
 * 审计日志存储库的内存实现
 * 用于开发和测试
 */
export class InMemoryAuditLogRepository implements AuditLogRepository {
  private logs: Map<string, AuditLog> = new Map();

  /**
   * 创建新审计日志条目
   */
  async create(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
    const id = randomUUID();
    const auditLog: AuditLog = {
      id,
      ...log,
    };
    this.logs.set(id, auditLog);
    return auditLog;
  }

  /**
   * 通过 ID 查找审计日志
   */
  async findById(id: string): Promise<AuditLog | null> {
    return this.logs.get(id) || null;
  }

  /**
   * 查找用户的所有审计日志
   */
  async findByUserId(userId: string): Promise<AuditLog[]> {
    return Array.from(this.logs.values()).filter(
      (log) => log.userId === userId
    );
  }

  /**
   * 查找特定时间范围内的审计日志
   */
  async findByTimeRange(startTime: Date, endTime: Date): Promise<AuditLog[]> {
    return Array.from(this.logs.values()).filter(
      (log) =>
        log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * 清除所有日志（用于测试）
   */
  async clear(): Promise<void> {
    this.logs.clear();
  }
}
