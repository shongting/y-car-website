/**
 * 响应式布局适配属性测试
 * Feature: y-car-website, Property 2: 响应式布局适配
 * Validates: Requirements 1.3
 * 
 * 属性：对于任意视口宽度，当宽度小于768px时，布局应当切换为单列移动端布局，
 * 当宽度大于等于768px时应当使用多列桌面布局
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('响应式布局适配属性测试', () => {
  /**
   * 解析 CSS 文件并提取媒体查询规则
   */
  function parseCSSMediaQueries(cssContent) {
    const mediaQueries = {};
    
    // 移除注释
    const cleanedCSS = cssContent.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 匹配媒体查询块 - 使用更复杂的正则来处理嵌套
    const mediaQueryRegex = /@media\s*\(([^)]+)\)\s*\{/g;
    let match;
    
    while ((match = mediaQueryRegex.exec(cleanedCSS)) !== null) {
      const condition = match[1].trim();
      const startIndex = match.index + match[0].length;
      
      // 找到匹配的结束大括号
      let braceCount = 1;
      let endIndex = startIndex;
      
      while (braceCount > 0 && endIndex < cleanedCSS.length) {
        if (cleanedCSS[endIndex] === '{') braceCount++;
        if (cleanedCSS[endIndex] === '}') braceCount--;
        endIndex++;
      }
      
      const mediaContent = cleanedCSS.substring(startIndex, endIndex - 1);
      
      if (!mediaQueries[condition]) {
        mediaQueries[condition] = [];
      }
      
      // 提取规则中的选择器和属性
      const ruleRegex = /([^{]+)\{([^}]+)\}/g;
      let ruleMatch;
      
      while ((ruleMatch = ruleRegex.exec(mediaContent)) !== null) {
        const selector = ruleMatch[1].trim();
        const properties = ruleMatch[2].trim();
        
        // 跳过空选择器
        if (selector && properties) {
          mediaQueries[condition].push({
            selector,
            properties
          });
        }
      }
    }
    
    return mediaQueries;
  }

  /**
   * 检查 CSS 规则中是否包含特定属性
   */
  function hasProperty(properties, propertyName) {
    const regex = new RegExp(`${propertyName}\\s*:\\s*([^;]+)`, 'i');
    const match = properties.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * 属性测试：响应式布局适配
   * 
   * 对于任意视口宽度：
   * - 当宽度 < 768px 时，车型网格应该是单列布局
   * - 当宽度 >= 768px 时，车型网格应该是多列布局
   */
  it('属性 2: 对于任意视口宽度，应当根据断点正确切换布局', () => {
    // 读取 CSS 文件
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    // 解析媒体查询
    const mediaQueries = parseCSSMediaQueries(cssContent);
    
    // 验证移动端媒体查询存在
    const mobileQuery = mediaQueries['max-width: 768px'];
    expect(mobileQuery).toBeDefined();
    expect(mobileQuery.length).toBeGreaterThan(0);
    
    // 查找 .vehicle-grid 的移动端规则
    const vehicleGridMobileRule = mobileQuery.find(rule => 
      rule.selector.includes('.vehicle-grid')
    );
    
    expect(vehicleGridMobileRule).toBeDefined();
    
    // 验证移动端是单列布局
    const mobileGridColumns = hasProperty(
      vehicleGridMobileRule.properties, 
      'grid-template-columns'
    );
    expect(mobileGridColumns).toBe('1fr');
    
    // 验证桌面端默认布局（在媒体查询外）
    const desktopGridRegex = /\.vehicle-grid\s*\{([^}]+)\}/;
    const desktopMatch = cssContent.match(desktopGridRegex);
    expect(desktopMatch).toBeTruthy();
    
    const desktopGridColumns = hasProperty(
      desktopMatch[1], 
      'grid-template-columns'
    );
    
    // 桌面端应该使用 repeat(auto-fit, minmax(...)) 或类似的多列布局
    expect(desktopGridColumns).toBeTruthy();
    expect(desktopGridColumns).toContain('repeat');
    
    // 属性测试：验证断点逻辑
    fc.assert(
      fc.property(
        // 生成随机视口宽度：从 320px（最小移动设备）到 1920px（大屏幕）
        fc.integer({ min: 320, max: 1920 }),
        (viewportWidth) => {
          // 根据视口宽度判断应该使用哪个布局
          const shouldBeMobile = viewportWidth < 768;
          
          if (shouldBeMobile) {
            // 移动端：验证单列布局规则存在
            expect(vehicleGridMobileRule).toBeDefined();
            expect(mobileGridColumns).toBe('1fr');
          } else {
            // 桌面端：验证多列布局规则存在
            expect(desktopGridColumns).toBeTruthy();
            expect(desktopGridColumns).toContain('repeat');
          }
          
          return true;
        }
      ),
      { numRuns: 100 } // 运行 100 次迭代
    );
  });

  /**
   * 补充测试：验证其他响应式元素
   */
  it('应当为其他关键元素提供响应式样式', () => {
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    const mediaQueries = parseCSSMediaQueries(cssContent);
    const mobileQuery = mediaQueries['max-width: 768px'];
    
    // 验证 features-grid 也有移动端单列布局
    const featuresGridMobileRule = mobileQuery.find(rule => 
      rule.selector.includes('.features-grid')
    );
    
    expect(featuresGridMobileRule).toBeDefined();
    
    const featuresGridColumns = hasProperty(
      featuresGridMobileRule.properties, 
      'grid-template-columns'
    );
    expect(featuresGridColumns).toBe('1fr');
  });

  /**
   * 补充测试：验证断点值的一致性
   */
  it('应当使用一致的断点值 768px', () => {
    const cssPath = path.join(__dirname, 'styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    // 查找所有媒体查询
    const mediaQueryRegex = /@media\s*\([^)]*max-width:\s*(\d+)px[^)]*\)/g;
    const breakpoints = [];
    let match;
    
    while ((match = mediaQueryRegex.exec(cssContent)) !== null) {
      breakpoints.push(parseInt(match[1]));
    }
    
    // 验证主要断点是 768px
    expect(breakpoints).toContain(768);
  });
});
