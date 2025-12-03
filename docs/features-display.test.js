/**
 * 优势展示结构属性测试
 * Feature: y-car-website, Property 7: 优势展示结构
 * 验证需求: 4.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 读取 HTML 和 CSS 文件
const htmlPath = path.join(process.cwd(), 'y-car-website', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

describe('优势展示结构属性测试', () => {
    let dom;
    let document;

    beforeEach(() => {
        // 创建新的 DOM 环境并加载 HTML
        dom = new JSDOM(htmlContent, {
            runScripts: 'outside-only',
            resources: 'usable'
        });
        document = dom.window.document;
    });

    /**
     * 属性 7: 优势展示结构
     * 对于任意优势项（环保、经济、性能），渲染后的DOM元素应当同时包含图标元素和文字描述元素
     * 验证需求: 4.2
     */
    it('属性测试：所有优势项应同时包含图标和文字描述', () => {
        // 定义优势项选择器生成器 - 测试三个优势项
        const featureIndexArbitrary = fc.integer({ min: 0, max: 2 });

        fc.assert(
            fc.property(featureIndexArbitrary, (index) => {
                // 获取所有优势项
                const featureItems = document.querySelectorAll('.feature-item');
                
                // 验证至少有3个优势项
                expect(featureItems.length).toBeGreaterThanOrEqual(3);
                
                // 获取指定索引的优势项
                const featureItem = featureItems[index];
                expect(featureItem).toBeTruthy();

                // 验证包含图标元素
                const iconElement = featureItem.querySelector('.feature-icon');
                expect(iconElement).toBeTruthy();
                
                // 验证图标元素包含 SVG
                const svgElement = iconElement.querySelector('svg');
                expect(svgElement).toBeTruthy();

                // 验证包含标题文字元素
                const titleElement = featureItem.querySelector('.feature-title');
                expect(titleElement).toBeTruthy();
                expect(titleElement.textContent.trim().length).toBeGreaterThan(0);

                // 验证包含描述文字元素
                const descriptionElement = featureItem.querySelector('.feature-description');
                expect(descriptionElement).toBeTruthy();
                expect(descriptionElement.textContent.trim().length).toBeGreaterThan(0);

                return true;
            }),
            { numRuns: 100 } // 运行 100 次迭代
        );
    });

    it('属性测试：验证三个核心优势项的存在性', () => {
        // 获取所有优势项
        const featureItems = document.querySelectorAll('.feature-item');
        
        // 验证恰好有3个优势项（环保、经济、性能）
        expect(featureItems.length).toBe(3);

        // 验证每个优势项都有完整的结构
        featureItems.forEach((item, index) => {
            // 验证图标
            const icon = item.querySelector('.feature-icon svg');
            expect(icon).toBeTruthy();

            // 验证标题
            const title = item.querySelector('.feature-title');
            expect(title).toBeTruthy();
            expect(title.textContent.trim()).not.toBe('');

            // 验证描述
            const description = item.querySelector('.feature-description');
            expect(description).toBeTruthy();
            expect(description.textContent.trim()).not.toBe('');
        });
    });

    it('属性测试：验证优势项包含预期的关键词', () => {
        const featureItems = document.querySelectorAll('.feature-item');
        const titles = Array.from(featureItems).map(item => 
            item.querySelector('.feature-title').textContent.trim()
        );

        // 验证包含环保相关内容
        const hasEnvironmental = titles.some(title => 
            title.includes('环保') || title.includes('绿色')
        );
        expect(hasEnvironmental).toBe(true);

        // 验证包含经济相关内容
        const hasEconomic = titles.some(title => 
            title.includes('经济') || title.includes('实惠')
        );
        expect(hasEconomic).toBe(true);

        // 验证包含性能相关内容
        const hasPerformance = titles.some(title => 
            title.includes('性能') || title.includes('卓越')
        );
        expect(hasPerformance).toBe(true);
    });
});
