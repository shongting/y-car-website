import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLoggerImpl } from './AuditLoggerImpl';
import { InMemoryAuditLogRepository } from '../repositories/InMemoryAuditLogRepository';
import { AuthEvent } from '../models/AuditLog';

describe('AuditLoggerImpl', () => {
  let repository: InMemoryAuditLogRepository;
  let logger: AuditLoggerImpl;

  beforeEach(() => {
    repository = new InMemoryAuditLogRepository();
    logger = new AuditLoggerImpl(repository);
  });

  describe('logAuthEvent', () => {
    it('应该记录身份验证事件', async () => {
      const event: AuthEvent = {
        type: 'login',
        userId: 'user-123',
        username: 'testuser',
        success: true,
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      await logger.logAuthEvent(event);

      const logs = await repository.findByUserId('user-123');
      expect(logs).toHaveLength(1);
      expect(logs[0].eventType).toBe('login');
      expect(logs[0].success).toBe(true);
    });

    it('应该过滤元数据中的密码', async () => {
      const event: AuthEvent = {
        type: 'login',
        userId: 'user-123',
        username: 'testuser',
        success: false,
        timestamp: new Date(),
        metadata: {
          password: 'secret123',
          attemptCount: 3,
        },
      };

      await logger.logAuthEvent(event);

      const logs = await repository.findByUserId('user-123');
      expect(logs[0].metadata?.password).toBe('[REDACTED]');
      expect(logs[0].metadata?.attemptCount).toBe(3);
    });

    it('应该过滤元数据中的令牌', async () => {
      const event: AuthEvent = {
        type: 'logout',
        userId: 'user-456',
        success: true,
        timestamp: new Date(),
        metadata: {
          sessionToken: 'abc123xyz',
          resetToken: 'reset-token-123',
          accessToken: 'access-token-456',
          deviceInfo: 'iPhone',
        },
      };

      await logger.logAuthEvent(event);

      const logs = await repository.findByUserId('user-456');
      expect(logs[0].metadata?.sessionToken).toBe('[REDACTED]');
      expect(logs[0].metadata?.resetToken).toBe('[REDACTED]');
      expect(logs[0].metadata?.accessToken).toBe('[REDACTED]');
      expect(logs[0].metadata?.deviceInfo).toBe('iPhone');
    });

    it('应该过滤嵌套对象中的敏感数据', async () => {
      const event: AuthEvent = {
        type: 'password_reset_complete',
        userId: 'user-789',
        success: true,
        timestamp: new Date(),
        metadata: {
          request: {
            token: 'reset-token-abc',
            newPassword: 'newSecret123',
          },
          response: {
            success: true,
          },
        },
      };

      await logger.logAuthEvent(event);

      const logs = await repository.findByUserId('user-789');
      expect(logs[0].metadata?.request.token).toBe('[REDACTED]');
      expect(logs[0].metadata?.request.newPassword).toBe('[REDACTED]');
      expect(logs[0].metadata?.response.success).toBe(true);
    });

    it('应该处理不区分大小写的敏感键', async () => {
      const event: AuthEvent = {
        type: 'login',
        userId: 'user-999',
        success: true,
        timestamp: new Date(),
        metadata: {
          Password: 'secret',
          SESSION_TOKEN: 'token123',
          ApiKey: 'key456',
          normalField: 'value',
        },
      };

      await logger.logAuthEvent(event);

      const logs = await repository.findByUserId('user-999');
      expect(logs[0].metadata?.Password).toBe('[REDACTED]');
      expect(logs[0].metadata?.SESSION_TOKEN).toBe('[REDACTED]');
      expect(logs[0].metadata?.ApiKey).toBe('[REDACTED]');
      expect(logs[0].metadata?.normalField).toBe('value');
    });

    it('应该记录所有事件类型', async () => {
      const eventTypes: AuthEvent['type'][] = [
        'login',
        'logout',
        'password_reset_request',
        'password_reset_complete',
        'session_expired',
      ];

      for (const type of eventTypes) {
        await logger.logAuthEvent({
          type,
          userId: 'user-multi',
          success: true,
          timestamp: new Date(),
        });
      }

      const logs = await repository.findByUserId('user-multi');
      expect(logs).toHaveLength(5);
      expect(logs.map(log => log.eventType)).toEqual(eventTypes);
    });

    it('应该保留上下文信息（IP 地址和用户代理）', async () => {
      const event: AuthEvent = {
        type: 'login',
        userId: 'user-context',
        username: 'contextuser',
        success: true,
        timestamp: new Date(),
        ipAddress: '10.0.0.1',
        userAgent: 'Chrome/91.0',
      };

      await logger.logAuthEvent(event);

      const logs = await repository.findByUserId('user-context');
      expect(logs[0].ipAddress).toBe('10.0.0.1');
      expect(logs[0].userAgent).toBe('Chrome/91.0');
    });
  });
});
