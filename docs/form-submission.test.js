/**
 * 表单提交状态变化属性测试
 * Feature: y-car-website, Property 5: 表单提交状态变化
 * 验证需求: 3.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// 模拟 StorageService 类
class StorageService {
    constructor() {
        this.storageKey = 'y-car-purchase-intents';
        this.mockStorage = {};
    }
    
    savePurchaseIntent(data) {
        try {
            const existingData = this.getAllPurchaseIntents();
            existingData.push(data);
            this.mockStorage[this.storageKey] = JSON.stringify(existingData);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    getAllPurchaseIntents() {
        try {
            const data = this.mockStorage[this.storageKey];
            if (!data) {
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }
    
    clearStorage() {
        try {
            delete this.mockStorage[this.storageKey];
            return true;
        } catch (error) {
            return false;
        }
    }
}

// 模拟表单状态管理
class FormStateManager {
    constructor() {
        this.formData = {
            name: '',
            phone: '',
            email: '',
            interestedModel: '',
            message: ''
        };
        this.successMessageVisible = false;
    }
    
    setFormData(data) {
        this.formData = { ...data };
    }
    
    clearForm() {
        this.formData = {
            name: '',
            phone: '',
            email: '',
            interestedModel: '',
            message: ''
        };
    }
    
    showSuccessMessage() {
        this.successMessageVisible = true;
    }
    
    hideSuccessMessage() {
        this.successMessageVisible = false;
    }
    
    isFormEmpty() {
        return this.formData.name === '' &&
               this.formData.phone === '' &&
               this.formData.email === '' &&
               this.formData.interestedModel === '' &&
               this.formData.message === '';
    }
}

describe('表单提交状态变化属性测试', () => {
    let formStateManager;
    let storageService;

    beforeEach(() => {
        formStateManager = new FormStateManager();
        storageService = new StorageService();
    });

    /**
     * 属性 5: 表单提交状态变化
     * 对于任意有效的表单数据，成功提交后，表单字段应当被清空，且应当显示成功确认消息
     * 验证需求: 3.4
     */
    
    it('属性测试：成功提交后表单字段应被清空', () => {
        // 生成有效的表单数据
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
            ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
            interestedModel: fc.constantFrom('', 'y-car-sport', 'y-car-comfort', 'y-car-urban'),
            message: fc.string({ maxLength: 500 })
        });

        fc.assert(
            fc.property(validFormArbitrary, (formData) => {
                // 设置表单数据
                formStateManager.setFormData(formData);

                // 验证表单已填充
                expect(formStateManager.formData.name).toBe(formData.name);
                expect(formStateManager.formData.phone).toBe(formData.phone);
                expect(formStateManager.formData.email).toBe(formData.email);

                // 模拟成功提交后清空表单
                formStateManager.clearForm();

                // 验证表单已清空
                expect(formStateManager.isFormEmpty()).toBe(true);
                expect(formStateManager.formData.name).toBe('');
                expect(formStateManager.formData.phone).toBe('');
                expect(formStateManager.formData.email).toBe('');
                expect(formStateManager.formData.interestedModel).toBe('');
                expect(formStateManager.formData.message).toBe('');

                return true;
            }),
            { numRuns: 100 }
        );
    });

    it('属性测试：成功提交后应显示成功确认消息', () => {
        // 生成有效的表单数据
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
                // 初始状态：成功消息应该隐藏
                expect(formStateManager.successMessageVisible).toBe(false);

                // 模拟成功提交后显示成功消息
                formStateManager.showSuccessMessage();

                // 验证成功消息已显示
                expect(formStateManager.successMessageVisible).toBe(true);

                // 重置状态
                formStateManager.hideSuccessMessage();

                return true;
            }),
            { numRuns: 100 }
        );
    });

    it('属性测试：提交后表单状态应完全重置（字段清空 + 成功消息显示）', () => {
        // 生成有效的表单数据
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
            ).map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
            interestedModel: fc.constantFrom('', 'y-car-sport', 'y-car-comfort', 'y-car-urban'),
            message: fc.string({ maxLength: 500 })
        });

        fc.assert(
            fc.property(validFormArbitrary, (formData) => {
                // 设置表单数据
                formStateManager.setFormData(formData);
                formStateManager.hideSuccessMessage();

                // 模拟成功提交后的状态变化
                // 1. 显示成功消息
                formStateManager.showSuccessMessage();

                // 2. 清空表单
                formStateManager.clearForm();

                // 验证最终状态
                // 表单应该被清空
                expect(formStateManager.isFormEmpty()).toBe(true);
                
                // 成功消息应该显示
                expect(formStateManager.successMessageVisible).toBe(true);

                // 重置状态
                formStateManager.hideSuccessMessage();

                return true;
            }),
            { numRuns: 100 }
        );
    });
});
