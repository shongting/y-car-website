# Y-car 新能源汽车销售网站 - 设计文档

## 概述

Y-car 网站是一个单页面应用（SPA），采用现代化的前端技术栈构建。网站将使用 HTML5、CSS3 和原生 JavaScript 实现，确保快速加载和良好的用户体验。概念车图片将通过公开的图片生成 API（如 Unsplash API 或占位符服务）获取，网站将部署到静态托管平台（如 Vercel、Netlify 或 GitHub Pages）以实现快速访问。

## 架构

### 整体架构

网站采用客户端渲染的单页面架构：

```
┌─────────────────────────────────────┐
│         用户浏览器                    │
│  ┌──────────────────────────────┐   │
│  │      HTML/CSS/JavaScript      │   │
│  │  ┌────────────────────────┐   │   │
│  │  │   UI 组件层             │   │   │
│  │  │  - 车型展示             │   │   │
│  │  │  - 表单处理             │   │   │
│  │  │  - 图片加载             │   │   │
│  │  └────────────────────────┘   │   │
│  │  ┌────────────────────────┐   │   │
│  │  │   数据管理层            │   │   │
│  │  │  - LocalStorage        │   │   │
│  │  │  - 表单验证             │   │   │
│  │  └────────────────────────┘   │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│      外部图片服务 API                 │
│   (Unsplash / Placeholder)          │
└─────────────────────────────────────┘
```

### 技术栈

- **前端**: HTML5, CSS3, 原生 JavaScript (ES6+)
- **样式**: CSS Grid, Flexbox, CSS 动画
- **图片服务**: Unsplash API 或 Lorem Picsum
- **部署平台**: Vercel / Netlify / GitHub Pages
- **版本控制**: Git

## 组件和接口

### 1. 页面结构组件

#### Header 组件
- 导航栏
- Logo 和品牌名称
- 响应式菜单

#### Hero Section 组件
- 主标题和副标题
- 行动号召按钮
- 背景图片/视频

#### Vehicle Gallery 组件
- 车型卡片网格
- 每个卡片包含：
  - 概念车图片
  - 车型名称
  - 续航里程
  - 价格区间
  - 核心特点列表
  - "了解更多"按钮

#### Features Section 组件
- 新能源汽车优势展示
- 图标 + 文字说明
- 三列布局（环保、经济、性能）

#### Contact Form 组件
- 表单字段：
  - 姓名（必填）
  - 电话（必填，格式验证）
  - 邮箱（必填，格式验证）
  - 意向车型（选择）
  - 留言（可选）
- 提交按钮
- 错误提示显示

#### Footer 组件
- 版权信息
- 联系方式
- 社交媒体链接

### 2. 数据模型

#### VehicleModel 接口
```typescript
interface VehicleModel {
  id: string;
  name: string;
  imageUrl: string;
  range: number; // 续航里程（公里）
  priceRange: {
    min: number;
    max: number;
  };
  features: string[];
}
```

#### ContactFormData 接口
```typescript
interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  interestedModel: string;
  message?: string;
  timestamp: number;
}
```

### 3. 图片加载服务

#### ImageService
```javascript
class ImageService {
  // 从 Unsplash 或占位符服务获取图片
  async fetchConceptCarImage(query: string): Promise<string>
  
  // 处理图片加载失败
  handleImageError(element: HTMLImageElement): void
  
  // 预加载图片
  preloadImages(urls: string[]): Promise<void>
}
```

### 4. 表单验证服务

#### FormValidator
```javascript
class FormValidator {
  // 验证姓名（非空，2-50字符）
  validateName(name: string): boolean
  
  // 验证电话（中国手机号格式）
  validatePhone(phone: string): boolean
  
  // 验证邮箱
  validateEmail(email: string): boolean
  
  // 验证整个表单
  validateForm(formData: ContactFormData): ValidationResult
}
```

### 5. 本地存储服务

#### StorageService
```javascript
class StorageService {
  // 保存购车意向
  savePurchaseIntent(data: ContactFormData): void
  
  // 获取所有购车意向
  getAllPurchaseIntents(): ContactFormData[]
  
  // 清空存储
  clearStorage(): void
}
```

## 数据模型

### 车型数据结构

```javascript
const vehicleModels = [
  {
    id: 'y-car-sport',
    name: 'Y-Car Sport',
    imageUrl: 'https://source.unsplash.com/800x600/?electric-car,sport',
    range: 650,
    priceRange: { min: 299000, max: 399000 },
    features: ['0-100km/h 3.2秒', '智能驾驶辅助', '全景天幕']
  },
  {
    id: 'y-car-comfort',
    name: 'Y-Car Comfort',
    imageUrl: 'https://source.unsplash.com/800x600/?electric-car,luxury',
    range: 720,
    priceRange: { min: 259000, max: 329000 },
    features: ['超长续航', '豪华内饰', '静音座舱']
  },
  {
    id: 'y-car-urban',
    name: 'Y-Car Urban',
    imageUrl: 'https://source.unsplash.com/800x600/?electric-car,compact',
    range: 520,
    priceRange: { min: 189000, max: 239000 },
    features: ['城市代步', '灵活停车', '经济实惠']
  }
];
```

### 表单验证规则

- **姓名**: 2-50个字符，不能为空或纯空格
- **电话**: 11位数字，符合中国手机号格式 (1[3-9]\d{9})
- **邮箱**: 符合标准邮箱格式 (RFC 5322 简化版)
- **意向车型**: 必须从预定义列表中选择

## 正确性属性

*属性是指在系统所有有效执行中都应该成立的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性反思

在分析所有验收标准后，识别出以下可测试属性。已消除冗余并合并相关属性：

- 表单验证属性（3.2 和 3.3）合并为综合验证属性
- 图片属性验证（2.1 和 2.3）合并为图片规范属性
- UI反馈属性（6.3 和 6.4）合并为交互反馈属性

### 正确性属性列表

**属性 1: 车型信息完整性**
*对于任意*车型数据对象，渲染后的DOM元素应当包含车型名称、续航里程、价格区间和所有核心特点
**验证需求: 1.2**

**属性 2: 响应式布局适配**
*对于任意*视口宽度，当宽度小于768px时，布局应当切换为单列移动端布局，当宽度大于等于768px时应当使用多列桌面布局
**验证需求: 1.3**

**属性 3: 图片来源和规范**
*对于任意*车型图片，图片URL应当指向配置的图片服务域名，且图片元素应当具有alt属性和适当的尺寸属性
**验证需求: 2.1, 2.3**

**属性 4: 表单验证规则**
*对于任意*表单输入，当姓名为空或纯空格、电话不符合11位手机号格式、或邮箱不符合标准格式时，验证应当返回false并阻止提交
**验证需求: 3.2, 3.3**

**属性 5: 表单提交状态变化**
*对于任意*有效的表单数据，成功提交后，表单字段应当被清空，且应当显示成功确认消息
**验证需求: 3.4**

**属性 6: 数据持久化往返**
*对于任意*购车意向数据，保存到localStorage后再读取，应当得到相同的数据内容（姓名、电话、邮箱、意向车型）
**验证需求: 3.5**

**属性 7: 优势展示结构**
*对于任意*优势项（环保、经济、性能），渲染后的DOM元素应当同时包含图标元素和文字描述元素
**验证需求: 4.2**

**属性 8: 交互反馈效果**
*对于任意*可交互元素（按钮、链接、卡片），应当具有CSS过渡或动画属性，以提供视觉反馈
**验证需求: 6.3, 6.4**

## 错误处理

### 图片加载失败
- 使用 `onerror` 事件监听器捕获图片加载失败
- 替换为本地占位符图片（SVG格式）
- 在控制台记录错误信息
- 向用户显示友好提示（可选）

### 表单验证错误
- 实时验证：在用户输入时提供即时反馈
- 提交验证：在表单提交时进行完整验证
- 错误显示：在对应字段下方显示红色错误消息
- 错误样式：为无效字段添加红色边框

### 网络请求失败
- 图片请求失败：使用占位符图片
- API请求失败（如果有）：显示错误提示并允许重试
- 超时处理：设置合理的请求超时时间（10秒）

### 浏览器兼容性
- 使用特性检测而非浏览器检测
- 为不支持的特性提供降级方案
- LocalStorage不可用时使用内存存储

## 测试策略

### 双重测试方法

本项目将采用单元测试和基于属性的测试相结合的方法，以确保全面的代码覆盖和正确性验证。

#### 单元测试

单元测试将验证特定示例、边缘情况和错误条件：

- **表单验证示例**：测试特定的有效和无效输入
- **图片加载失败处理**：模拟图片加载错误
- **DOM操作**：验证特定UI交互的结果
- **边缘情况**：空输入、特殊字符、极端值

单元测试框架：**Vitest** 或 **Jest**（如果项目已使用）

#### 基于属性的测试

基于属性的测试将验证应该在所有输入中成立的通用属性：

- **表单验证属性**：生成随机输入验证验证逻辑
- **数据往返属性**：验证存储和检索的一致性
- **渲染完整性属性**：验证所有车型数据都正确渲染
- **响应式布局属性**：测试各种视口宽度

基于属性的测试库：**fast-check**（JavaScript/TypeScript的PBT库）

**配置要求**：
- 每个基于属性的测试必须运行至少 **100次迭代**
- 每个基于属性的测试必须使用注释标签明确引用设计文档中的正确性属性
- 标签格式：`// Feature: y-car-website, Property {number}: {property_text}`
- 每个正确性属性必须由单个基于属性的测试实现

#### 测试覆盖目标

- 核心业务逻辑：100%
- UI组件：80%以上
- 错误处理路径：100%

### 端到端测试（可选）

如果需要，可以使用 Playwright 或 Cypress 进行端到端测试：
- 完整的用户流程测试
- 跨浏览器兼容性测试
- 视觉回归测试

## 部署策略

### 静态网站托管

推荐使用以下平台之一：

1. **Vercel**（推荐）
   - 自动从Git仓库部署
   - 提供免费HTTPS
   - 全球CDN加速
   - 自动生成预览URL

2. **Netlify**
   - 类似Vercel的功能
   - 表单处理功能（可用于联系表单）
   - 持续部署

3. **GitHub Pages**
   - 免费托管
   - 直接从GitHub仓库部署
   - 适合简单静态网站

### 部署步骤（以Vercel为例）

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 配置构建设置（如果需要）
4. 部署并获取公网URL
5. 配置自定义域名（可选）

### 性能优化

- **图片优化**：使用WebP格式，设置适当的尺寸
- **代码压缩**：压缩HTML、CSS、JavaScript
- **缓存策略**：设置适当的缓存头
- **懒加载**：图片和非关键内容使用懒加载
- **CDN加速**：利用托管平台的CDN

### 监控和分析

- 使用Google Analytics或类似工具跟踪访问
- 监控页面加载性能
- 收集用户反馈

## 安全考虑

- **输入验证**：所有用户输入必须验证和清理
- **XSS防护**：使用textContent而非innerHTML处理用户输入
- **HTTPS**：强制使用HTTPS连接
- **CSP头**：配置内容安全策略（如果托管平台支持）
- **数据隐私**：LocalStorage中的数据仅存储在用户浏览器，不包含敏感信息

## 可访问性

- 使用语义化HTML标签
- 为所有图片提供alt文本
- 确保键盘导航可用
- 提供足够的颜色对比度
- 使用ARIA标签增强可访问性
- 支持屏幕阅读器

## 浏览器支持

- Chrome/Edge（最新版本及前两个版本）
- Firefox（最新版本及前两个版本）
- Safari（最新版本及前两个版本）
- 移动浏览器：iOS Safari, Chrome Mobile

## 未来扩展

- 添加车型对比功能
- 集成在线预约试驾
- 添加用户评价和评论
- 集成支付系统
- 添加后台管理系统
- 多语言支持
