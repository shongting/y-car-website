import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAuditLogRepository } from './InMemoryAuditLogRepository';
import { AuditLog } from '../models/AuditLog';

describe('InMemoryAuditLogRepository', () => {
  let repository: InMemoryAuditLogRepository;

  beforeEach(() => {
    repository = new InMemoryAuditLogRepository();
  });

  describe('create', () => {
    it('应该创建审计日志并生成 ID', async () => {
      const logData: Omit<AuditLog, 'id'> = {
        eventType: 'login',
        userId: 'user-123',
        username: 'testuser',
        success: true,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const log = await repository.create(logData);

      expect(log.id).toBeDefined();
      expect(log.eventType).toBe('login');
      expect(log.userId).toBe('user-123');
      expect(log.username).toBe('testuser');
      expect(log.success).toBe(true);
    });
  });

  describe('findById', () => {
    it('应该通过 ID 查找审计日志', async () => {
      const logData: Omit<AuditLog, 'id'> = {
        eventType: 'logout',
        userId: 'user-456',
        success: true,
        timestamp: new Date(),
      };

      const created = await repository.create(logData);
      const found = await repository.findById(created.id);

      expect(found).toEqual(created);
    });

    it('应该在日志不存在时返回 null', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('应该查找用户的所有审计日志', async () => {
      const userId = 'user-789';

      await repository.create({
        eventType: 'login',
        userId,
        success: true,
        timestamp: new Date(),
      });

      await repository.create({
        eventType: 'logout',
        userId,
        success: true,
        timestamp: new Date(),
      });

      await repository.create({
        eventType: 'login',
        userId: 'other-user',
        success: true,
        timestamp: new Date(),
      });

      const logs = await repository.findByUserId(userId);

      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.userId === userId)).toBe(true);
    });
  });

  describe('findByTimeRange', () => {
    it('应该查找时间范围内的审计日志', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const twoHoursAgo = new Date(now.getTime() - 7200000);

      await repository.create({
        eventType: 'login',
        userId: 'user-1',
        success: true,
        timestamp: twoHoursAgo,
      });

      await repository.create({
        eventType: 'login',
        userId: 'user-2',
        success: true,
        timestamp: oneHourAgo,
      });

      await repository.create({
        eventType: 'login',
        userId: 'user-3',
        success: true,
        timestamp: now,
      });

      const logs = await repository.findByTimeRange(oneHourAgo, now);

      expect(logs).toHaveLength(2);
    });
  });
});
