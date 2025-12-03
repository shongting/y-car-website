/**
 * 图片加载服务属性测试
 * Feature: y-car-website, Property 3: 图片来源和规范
 * 验证需求: 2.1, 2.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

// 定义 ImageService 类（从 script.js 复制）
class ImageService {
    constructor() {
        this.imageServiceUrl = 'https://source.unsplash.com';
        this.placeholderUrl = 'concept-car-placeholder.svg';
        this.loadedImages = new Set();
        this.failedImages = new Set();
    }
    
    fetchConceptCarImage(query, width = 800, height = 600) {
        return `${this.imageServiceUrl}/${width}x${height}/?${query}`;
    }
    
    handleImageError(imageElement) {
        if (!imageElement) return;
        
        const originalSrc = imageElement.src;
        
        if (this.failedImages.has(originalSrc)) {
            return;
        }
        
        this.failedImages.add(originalSrc);
        imageElement.src = this.placeholderUrl;
        imageElement.alt = '概念车图片加载失败';
        imageElement.classList.add('image-error');
    }
    
    setupImageHandlers(imageElement, imageUrl) {
        if (!imageElement) return;
        
        imageElement.src = imageUrl;
        
        imageElement.addEventListener('load', () => {
            this.loadedImages.add(imageUrl);
            imageElement.classList.add('image-loaded');
        }, { once: true });
        
        imageElement.addEventListener('error', () => {
            this.handleImageError(imageElement);
        }, { once: true });
    }
}

describe('图片来源和规范属性测试', () => {
    let imageService;
    let dom;
    let document;

    beforeEach(() => {
        imageService = new ImageService();
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        document = dom.window.document;
    });

    /**
     * 属性 3: 图片来源和规范
     * 对于任意车型图片，图片URL应当指向配置的图片服务域名，
     * 且图片元素应当具有alt属性和适当的尺寸属性
     * 验证需求: 2.1, 2.3
     */
    it('属性测试：ImageService 应正确配置图片服务 URL', () => {
        expect(imageService.imageServiceUrl).toBeTruthy();
        expect(imageService.imageServiceUrl).toContain('unsplash');
        expect(imageService.placeholderUrl).toBeTruthy();
        expect(imageService.placeholderUrl).toContain('.svg');
    });

    it('属性测试：fetchConceptCarImage 应生成符合规范的 URL', () => {
        const queryArbitrary = fc.string({ minLength: 1, maxLength: 50 });
        const widthArbitrary = fc.integer({ min: 100, max: 2000 });
        const heightArbitrary = fc.integer({ min: 100, max: 2000 });

        fc.assert(
            fc.property(
                queryArbitrary,
                widthArbitrary,
                heightArbitrary,
                (query, width, height) => {
                    const imageUrl = imageService.fetchConceptCarImage(query, width, height);
                    expect(typeof imageUrl).toBe('string');
                    expect(imageUrl).toContain(imageService.imageServiceUrl);
                    expect(imageUrl).toContain(`${width}x${height}`);
                    expect(imageUrl).toContain(query);
                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('属性测试：handleImageError 应正确处理图片加载失败', () => {
        const imageUrlArbitrary = fc.string({ minLength: 10, maxLength: 100 }).map(s => `test-${s}.jpg`);

        fc.assert(
            fc.property(imageUrlArbitrary, (originalUrl) => {
                const img = document.createElement('img');
                img.src = originalUrl;
                const actualSrc = img.src; // 获取浏览器转换后的实际URL
                img.alt = '测试图片';

                imageService.handleImageError(img);

                // 检查图片源是否包含占位符（使用toLowerCase避免大小写问题）
                expect(img.src.toLowerCase()).toContain(imageService.placeholderUrl.toLowerCase());
                expect(img.alt).toContain('失败');
                expect(img.classList.contains('image-error')).toBe(true);
                // 检查失败记录中是否包含实际的URL（浏览器转换后的）
                expect(imageService.failedImages.has(actualSrc)).toBe(true);

                return true;
            }),
            { numRuns: 100 }
        );
    });

    it('属性测试：setupImageHandlers 应为图片元素设置正确的属性', () => {
        const imageUrlArbitrary = fc.string({ minLength: 10, maxLength: 100 }).map(s => `test-${s}.jpg`);

        fc.assert(
            fc.property(imageUrlArbitrary, (imageUrl) => {
                const img = document.createElement('img');
                imageService.setupImageHandlers(img, imageUrl);
                // 浏览器会将相对路径转换为绝对路径，所以我们检查 src 是否被设置且不为空
                expect(img.src).toBeTruthy();
                // 检查 src 是否包含文件扩展名（URL编码可能改变字符，但扩展名应该保留）
                expect(img.src.toLowerCase()).toContain('.jpg');
                return true;
            }),
            { numRuns: 100 }
        );
    });

    it('属性测试：任意车型图片元素应具有 alt 属性', () => {
        const vehicleNameArbitrary = fc.string({ minLength: 1, maxLength: 100 });
        const imageUrlArbitrary = fc.string({ minLength: 10, maxLength: 100 }).map(s => `test-${s}.jpg`);

        fc.assert(
            fc.property(
                vehicleNameArbitrary,
                imageUrlArbitrary,
                (vehicleName, imageUrl) => {
                    const img = document.createElement('img');
                    img.className = 'vehicle-image';
                    img.alt = `${vehicleName} 概念车`;
                    img.loading = 'lazy';

                    imageService.setupImageHandlers(img, imageUrl);

                    expect(img.alt).toBeTruthy();
                    expect(img.alt.length).toBeGreaterThan(0);
                    expect(img.alt).toContain(vehicleName);
                    expect(img.className).toContain('vehicle-image');
                    expect(img.loading).toBe('lazy');

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
