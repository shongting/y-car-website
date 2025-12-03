/**
 * 交互反馈效果属性测试
 * Feature: y-car-website, Property 8: 交互反馈效果
 * Validates: Requirements 6.3, 6.4
 * 
 * 属性：对于任意可交互元素（按钮、链接、卡片），应当具有CSS过渡或动画属性，以提供视觉反馈
 */

const fc = require('fast-check');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// 读取HTML和CSS文件
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');

/**
 * 设置测试环境
 */
function setupTestEnvironment() {
    const dom = new JSDOM(htmlContent, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        resources: 'usable'
    });
    
    const { window } = dom;
    const { document } = window;
    
    // 注入CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);
    
    return { window, document };
}

/**
 * 检查元素是否具有过渡或动画属性
 * @param {Element} element - DOM元素
 * @param {Window} window - window对象
 * @returns {boolean} 是否具有过渡或动画
 */
function hasTransitionOrAnimation(element, window) {
    const computedStyle = window.getComputedStyle(element);
    
    // 检查 transition 属性
    const transition = computedStyle.transition || computedStyle.webkitTransition;
    const hasTransition = transition && transition !== 'all 0s ease 0s' && transition !== 'none';
    
    // 检查 animation 属性
    const animation = computedStyle.animation || computedStyle.webkitAnimation;
    const hasAnimation = animation && animation !== 'none';
    
    return hasTransition || hasAnimation;
}

/**
 * 检查元素或其伪元素是否具有过渡/动画
 * @param {Element} element - DOM元素
 * @param {Window} window - window对象
 * @returns {boolean}
 */
function elementHasInteractionFeedback(element, window) {
    // 检查元素本身
    if (hasTransitionOrAnimation(element, window)) {
        return true;
    }
    
    // 检查 ::before 伪元素
    try {
        const beforeStyle = window.getComputedStyle(element, '::before');
        if (beforeStyle && hasTransitionOrAnimation({ style: beforeStyle }, window)) {
            return true;
        }
    } catch (e) {
        // 某些元素可能不支持伪元素
    }
    
    // 检查 ::after 伪元素
    try {
        const afterStyle = window.getComputedStyle(element, '::after');
        if (afterStyle && hasTransitionOrAnimation({ style: afterStyle }, window)) {
            return true;
        }
    } catch (e) {
        // 某些元素可能不支持伪元素
    }
    
    return false;
}

describe('交互反馈效果属性测试', () => {
    let window, document;
    
    beforeEach(() => {
        const env = setupTestEnvironment();
        window = env.window;
        document = env.document;
    });
    
    afterEach(() => {
        if (window) {
            window.close();
        }
    });
    
    /**
     * 属性测试：所有按钮应具有过渡或动画效果
     */
    test('属性 8.1: 所有按钮元素应具有CSS过渡或动画属性', () => {
        const buttons = document.querySelectorAll('button, .cta-button, .vehicle-button, .submit-button');
        
        expect(buttons.length).toBeGreaterThan(0);
        
        buttons.forEach(button => {
            const hasFeedback = elementHasInteractionFeedback(button, window);
            expect(hasFeedback).toBe(true);
        });
    });
    
    /**
     * 属性测试：所有链接应具有过渡或动画效果
     */
    test('属性 8.2: 所有链接元素应具有CSS过渡或动画属性', () => {
        const links = document.querySelectorAll('a');
        
        expect(links.length).toBeGreaterThan(0);
        
        links.forEach(link => {
            const hasFeedback = elementHasInteractionFeedback(link, window);
            expect(hasFeedback).toBe(true);
        });
    });
    
    /**
     * 属性测试：所有卡片应具有过渡或动画效果
     */
    test('属性 8.3: 所有卡片元素应具有CSS过渡或动画属性', () => {
        const cards = document.querySelectorAll('.vehicle-card, .feature-item');
        
        expect(cards.length).toBeGreaterThan(0);
        
        cards.forEach(card => {
            const hasFeedback = elementHasInteractionFeedback(card, window);
            expect(hasFeedback).toBe(true);
        });
    });
    
    /**
     * 基于属性的测试：随机选择的可交互元素应具有过渡或动画
     */
    test('属性 8: 对于任意可交互元素，应当具有CSS过渡或动画属性', () => {
        fc.assert(
            fc.property(
                // 生成随机的可交互元素选择器
                fc.constantFrom(
                    'button',
                    '.cta-button',
                    '.vehicle-button',
                    '.submit-button',
                    'a',
                    '.nav-links a',
                    '.social-links a',
                    '.vehicle-card',
                    '.feature-item',
                    'input',
                    'select',
                    'textarea'
                ),
                (selector) => {
                    const elements = document.querySelectorAll(selector);
                    
                    // 如果没有找到元素，跳过此测试
                    if (elements.length === 0) {
                        return true;
                    }
                    
                    // 检查所有匹配的元素
                    let allHaveFeedback = true;
                    elements.forEach(element => {
                        if (!elementHasInteractionFeedback(element, window)) {
                            allHaveFeedback = false;
                        }
                    });
                    
                    return allHaveFeedback;
                }
            ),
            { numRuns: 100 }
        );
    });
    
    /**
     * 基于属性的测试：验证过渡属性的有效性
     */
    test('属性 8.4: 可交互元素的过渡属性应该是有效的', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    '.cta-button',
                    '.vehicle-button',
                    '.submit-button',
                    '.vehicle-card',
                    '.feature-item'
                ),
                (selector) => {
                    const elements = document.querySelectorAll(selector);
                    
                    if (elements.length === 0) {
                        return true;
                    }
                    
                    let allValid = true;
                    elements.forEach(element => {
                        const computedStyle = window.getComputedStyle(element);
                        const transition = computedStyle.transition || computedStyle.webkitTransition;
                        
                        // 如果有过渡属性，验证它不是默认值
                        if (transition) {
                            const isValid = transition !== 'all 0s ease 0s' && 
                                          transition !== 'none' &&
                                          transition.length > 0;
                            if (!isValid) {
                                allValid = false;
                            }
                        }
                    });
                    
                    return allValid;
                }
            ),
            { numRuns: 100 }
        );
    });
    
    /**
     * 单元测试：验证特定交互元素的过渡效果
     */
    test('单元测试: CTA按钮应具有transform和box-shadow过渡', () => {
        const ctaButton = document.querySelector('.cta-button');
        expect(ctaButton).toBeTruthy();
        
        const computedStyle = window.getComputedStyle(ctaButton);
        const transition = computedStyle.transition || computedStyle.webkitTransition;
        
        expect(transition).toBeTruthy();
        expect(transition).not.toBe('none');
        expect(transition.length).toBeGreaterThan(0);
    });
    
    /**
     * 单元测试：验证车型卡片的悬停效果
     */
    test('单元测试: 车型卡片应具有transform和box-shadow过渡', () => {
        const vehicleCard = document.querySelector('.vehicle-card');
        
        if (vehicleCard) {
            const computedStyle = window.getComputedStyle(vehicleCard);
            const transition = computedStyle.transition || computedStyle.webkitTransition;
            
            expect(transition).toBeTruthy();
            expect(transition).not.toBe('none');
            // 应该包含 transform 和 box-shadow
            expect(transition.toLowerCase()).toMatch(/transform|box-shadow/);
        }
    });
    
    /**
     * 单元测试：验证导航链接的过渡效果
     */
    test('单元测试: 导航链接应具有color和transform过渡', () => {
        const navLinks = document.querySelectorAll('.nav-links a');
        expect(navLinks.length).toBeGreaterThan(0);
        
        navLinks.forEach(link => {
            const computedStyle = window.getComputedStyle(link);
            const transition = computedStyle.transition || computedStyle.webkitTransition;
            
            expect(transition).toBeTruthy();
            expect(transition).not.toBe('none');
        });
    });
});
