import { describe, it, expect } from 'vitest';
import { PasswordService } from './PasswordService';
import { PasswordValidationError } from '../errors/AuthErrors';
import * as fc from 'fast-check';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  describe('hashPassword', () => {
    it('应该成功哈希有效密码', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('应该为相同密码生成不同的哈希值', async () => {
      const password = 'TestPassword123!';
      const hash1 = await passwordService.hashPassword(password);
      const hash2 = await passwordService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('应该拒绝空密码', async () => {
      await expect(passwordService.hashPassword('')).rejects.toThrow(PasswordValidationError);
    });
  });

  describe('validatePasswordStrength', () => {
    it('应该接受符合所有要求的强密码', () => {
      const result = passwordService.validatePasswordStrength('StrongPass123!');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝过短的密码', () => {
      const result = passwordService.validatePasswordStrength('Abc1!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密码长度至少为 8 个字符');
    });

    it('应该拒绝没有字母的密码', () => {
      const result = passwordService.validatePasswordStrength('12345678!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个字母');
    });

    it('应该拒绝没有数字的密码', () => {
      const result = passwordService.validatePasswordStrength('Password!');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个数字');
    });

    it('应该拒绝没有特殊字符的密码', () => {
      const result = passwordService.validatePasswordStrength('Password123');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密码必须包含至少一个特殊字符');
    });

    it('应该拒绝空密码', () => {
      const result = passwordService.validatePasswordStrength('');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('密码不能为空');
    });
  });

  describe('verifyPassword', () => {
    it('应该验证正确的密码', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      const isValid = await passwordService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      const isValid = await passwordService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('应该拒绝空密码', async () => {
      const hash = await passwordService.hashPassword('TestPassword123!');
      
      const isValid = await passwordService.verifyPassword('', hash);
      expect(isValid).toBe(false);
    });

    it('应该拒绝空哈希', async () => {
      const isValid = await passwordService.verifyPassword('TestPassword123!', '');
      expect(isValid).toBe(false);
    });
  });

  /**
   * 基于属性的测试
   * Feature: user-authentication, Property 12: 密码强度验证
   * 验证：需求 6.1, 6.2
   * 
   * 对于任何密码设置或更改操作，系统应该验证密码满足最小长度要求
   * 并包含字母、数字和特殊字符的组合，不符合要求的密码应该被拒绝。
   */
  describe('Property-Based Tests', () => {
    describe('Property 12: 密码强度验证', () => {
      // 生成有效的强密码
      const validPasswordArbitrary = fc.tuple(
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1 }),
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 1 }),
        fc.stringOf(fc.constantFrom(...'!@#$%^&*()_+-=[]{};\':"|,.<>/?'.split('')), { minLength: 1 }),
        fc.string({ minLength: 0, maxLength: 20 })
      ).map(([letters, digits, special, extra]) => {
        // 组合所有部分并打乱顺序
        const combined = (letters + digits + special + extra).split('');
        for (let i = combined.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [combined[i], combined[j]] = [combined[j], combined[i]];
        }
        return combined.join('');
      }).filter(pwd => pwd.length >= 8);

      it('应该接受所有符合要求的密码（至少8个字符，包含字母、数字和特殊字符）', () => {
        fc.assert(
          fc.property(validPasswordArbitrary, (password) => {
            const result = passwordService.validatePasswordStrength(password);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          }),
          { numRuns: 100 }
        );
      });

      // 生成过短的密码（少于8个字符）
      const tooShortPasswordArbitrary = fc.string({ minLength: 0, maxLength: 7 });

      it('应该拒绝所有少于8个字符的密码', () => {
        fc.assert(
          fc.property(tooShortPasswordArbitrary, (password) => {
            const result = passwordService.validatePasswordStrength(password);
            if (password.length < 8 && password.length > 0) {
              expect(result.valid).toBe(false);
              expect(result.errors.some(e => e.includes('长度至少为'))).toBe(true);
            }
          }),
          { numRuns: 100 }
        );
      });

      // 生成没有字母的密码
      const noLettersPasswordArbitrary = fc.tuple(
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 4 }),
        fc.stringOf(fc.constantFrom(...'!@#$%^&*()_+-=[]{};\':"|,.<>/?'.split('')), { minLength: 4 })
      ).map(([digits, special]) => digits + special);

      it('应该拒绝所有不包含字母的密码', () => {
        fc.assert(
          fc.property(noLettersPasswordArbitrary, (password) => {
            const result = passwordService.validatePasswordStrength(password);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('字母'))).toBe(true);
          }),
          { numRuns: 100 }
        );
      });

      // 生成没有数字的密码
      const noDigitsPasswordArbitrary = fc.tuple(
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 4 }),
        fc.stringOf(fc.constantFrom(...'!@#$%^&*()_+-=[]{};\':"|,.<>/?'.split('')), { minLength: 4 })
      ).map(([letters, special]) => letters + special);

      it('应该拒绝所有不包含数字的密码', () => {
        fc.assert(
          fc.property(noDigitsPasswordArbitrary, (password) => {
            const result = passwordService.validatePasswordStrength(password);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('数字'))).toBe(true);
          }),
          { numRuns: 100 }
        );
      });

      // 生成没有特殊字符的密码
      const noSpecialPasswordArbitrary = fc.tuple(
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 4 }),
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 4 })
      ).map(([letters, digits]) => letters + digits);

      it('应该拒绝所有不包含特殊字符的密码', () => {
        fc.assert(
          fc.property(noSpecialPasswordArbitrary, (password) => {
            const result = passwordService.validatePasswordStrength(password);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('特殊字符'))).toBe(true);
          }),
          { numRuns: 100 }
        );
      });
    });
  });
});
