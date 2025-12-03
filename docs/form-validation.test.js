/**
 * 表单验证属性测试
 * Feature: y-car-website, Property 4: 表单验证规则
 * 验证需求: 3.2, 3.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// 定义 FormValidator 类（从 script.js 复制）
class FormValidator {
    validateName(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        
        const trimmedName = name.trim();
        
        if (trimmedName.length === 0) {
            return false;
        }
        
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return false;
        }
        
        return true;
    }
    
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return false;
        }
        
        const phoneRegex = /^1[3-9]\d{9}$/;
        const cleanPhone = phone.trim();
        
        return phoneRegex.test(cleanPhone);
    }
    
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cleanEmail = email.trim();
        
        return emailRegex.test(cleanEmail);
    }
    
    validateForm(formData) {
        const errors = {};
        let isValid = true;
        
        if (!this.validateName(formData.name)) {
            errors.name = '请输入有效的姓名（2-50个字符）';
            isValid = false;
        }
        
        if (!this.validatePhone(formData.phone)) {
            errors.phone = '请输入有效的11位手机号码';
            isValid = false;
        }
        
        if (!this.validateEmail(formData.email)) {
            errors.email = '请输入有效的邮箱地址';
            isValid = false;
        }
        
        return {
            isValid,
            errors
        };
    }
}

describe('表单验证规则属性测试', () => {
    let formValidator;

    beforeEach(() => {
        formValidator = new FormValidator();
    });

    /**
     * 属性 4: 表单验证规则
     * 对于任意表单输入，当姓名为空或纯空格、电话不符合11位手机号格式、
     * 或邮箱不符合标准格式时，验证应当返回false并阻止提交
     * 验证需求: 3.2, 3.3
     */
    
    describe('姓名验证属性', () => {
        it('属性测试：空字符串或纯空格的姓名应被拒绝', () => {
            // 生成空字符串或纯空格字符串
            const emptyOrWhitespaceArbitrary = fc.oneof(
                fc.constant(''),
                fc.string().filter(s => s.trim().length === 0 && s.length > 0)
            );

            fc.assert(
                fc.property(emptyOrWhitespaceArbitrary, (name) => {
                    const result = formValidator.validateName(name);
                    expect(result).toBe(false);
                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it('属性测试：长度小于2或大于50的姓名应被拒绝', () => {
            // 生成长度不符合要求的字符串
            const invalidLengthArbitrary = fc.oneof(
                // 长度为1的非空字符串
                fc.string({ minLength: 1, maxLength: 1 }).filter(s => s.trim().length === 1),
                // 长度大于50的字符串
                fc.string({ minLength: 51, maxLength: 100 }).filter(s => s.trim().length > 50)
            );

            fc.assert(
                fc.property(invalidLengthArbitrary, (name) => {
                    const result = formValidator.validateName(name);
                    expect(result).toBe(false);
                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it('属性测试：长度在2-50之间的非空姓名应被接受', () => {
            // 生成有效的姓名字符串
            const validNameArbitrary = fc.string({ minLength: 2, maxLength: 50 })
                .filter(s => s.trim().length >= 2 && s.trim().length <= 50);

            fc.assert(
                fc.property(validNameArbitrary, (name) => {
                    const result = formValidator.validateName(name);
                    expect(result).toBe(true);
                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });

    describe('电话验证属性', () => {
        it('属性测试：不符合11位手机号格式的电话应被拒绝', () => {
            // 生成无效的电话号码
            const invalidPhoneArbitrary = fc.oneof(
                // 长度不是11位
                fc.string().filter(s => s.length !== 11),
                // 不以1开头
                fc.string({ minLength: 11, maxLength: 11 }).filter(s => !s.startsWith('1')),
                // 第二位不是3-9
                fc.string({ minLength: 11, maxLength: 11 }).filter(s => {
                    if (s.length !== 11 || !s.startsWith('1')) return false;
                    const secondDigit = s[1];
                    return secondDigit < '3' || secondDigit > '9';
                }),
                // 包含非数字字符
                fc.string({ minLength: 11, maxLength: 11 }).filter(s => !/^\d+$/.test(s))
            );

            fc.assert(
                fc.property(invalidPhoneArbitrary, (phone) => {
                    const result = formValidator.validatePhone(phone);
                    expect(result).toBe(false);
                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it('属性测试：符合1[3-9]\\d{9}格式的电话应被接受', () => {
            // 生成有效的手机号码
            const validPhoneArbitrary = fc.tuple(
                fc.constant('1'),
                fc.integer({ min: 3, max: 9 }).map(n => n.toString()),
                fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
                    .map(arr => arr.join(''))
            ).map(([first, second, rest]) => first + second + rest);

            fc.assert(
                fc.property(validPhoneArbitrary, (phone) => {
                    const result = formValidator.validatePhone(phone);
                    expect(result).toBe(true);
                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });

    describe('邮箱验证属性', () => {
        it('属性测试：不符合标准邮箱格式的邮箱应被拒绝', () => {
            // 生成无效的邮箱地址
            const invalidEmailArbitrary = fc.oneof(
                // 没有@符号
                fc.string().filter(s => !s.includes('@')),
                // 没有域名部分
                fc.string().filter(s => s.includes('@') && !s.split('@')[1]?.includes('.')),
                // 以@开头
                fc.string().filter(s => s.startsWith('@')),
                // 以@结尾
                fc.string().filter(s => s.endsWith('@')),
                // 包含空格
                fc.string().filter(s => s.includes(' ') && s.includes('@'))
            );

            fc.assert(
                fc.property(invalidEmailArbitrary, (email) => {
                    const result = formValidator.validateEmail(email);
                    expect(result).toBe(false);
                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it('属性测试：符合标准格式的邮箱应被接受', () => {
            // 生成有效的邮箱地址
            const validEmailArbitrary = fc.tuple(
                fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@') && !s.includes(' ')),
                fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.')),
                fc.string({ minLength: 2, maxLength: 10 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.'))
            ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

            fc.assert(
                fc.property(validEmailArbitrary, (email) => {
                    const result = formValidator.validateEmail(email);
                    expect(result).toBe(true);
                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });

    describe('整体表单验证属性', () => {
        it('属性测试：包含任何无效字段的表单应返回isValid=false', () => {
            // 生成至少有一个字段无效的表单数据
            const invalidFormArbitrary = fc.oneof(
                // 无效姓名
                fc.record({
                    name: fc.oneof(fc.constant(''), fc.constant(' '), fc.constant('a')),
                    phone: fc.tuple(
                        fc.constant('1'),
                        fc.integer({ min: 3, max: 9 }).map(n => n.toString()),
                        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
                            .map(arr => arr.join(''))
                    ).map(([first, second, rest]) => first + second + rest),
                    email: fc.tuple(
                        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('@') && !s.includes(' ')),
                        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.')),
                        fc.string({ minLength: 2, maxLength: 5 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.'))
                    ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`)
                }),
                // 无效电话
                fc.record({
                    name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
                    phone: fc.string().filter(s => !/^1[3-9]\d{9}$/.test(s.trim())),
                    email: fc.tuple(
                        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('@') && !s.includes(' ')),
                        fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.')),
                        fc.string({ minLength: 2, maxLength: 5 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.'))
                    ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`)
                }),
                // 无效邮箱
                fc.record({
                    name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
                    phone: fc.tuple(
                        fc.constant('1'),
                        fc.integer({ min: 3, max: 9 }).map(n => n.toString()),
                        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
                            .map(arr => arr.join(''))
                    ).map(([first, second, rest]) => first + second + rest),
                    email: fc.string().filter(s => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()))
                })
            );

            fc.assert(
                fc.property(invalidFormArbitrary, (formData) => {
                    const result = formValidator.validateForm(formData);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toBeDefined();
                    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
                    return true;
                }),
                { numRuns: 100 }
            );
        });

        it('属性测试：所有字段都有效的表单应返回isValid=true', () => {
            // 生成所有字段都有效的表单数据
            const validFormArbitrary = fc.record({
                name: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2 && s.trim().length <= 50),
                phone: fc.tuple(
                    fc.constant('1'),
                    fc.integer({ min: 3, max: 9 }).map(n => n.toString()),
                    fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
                        .map(arr => arr.join(''))
                ).map(([first, second, rest]) => first + second + rest),
                email: fc.tuple(
                    fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@') && !s.includes(' ')),
                    fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.')),
                    fc.string({ minLength: 2, maxLength: 10 }).filter(s => !s.includes('@') && !s.includes(' ') && !s.includes('.'))
                ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`)
            });

            fc.assert(
                fc.property(validFormArbitrary, (formData) => {
                    const result = formValidator.validateForm(formData);
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toBeDefined();
                    expect(Object.keys(result.errors).length).toBe(0);
                    return true;
                }),
                { numRuns: 100 }
            );
        });
    });
});
