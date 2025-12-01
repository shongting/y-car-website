import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InMemoryRateLimiter } from './InMemoryRateLimiter';

describe('InMemoryRateLimiter', () => {
  let rateLimiter: InMemoryRateLimiter;

  beforeEach(() => {
    // 使用较短的时间窗口以便测试
    rateLimiter = new InMemoryRateLimiter(
      1000, // 1 秒时间窗口
      3,    // 最多 3 次尝试
      2000  // 锁定 2 秒
    );
  });

  describe('checkLimit', () => {
    it('应该允许第一次尝试', async () => {
      const allowed = await rateLimiter.checkLimit('user1', 'login');
      expect(allowed).toBe(true);
    });

    it('应该允许在限制内的尝试', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      const allowed = await rateLimiter.checkLimit('user1', 'login');
      expect(allowed).toBe(true);
    });

    it('应该拒绝超过限制的尝试', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      const allowed = await rateLimiter.checkLimit('user1', 'login');
      expect(allowed).toBe(false);
    });

    it('应该在锁定期内拒绝尝试', async () => {
      // 记录足够多的尝试以触发锁定
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      const allowed = await rateLimiter.checkLimit('user1', 'login');
      expect(allowed).toBe(false);
    });

    it('应该在锁定期过后允许尝试', async () => {
      vi.useFakeTimers();
      
      // 记录足够多的尝试以触发锁定
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 验证被锁定
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(false);
      
      // 前进时间超过锁定期
      vi.advanceTimersByTime(2100);
      
      // 应该允许尝试
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(true);
      
      vi.useRealTimers();
    });

    it('应该为不同的标识符独立跟踪', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // user1 应该被限制
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(false);
      
      // user2 应该不受影响
      expect(await rateLimiter.checkLimit('user2', 'login')).toBe(true);
    });

    it('应该为不同的操作独立跟踪', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // login 操作应该被限制
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(false);
      
      // password_reset 操作应该不受影响
      expect(await rateLimiter.checkLimit('user1', 'password_reset')).toBe(true);
    });
  });

  describe('recordAttempt', () => {
    it('应该记录尝试', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 验证记录已创建
      expect(rateLimiter.getRecordCount()).toBe(1);
    });

    it('应该累积多次尝试', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 应该还有一次尝试机会
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(true);
      
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 现在应该被限制
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(false);
    });

    it('应该在时间窗口过后清理旧的尝试', async () => {
      vi.useFakeTimers();
      
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 前进时间超过时间窗口
      vi.advanceTimersByTime(1100);
      
      // 旧的尝试应该被清理，允许新的尝试
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(true);
      
      vi.useRealTimers();
    });
  });

  describe('resetLimit', () => {
    it('应该清除限制记录', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 验证被限制
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(false);
      
      // 重置限制
      await rateLimiter.resetLimit('user1', 'login');
      
      // 应该允许尝试
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(true);
    });

    it('应该只重置指定的标识符和操作', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user2', 'login');
      
      await rateLimiter.resetLimit('user1', 'login');
      
      // user1 的记录应该被清除
      expect(rateLimiter.getRecordCount()).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('应该清理过期的记录', async () => {
      vi.useFakeTimers();
      
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 前进时间超过时间窗口和锁定期
      vi.advanceTimersByTime(3000);
      
      await rateLimiter.cleanup();
      
      // 记录应该被清理
      expect(rateLimiter.getRecordCount()).toBe(0);
      
      vi.useRealTimers();
    });

    it('应该保留未过期的记录', async () => {
      await rateLimiter.recordAttempt('user1', 'login');
      
      await rateLimiter.cleanup();
      
      // 记录应该保留
      expect(rateLimiter.getRecordCount()).toBe(1);
    });

    it('应该保留仍在锁定期的记录', async () => {
      vi.useFakeTimers();
      
      // 触发锁定
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 前进时间超过时间窗口但未超过锁定期
      vi.advanceTimersByTime(1500);
      
      await rateLimiter.cleanup();
      
      // 记录应该保留（因为仍在锁定期）
      expect(rateLimiter.getRecordCount()).toBe(1);
      
      vi.useRealTimers();
    });
  });

  describe('滑动时间窗口', () => {
    it('应该使用滑动时间窗口而不是固定窗口', async () => {
      vi.useFakeTimers();
      
      // 在时间 0 记录 2 次尝试
      await rateLimiter.recordAttempt('user1', 'login');
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 前进 600ms
      vi.advanceTimersByTime(600);
      
      // 记录第 3 次尝试
      await rateLimiter.recordAttempt('user1', 'login');
      
      // 应该被限制
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(false);
      
      // 前进 500ms（总共 1100ms，前 2 次尝试应该过期）
      vi.advanceTimersByTime(500);
      
      // 现在应该允许（因为前 2 次尝试已经超过 1 秒窗口）
      expect(await rateLimiter.checkLimit('user1', 'login')).toBe(true);
      
      vi.useRealTimers();
    });
  });

  describe('边缘情况', () => {
    it('应该处理空标识符', async () => {
      await rateLimiter.recordAttempt('', 'login');
      expect(await rateLimiter.checkLimit('', 'login')).toBe(true);
    });

    it('应该处理空操作', async () => {
      await rateLimiter.recordAttempt('user1', '');
      expect(await rateLimiter.checkLimit('user1', '')).toBe(true);
    });

    it('应该处理特殊字符', async () => {
      const identifier = 'user@example.com';
      await rateLimiter.recordAttempt(identifier, 'login');
      expect(await rateLimiter.checkLimit(identifier, 'login')).toBe(true);
    });
  });
});
