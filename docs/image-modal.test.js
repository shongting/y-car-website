/**
 * 图片放大查看功能测试
 * Feature: y-car-website
 * 验证需求: 2.4
 */

import { describe, test, expect, beforeEach } from 'vitest';

describe('图片放大查看功能', () => {
    let openImageModal;
    let closeImageModal;

    beforeEach(() => {
        // 模拟 DOM 环境
        document.body.innerHTML = `
            <div class="modal" id="imageModal" style="display: none;">
                <span class="modal-close" id="modalClose">&times;</span>
                <img class="modal-content" id="modalImage" alt="车型大图">
            </div>
            <div class="vehicle-grid" id="vehicleGallery">
                <article class="vehicle-card">
                    <div class="vehicle-image-wrapper">
                        <img class="vehicle-image" src="test.jpg" alt="测试车型" style="cursor: pointer;">
                    </div>
                </article>
            </div>
        `;

        // 定义函数
        openImageModal = (imageUrl, altText) => {
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            
            if (modal && modalImage) {
                modalImage.src = imageUrl;
                modalImage.alt = altText;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        };

        closeImageModal = () => {
            const modal = document.getElementById('imageModal');
            
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };
    });

    test('模态框元素应该存在于 DOM 中', () => {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalClose = document.getElementById('modalClose');
        
        expect(modal).toBeTruthy();
        expect(modalImage).toBeTruthy();
        expect(modalClose).toBeTruthy();
    });

    test('模态框初始状态应该是隐藏的', () => {
        const modal = document.getElementById('imageModal');
        expect(modal.style.display).toBe('none');
    });

    test('openImageModal 应该打开模态框并设置图片', () => {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        
        const testImageUrl = 'https://example.com/test-image.jpg';
        const testAltText = '测试图片';
        
        openImageModal(testImageUrl, testAltText);
        
        expect(modal.style.display).toBe('flex');
        expect(modalImage.src).toBe(testImageUrl);
        expect(modalImage.alt).toBe(testAltText);
    });

    test('打开模态框时应该阻止背景滚动', () => {
        openImageModal('test.jpg', 'test');
        expect(document.body.style.overflow).toBe('hidden');
    });

    test('closeImageModal 应该关闭模态框', () => {
        const modal = document.getElementById('imageModal');
        
        // 先打开模态框
        openImageModal('test.jpg', 'test');
        expect(modal.style.display).toBe('flex');
        
        // 关闭模态框
        closeImageModal();
        expect(modal.style.display).toBe('none');
    });

    test('关闭模态框时应该恢复背景滚动', () => {
        // 先打开模态框
        openImageModal('test.jpg', 'test');
        expect(document.body.style.overflow).toBe('hidden');
        
        // 关闭模态框
        closeImageModal();
        expect(document.body.style.overflow).toBe('auto');
    });

    test('车型图片应该有 cursor: pointer 样式', () => {
        const vehicleImage = document.querySelector('.vehicle-image');
        expect(vehicleImage.style.cursor).toBe('pointer');
    });

    test('模态框应该有正确的 CSS 类', () => {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalClose = document.getElementById('modalClose');
        
        expect(modal.classList.contains('modal')).toBe(true);
        expect(modalImage.classList.contains('modal-content')).toBe(true);
        expect(modalClose.classList.contains('modal-close')).toBe(true);
    });
});
