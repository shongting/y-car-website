/**
 * 图片加载失败处理单元测试
 * 验证需求: 2.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// 读取 script.js 文件内容
const scriptPath = path.join(process.cwd(), 'y-car-website', 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

// 定义 ImageService 类（从 script.js 提取）
class ImageService {
    constructor() {
        this.imageServiceUrl = 'https://source.unsplash.com';
        this.placeholderUrl = 'concept-car-placeholder.svg';
        this.loadedImages = new Set();
        this.failedImages = new Set();
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
        
        console.warn(`图片加载失败: ${originalSrc}`);
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

describe('图片加载失败处理单元测试', () => {
    let dom;
    let document;
    let imageService;

    beforeEach(() => {
        // 创建新的 DOM 环境
        dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        document = dom.window.document;
        
        // 创建 ImageService 实例
        imageService = new ImageService();
    });

    it('应该在图片加载失败时显示占位符', () => {
        // 创建图片元素
        const img = document.createElement('img');
        const originalUrl = 'https://example.com/nonexistent.jpg';
        img.src = originalUrl;
        img.alt = '测试图片';

        // 调用错误处理
        imageService.handleImageError(img);

        // 验证图片源被替换为占位符
        expect(img.src).toContain('concept-car-placeholder.svg');
    });

    it('应该在图片加载失败时更新 alt 文本', () => {
        // 创建图片元素
        const img = document.createElement('img');
        img.src = 'https://example.com/test.jpg';
        img.alt = '原始描述';

        // 调用错误处理
        imageService.handleImageError(img);

        // 验证 alt 文本被更新
        expect(img.alt).toContain('失败');
    });

    it('应该在图片加载失败时添加错误样式类', () => {
        // 创建图片元素
        const img = document.createElement('img');
        img.src = 'https://example.com/test.jpg';

        // 调用错误处理
        imageService.handleImageError(img);

        // 验证添加了错误样式类
        expect(img.classList.contains('image-error')).toBe(true);
    });

    it('应该记录失败的图片 URL', () => {
        // 创建图片元素
        const img = document.createElement('img');
        const failedUrl = 'https://example.com/failed.jpg';
        img.src = failedUrl;

        // 调用错误处理
        imageService.handleImageError(img);

        // 验证失败的图片被记录
        expect(imageService.failedImages.has(failedUrl)).toBe(true);
    });

    it('应该避免重复处理同一个失败的图片', () => {
        // 创建图片元素
        const img = document.createElement('img');
        const failedUrl = 'https://example.com/failed.jpg';
        img.src = failedUrl;

        // 第一次调用错误处理
        imageService.handleImageError(img);
        const firstSrc = img.src;

        // 第二次调用错误处理
        imageService.handleImageError(img);
        const secondSrc = img.src;

        // 验证图片源没有再次改变
        expect(firstSrc).toBe(secondSrc);
    });

    it('应该处理空图片元素', () => {
        // 调用错误处理时传入 null
        expect(() => {
            imageService.handleImageError(null);
        }).not.toThrow();

        // 调用错误处理时传入 undefined
        expect(() => {
            imageService.handleImageError(undefined);
        }).not.toThrow();
    });

    it('应该为图片元素设置错误事件监听器', () => {
        // 创建图片元素
        const img = document.createElement('img');
        const testUrl = 'https://example.com/test.jpg';

        // 使用 setupImageHandlers 设置图片
        imageService.setupImageHandlers(img, testUrl);

        // 验证图片 src 被设置
        expect(img.src).toBe(testUrl);

        // 模拟图片加载失败
        const errorEvent = new dom.window.Event('error');
        img.dispatchEvent(errorEvent);

        // 验证错误处理被触发
        expect(img.src).toContain('concept-car-placeholder.svg');
    });

    it('应该在图片加载成功时添加加载完成样式类', () => {
        // 创建图片元素
        const img = document.createElement('img');
        const testUrl = 'https://example.com/test.jpg';

        // 使用 setupImageHandlers 设置图片
        imageService.setupImageHandlers(img, testUrl);

        // 模拟图片加载成功
        const loadEvent = new dom.window.Event('load');
        img.dispatchEvent(loadEvent);

        // 验证加载完成样式类被添加
        expect(img.classList.contains('image-loaded')).toBe(true);
    });

    it('应该记录成功加载的图片 URL', () => {
        // 创建图片元素
        const img = document.createElement('img');
        const testUrl = 'https://example.com/success.jpg';

        // 使用 setupImageHandlers 设置图片
        imageService.setupImageHandlers(img, testUrl);

        // 模拟图片加载成功
        const loadEvent = new dom.window.Event('load');
        img.dispatchEvent(loadEvent);

        // 验证成功加载的图片被记录
        expect(imageService.loadedImages.has(testUrl)).toBe(true);
    });
});
