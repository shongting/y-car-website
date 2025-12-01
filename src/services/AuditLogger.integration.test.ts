import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLoggerImpl } from './AuditLoggerImpl';
import { InMemoryAuditLogRepository } from '../repositories/InMemoryAuditLogRepository';

/**
 * 审计日志集成测试
 * 验证审计日志在完整身份验证流程中的工作
 */
describe('AuditLogger Integration', () => {
  let repository: InMemoryAuditLogRepository;
  let logger: AuditLoggerImpl;

  beforeEach(async () => {
    repository = new InMemoryAuditLogRepository();
    logger = new AuditLoggerImpl(repository);
    await repository.clear();
  });

  it('应该记录完整的登录流程', async () => {
    const userId = 'user-login-flow';
    const username = 'testuser';
    const ipAddress = '192.168.1.100';
    const userAgent = 'Mozilla/5.0';

    // 模拟登录尝试
    await logger.logAuthEvent({
      type: 'login',
      userId,
      username,
      success: true,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      metadata: {
        loginMethod: 'password',
        // 敏感数据应该被过滤
        password: 'userPassword123',
        sessionToken: 'session-abc-123',
      },
    });

    const logs = await repository.findByUserId(userId);
    expect(logs).toHaveLength(1);
    expect(logs[0].eventType).toBe('login');
    expect(logs[0].success).toBe(true);
    expect(logs[0].ipAddress).toBe(ipAddress);
    expect(logs[0].userAgent).toBe(userAgent);
    
    // 验证敏感数据被过滤
    expect(logs[0].metadata?.password).toBe('[REDACTED]');
    expect(logs[0].metadata?.sessionToken).toBe('[REDACTED]');
    expect(logs[0].metadata?.loginMethod).toBe('password');
  });

  it('应该记录失败的登录尝试', async () => {
    const username = 'faileduser';
    const ipAddress = '192.168.1.200';

    // 模拟多次失败的登录尝试
    for (let i = 1; i <= 3; i++) {
      await logger.logAuthEvent({
        type: 'login',
        username,
        success: false,
        timestamp: new Date(),
        ipAddress,
        metadata: {
          attemptNumber: i,
          reason: 'invalid_credentials',
        },
      });
    }

    const allLogs = await repository.findByTimeRange(
      new Date(Date.now() - 60000),
      new Date()
    );

    const failedAttempts = allLogs.filter(
      log => log.username === username && !log.success
    );

    expect(failedAttempts).toHaveLength(3);
    expect(failedAttempts.every(log => log.eventType === 'login')).toBe(true);
  });

  it('应该记录密码重置流程', async () => {
    const userId = 'user-reset';
    const username = 'resetuser';

    // 1. 密码重置请求
    await logger.logAuthEvent({
      type: 'password_reset_request',
      username,
      success: true,
      timestamp: new Date(),
      ipAddress: '192.168.1.50',
      metadata: {
        email: 'user@example.com',
      },
    });

    // 2. 密码重置完成
    await logger.logAuthEvent({
      type: 'password_reset_complete',
      userId,
      username,
      success: true,
      timestamp: new Date(),
      ipAddress: '192.168.1.50',
      metadata: {
        resetToken: 'reset-token-xyz', // 应该被过滤
        newPassword: 'newPassword123', // 应该被过滤
      },
    });

    const allLogs = await repository.findByTimeRange(
      new Date(Date.now() - 60000),
      new Date()
    );

    const resetLogs = allLogs.filter(
      log => log.username === username
    );

    expect(resetLogs).toHaveLength(2);
    expect(resetLogs[0].eventType).toBe('password_reset_request');
    expect(resetLogs[1].eventType).toBe('password_reset_complete');
    
    // 验证敏感数据被过滤
    expect(resetLogs[1].metadata?.resetToken).toBe('[REDACTED]');
    expect(resetLogs[1].metadata?.newPassword).toBe('[REDACTED]');
  });

  it('应该记录会话管理事件', async () => {
    const userId = 'user-session';

    // 会话创建（通过登录）
    await logger.logAuthEvent({
      type: 'login',
      userId,
      success: true,
      timestamp: new Date(),
    });

    // 会话过期
    await logger.logAuthEvent({
      type: 'session_expired',
      userId,
      success: true,
      timestamp: new Date(),
      metadata: {
        reason: 'inactivity_timeout',
        lastActivity: new Date(Date.now() - 3600000),
      },
    });

    // 注销
    await logger.logAuthEvent({
      type: 'logout',
      userId,
      success: true,
      timestamp: new Date(),
    });

    const logs = await repository.findByUserId(userId);
    expect(logs).toHaveLength(3);
    expect(logs.map(log => log.eventType)).toEqual([
      'login',
      'session_expired',
      'logout',
    ]);
  });

  it('应该支持审计日志查询和分析', async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    // 创建多个用户的日志
    const users = ['user1', 'user2', 'user3'];
    
    for (const userId of users) {
      // 成功登录
      await logger.logAuthEvent({
        type: 'login',
        userId,
        success: true,
        timestamp: oneHourAgo,
      });

      // 注销
      await logger.logAuthEvent({
        type: 'logout',
        userId,
        success: true,
        timestamp: now,
      });
    }

    // 查询特定用户的日志
    const user1Logs = await repository.findByUserId('user1');
    expect(user1Logs).toHaveLength(2);

    // 查询时间范围内的所有日志
    const recentLogs = await repository.findByTimeRange(oneHourAgo, now);
    expect(recentLogs.length).toBeGreaterThanOrEqual(6);
  });

  it('应该处理包含多层嵌套敏感数据的复杂元数据', async () => {
    await logger.logAuthEvent({
      type: 'login',
      userId: 'user-complex',
      success: true,
      timestamp: new Date(),
      metadata: {
        request: {
          credentials: {
            username: 'testuser',
            password: 'secret123', // 应该被过滤
          },
          headers: {
            authorization: 'Bearer token123', // 包含 token，应该被过滤
            userAgent: 'Chrome',
          },
        },
        response: {
          sessionToken: 'session-xyz', // 应该被过滤
          expiresIn: 3600,
        },
        normalData: 'this should remain',
      },
    });

    const logs = await repository.findByUserId('user-complex');
    const metadata = logs[0].metadata;

    expect(metadata?.request.credentials.password).toBe('[REDACTED]');
    expect(metadata?.request.headers.authorization).toBe('[REDACTED]');
    expect(metadata?.request.headers.userAgent).toBe('Chrome');
    expect(metadata?.response.sessionToken).toBe('[REDACTED]');
    expect(metadata?.response.expiresIn).toBe(3600);
    expect(metadata?.normalData).toBe('this should remain');
  });
});
