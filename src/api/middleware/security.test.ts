import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  enforceHttps,
  securityHeaders,
  csrfProtection,
  getClientIp,
  getUserAgent
} from './security';

describe('安全中间件', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      secure: false,
      get: vi.fn(),
      method: 'POST',
      socket: { remoteAddress: '127.0.0.1' } as any
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn()
    };

    mockNext = vi.fn();
  });

  describe('enforceHttps', () => {
    it('应该在开发环境中允许 HTTP 请求', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('应该在生产环境中拒绝 HTTP 请求', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      mockReq.secure = false;
      vi.mocked(mockReq.get as any).mockReturnValue(undefined);

      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: '此端点需要 HTTPS 连接'
      });
      expect(mockNext).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('应该在生产环境中允许 HTTPS 请求', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      mockReq.secure = true;

      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('securityHeaders', () => {
    it('应该设置所有安全响应头', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Security-Policy', "default-src 'self'");
      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('csrfProtection', () => {
    it('应该允许 GET 请求', () => {
      mockReq.method = 'GET';

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该拒绝没有 Origin 或 Referer 的 POST 请求', () => {
      mockReq.method = 'POST';
      vi.mocked(mockReq.get as any).mockReturnValue(undefined);

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'CSRF 验证失败：缺少 Origin 或 Referer 头'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该允许具有匹配 Origin 的 POST 请求', () => {
      mockReq.method = 'POST';
      const getMock = vi.mocked(mockReq.get as any);
      getMock.mockImplementation((header: string) => {
        if (header === 'origin') return 'https://example.com';
        if (header === 'host') return 'example.com';
        return undefined;
      });

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('应该拒绝具有不匹配 Origin 的 POST 请求', () => {
      mockReq.method = 'POST';
      const getMock = vi.mocked(mockReq.get as any);
      getMock.mockImplementation((header: string) => {
        if (header === 'origin') return 'https://evil.com';
        if (header === 'host') return 'example.com';
        return undefined;
      });

      csrfProtection(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'CSRF 验证失败：Origin 不匹配'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('getClientIp', () => {
    it('应该从 x-forwarded-for 头提取 IP', () => {
      const getMock = vi.mocked(mockReq.get as any);
      getMock.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
        return undefined;
      });

      const ip = getClientIp(mockReq as Request);

      expect(ip).toBe('192.168.1.1');
    });

    it('应该从 socket.remoteAddress 提取 IP', () => {
      vi.mocked(mockReq.get as any).mockReturnValue(undefined);
      mockReq.socket = { remoteAddress: '127.0.0.1' } as any;

      const ip = getClientIp(mockReq as Request);

      expect(ip).toBe('127.0.0.1');
    });

    it('应该在无法确定 IP 时返回 unknown', () => {
      vi.mocked(mockReq.get as any).mockReturnValue(undefined);
      mockReq.socket = {} as any;

      const ip = getClientIp(mockReq as Request);

      expect(ip).toBe('unknown');
    });
  });

  describe('getUserAgent', () => {
    it('应该提取用户代理字符串', () => {
      const getMock = vi.mocked(mockReq.get as any);
      getMock.mockImplementation((header: string) => {
        if (header === 'user-agent') return 'Mozilla/5.0';
        return undefined;
      });

      const userAgent = getUserAgent(mockReq as Request);

      expect(userAgent).toBe('Mozilla/5.0');
    });

    it('应该在没有用户代理时返回 unknown', () => {
      vi.mocked(mockReq.get as any).mockReturnValue(undefined);

      const userAgent = getUserAgent(mockReq as Request);

      expect(userAgent).toBe('unknown');
    });
  });
});
