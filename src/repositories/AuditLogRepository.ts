import { AuditLog } from '../models/AuditLog';

/**
 * 审计日志存储库接口
 * 管理审计日志数据持久化
 */
export interface AuditLogRepository {
  /**
   * 创建新审计日志条目
   */
  create(log: Omit<AuditLog, 'id'>): Promise<AuditLog>;

  /**
   * 通过 ID 查找审计日志
   */
  findById(id: string): Promise<AuditLog | null>;

  /**
   * 查找用户的所有审计日志
   */
  findByUserId(userId: string): Promise<AuditLog[]>;

  /**
   * 查找特定时间范围内的审计日志
   */
  findByTimeRange(startTime: Date, endTime: Date): Promise<AuditLog[]>;
}
