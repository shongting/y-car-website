/**
 * 车型渲染属性测试
 * Feature: y-car-website, Property 1: 车型信息完整性
 * 验证需求: 1.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 读取 script.js 文件内容
const scriptPath = path.join(process.cwd(), 'y-car-website', 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

describe('车型信息完整性属性测试', () => {
    let dom;
    let document;
    let window;
    let renderVehicleCard;

    beforeEach(() => {
        // 创建新的 DOM 环境
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            runScripts: 'outside-only'
        });
        document = dom.window.document;
        window = dom.window;

        // 在 DOM 环境中执行脚本
        const scriptElement = document.createElement('script');
        scriptElement.textContent = scriptContent;
        document.body.appendChild(scriptElement);

        // 获取 renderVehicleCard 函数
        const scriptContext = dom.window.eval(`
            ${scriptContent}
            renderVehicleCard;
        `);
        renderVehicleCard = scriptContext;
    });

    /**
     * 属性 1: 车型信息完整性
     * 对于任意车型数据对象，渲染后的DOM元素应当包含车型名称、续航里程、价格区间和所有核心特点
     * 验证需求: 1.2
     */
    it('属性测试：任意车型数据渲染后应包含所有必需信息', () => {
        // 定义车型数据生成器
        const vehicleArbitrary = fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            imageUrl: fc.webUrl(),
            range: fc.integer({ min: 100, max: 1000 }),
            priceRange: fc.record({
                min: fc.integer({ min: 50000, max: 500000 }),
                max: fc.integer({ min: 50000, max: 500000 })
            }).map(({ min, max }) => ({
                min: Math.min(min, max),
                max: Math.max(min, max)
            })),
            features: fc.array(
                fc.string({ minLength: 1, maxLength: 50 }),
                { minLength: 1, maxLength: 10 }
            )
        });

        fc.assert(
            fc.property(vehicleArbitrary, (vehicle) => {
                // 在 DOM 环境中渲染车型卡片
                const card = dom.window.eval(`
                    ${scriptContent}
                    renderVehicleCard(${JSON.stringify(vehicle)});
                `);

                // 将卡片添加到 document 以便查询
                document.body.appendChild(card);

                // 验证车型名称存在
                const nameElement = card.querySelector('.vehicle-name');
                expect(nameElement).toBeTruthy();
                expect(nameElement.textContent).toBe(vehicle.name);

                // 验证续航里程存在
                const rangeElement = card.querySelector('.vehicle-range');
                expect(rangeElement).toBeTruthy();
                expect(rangeElement.textContent).toContain(vehicle.range.toString());
                expect(rangeElement.textContent).toContain('公里');

                // 验证价格区间存在
                const priceElement = card.querySelector('.vehicle-price');
                expect(priceElement).toBeTruthy();
                const priceMin = (vehicle.priceRange.min / 10000).toFixed(1);
                const priceMax = (vehicle.priceRange.max / 10000).toFixed(1);
                expect(priceElement.textContent).toContain(priceMin);
                expect(priceElement.textContent).toContain(priceMax);

                // 验证所有特点都被渲染
                const featuresList = card.querySelector('.vehicle-features');
                expect(featuresList).toBeTruthy();
                const featureItems = featuresList.querySelectorAll('li');
                expect(featureItems.length).toBe(vehicle.features.length);

                // 验证每个特点的文本内容
                vehicle.features.forEach((feature, index) => {
                    expect(featureItems[index].textContent).toBe(feature);
                });

                // 清理
                document.body.removeChild(card);

                return true;
            }),
            { numRuns: 100 } // 运行 100 次迭代
        );
    });
});
