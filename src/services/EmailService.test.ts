import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailServiceImpl, EmailConfig } from './EmailService';

describe('EmailService', () => {
  let emailService: EmailServiceImpl;
  let config: EmailConfig;
  let consoleLogSpy: any;

  beforeEach(() => {
    config = {
      from: 'noreply@example.com',
      baseUrl: 'https://example.com',
    };
    emailService = new EmailServiceImpl(config);
    
    // 监听 console.log 以验证开发模式下的输出
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('sendPasswordResetEmail', () => {
    it('应该在开发模式下记录电子邮件内容', async () => {
      const email = 'user@example.com';
      const resetToken = 'test-token-123';
      const username = 'testuser';

      await emailService.sendPasswordResetEmail(email, resetToken, username);

      // 验证 console.log 被调用
      expect(consoleLogSpy).toHaveBeenCalled();
      
      // 验证输出包含关键信息
      const logOutput = consoleLogSpy.mock.calls.map((call: any) => call.join(' ')).join('\n');
      expect(logOutput).toContain(email);
      expect(logOutput).toContain('密码重置电子邮件');
    });

    it('应该生成包含重置链接的电子邮件', async () => {
      const email = 'user@example.com';
      const resetToken = 'test-token-123';
      const username = 'testuser';

      await emailService.sendPasswordResetEmail(email, resetToken, username);

      const logOutput = consoleLogSpy.mock.calls.map((call: any) => call.join(' ')).join('\n');
      const expectedLink = `${config.baseUrl}/reset-password?token=${resetToken}`;
      expect(logOutput).toContain(expectedLink);
    });

    it('应该在电子邮件中包含用户名', async () => {
      const email = 'user@example.com';
      const resetToken = 'test-token-123';
      const username = 'testuser';

      await emailService.sendPasswordResetEmail(email, resetToken, username);

      const logOutput = consoleLogSpy.mock.calls.map((call: any) => call.join(' ')).join('\n');
      expect(logOutput).toContain(username);
    });

    it('应该拒绝无效的电子邮件地址', async () => {
      const invalidEmails = [
        '',
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@.com',
      ];

      for (const email of invalidEmails) {
        await expect(
          emailService.sendPasswordResetEmail(email, 'token', 'user')
        ).rejects.toThrow('无效的电子邮件地址');
      }
    });

    it('应该接受有效的电子邮件地址', async () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
      ];

      for (const email of validEmails) {
        await expect(
          emailService.sendPasswordResetEmail(email, 'token', 'user')
        ).resolves.not.toThrow();
      }
    });

    it('应该拒绝空的重置令牌', async () => {
      await expect(
        emailService.sendPasswordResetEmail('user@example.com', '', 'user')
      ).rejects.toThrow('重置令牌不能为空');
    });

    it('应该生成包含安全警告的电子邮件', async () => {
      const email = 'user@example.com';
      const resetToken = 'test-token-123';
      const username = 'testuser';

      await emailService.sendPasswordResetEmail(email, resetToken, username);

      const logOutput = consoleLogSpy.mock.calls.map((call: any) => call.join(' ')).join('\n');
      
      // 验证包含安全相关信息
      expect(logOutput).toContain('1 小时');
      expect(logOutput).toContain('过期');
    });

    it('应该为不同的令牌生成不同的链接', async () => {
      const email = 'user@example.com';
      const username = 'testuser';
      
      consoleLogSpy.mockClear();
      await emailService.sendPasswordResetEmail(email, 'token1', username);
      const output1 = consoleLogSpy.mock.calls.map((call: any) => call.join(' ')).join('\n');
      
      consoleLogSpy.mockClear();
      await emailService.sendPasswordResetEmail(email, 'token2', username);
      const output2 = consoleLogSpy.mock.calls.map((call: any) => call.join(' ')).join('\n');
      
      expect(output1).toContain('token1');
      expect(output2).toContain('token2');
      expect(output1).not.toContain('token2');
      expect(output2).not.toContain('token1');
    });
  });

  describe('配置', () => {
    it('应该使用提供的基础 URL', async () => {
      const customConfig: EmailConfig = {
        from: 'noreply@test.com',
        baseUrl: 'https://custom-domain.com',
      };
      const customService = new EmailServiceImpl(customConfig);

      await customService.sendPasswordResetEmail(
        'user@example.com',
        'token123',
        'user'
      );

      const logOutput = consoleLogSpy.mock.calls.map((call: any) => call.join(' ')).join('\n');
      expect(logOutput).toContain('https://custom-domain.com/reset-password?token=token123');
    });
  });
});
