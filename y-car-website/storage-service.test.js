/**
 * 数据持久化往返属性测试
 * Feature: y-car-website, Property 6: 数据持久化往返
 * 验证需求: 3.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// 模拟 StorageService 类（从 script.js 复制）
class StorageService {
    constructor() {
        this.storageKey = 'y-car-purchase-intents';
        // 使用内存存储模拟 localStorage
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

describe('数据持久化往返属性测试', () => {
    let storageService;

    beforeEach(() => {
        storageService = new StorageService();
    });

    /**
     * 属性 6: 数据持久化往返
     * 对于任意购车意向数据，保存到localStorage后再读取，应当得到相同的数据内容
     * （姓名、电话、邮箱、意向车型）
     * 验证需求: 3.5
     */
    
    it('属性测试：保存后读取应得到相同的数据（单条数据）', () => {
        // 生成有效的购车意向数据
        const purchaseIntentArbitrary = fc.record({
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
            message: fc.string({ maxLength: 500 }),
            timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 })
        });

        fc.assert(
            fc.property(purchaseIntentArbitrary, (data) => {
                // 清空存储
                storageService.clearStorage();

                // 保存数据
                const saved = storageService.savePurchaseIntent(data);
                expect(saved).toBe(true);

                // 读取数据
                const retrieved = storageService.getAllPurchaseIntents();

                // 验证数据完整性
                expect(retrieved).toHaveLength(1);
                expect(retrieved[0].name).toBe(data.name);
                expect(retrieved[0].phone).toBe(data.phone);
                expect(retrieved[0].email).toBe(data.email);
                expect(retrieved[0].interestedModel).toBe(data.interestedModel);
                expect(retrieved[0].message).toBe(data.message);
                expect(retrieved[0].timestamp).toBe(data.timestamp);

                return true;
            }),
            { numRuns: 100 }
        );
    });

    it('属性测试：保存多条数据后读取应得到所有数据', () => {
        // 生成多条购车意向数据
        const purchaseIntentArrayArbitrary = fc.array(
            fc.record({
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
                message: fc.string({ maxLength: 500 }),
                timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 })
            }),
            { minLength: 1, maxLength: 10 }
        );

        fc.assert(
            fc.property(purchaseIntentArrayArbitrary, (dataArray) => {
                // 清空存储
                storageService.clearStorage();

                // 保存所有数据
                dataArray.forEach(data => {
                    const saved = storageService.savePurchaseIntent(data);
                    expect(saved).toBe(true);
                });

                // 读取所有数据
                const retrieved = storageService.getAllPurchaseIntents();

                // 验证数据数量
                expect(retrieved).toHaveLength(dataArray.length);

                // 验证每条数据的完整性
                dataArray.forEach((originalData, index) => {
                    expect(retrieved[index].name).toBe(originalData.name);
                    expect(retrieved[index].phone).toBe(originalData.phone);
                    expect(retrieved[index].email).toBe(originalData.email);
                    expect(retrieved[index].interestedModel).toBe(originalData.interestedModel);
                    expect(retrieved[index].message).toBe(originalData.message);
                    expect(retrieved[index].timestamp).toBe(originalData.timestamp);
                });

                return true;
            }),
            { numRuns: 100 }
        );
    });

    it('属性测试：往返测试 - 保存、读取、再保存、再读取应保持一致', () => {
        // 生成购车意向数据
        const purchaseIntentArbitrary = fc.record({
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
            message: fc.string({ maxLength: 500 }),
            timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 })
        });

        fc.assert(
            fc.property(purchaseIntentArbitrary, (data) => {
                // 清空存储
                storageService.clearStorage();

                // 第一次保存
                storageService.savePurchaseIntent(data);

                // 第一次读取
                const firstRetrieval = storageService.getAllPurchaseIntents();
                expect(firstRetrieval).toHaveLength(1);

                // 创建新的 StorageService 实例（模拟页面刷新）
                const newStorageService = new StorageService();
                newStorageService.mockStorage = { ...storageService.mockStorage };

                // 第二次读取（使用新实例）
                const secondRetrieval = newStorageService.getAllPurchaseIntents();

                // 验证两次读取的数据一致
                expect(secondRetrieval).toHaveLength(1);
                expect(secondRetrieval[0].name).toBe(firstRetrieval[0].name);
                expect(secondRetrieval[0].phone).toBe(firstRetrieval[0].phone);
                expect(secondRetrieval[0].email).toBe(firstRetrieval[0].email);
                expect(secondRetrieval[0].interestedModel).toBe(firstRetrieval[0].interestedModel);
                expect(secondRetrieval[0].message).toBe(firstRetrieval[0].message);
                expect(secondRetrieval[0].timestamp).toBe(firstRetrieval[0].timestamp);

                return true;
            }),
            { numRuns: 100 }
        );
    });

    it('属性测试：空存储读取应返回空数组', () => {
        fc.assert(
            fc.property(fc.constant(null), () => {
                // 清空存储
                storageService.clearStorage();

                // 读取数据
                const retrieved = storageService.getAllPurchaseIntents();

                // 验证返回空数组
                expect(retrieved).toEqual([]);
                expect(retrieved).toHaveLength(0);

                return true;
            }),
            { numRuns: 100 }
        );
    });
});
