# Y-car 新能源汽车销售网站

## ⚠️ 中国部署重要提示

**Vercel 在中国访问受限**：如果网站在中国无法访问，请使用以下替代方案：

### 🚀 推荐方案（按优先级）

1. **Gitee Pages**（最简单，5分钟部署）
   - ✅ 完全免费，在中国大陆，100% 可访问
   - 📖 [立即查看部署指南](./GITEE_PAGES_GUIDE.md)

2. **阿里云 OSS + CDN**（最佳性能）
   - ✅ 延迟 < 50ms，5-20元/月
   - 📖 [查看部署指南](./CHINA_ALTERNATIVE_DEPLOYMENT.md)

3. **GitHub Pages**（免费，通常可访问）
   - ✅ 完全免费，自动部署
   - 📖 [查看部署指南](./DEPLOYMENT_OPTIONS.md)

**详细对比**: 查看 [部署方案选择指南](./DEPLOYMENT_OPTIONS.md)

---

## 项目简介

Y-car 是一个现代化的新能源汽车销售网站，采用纯前端技术栈构建，提供车型展示、在线咨询等功能。

## 项目结构

```
y-car-website/
├── index.html                 # 主HTML文件
├── styles.css                 # 样式文件
├── script.js                  # JavaScript脚本
├── concept-car-placeholder.svg # 占位符图片
└── README.md                  # 项目说明
```

## 技术栈

- HTML5 - 语义化结构
- CSS3 - 现代化样式和响应式布局
- JavaScript (ES6+) - 交互功能
- SVG - 矢量图形

## 功能特性

### 已实现
- ✅ 语义化HTML5结构
- ✅ 响应式布局设计
- ✅ 导航栏（Header）
- ✅ 主视觉区（Hero）
- ✅ 车型展示区（Gallery）
- ✅ 产品优势区（Features）
- ✅ 联系表单区（Contact）
- ✅ 页脚（Footer）
- ✅ 图片放大模态框
- ✅ 平滑滚动

### 待实现
- ⏳ 车型数据动态渲染
- ⏳ 图片加载服务
- ⏳ 表单验证
- ⏳ 数据持久化（LocalStorage）
- ⏳ 图片放大查看功能
- ⏳ 动画效果

## 页面结构

### Header（导航栏）
- Logo 和品牌名称
- 导航菜单（首页、车型展示、产品优势、联系我们）

### Hero（主视觉区）
- 主标题和副标题
- "立即咨询"行动号召按钮

### Gallery（车型展示区）
- 车型卡片网格布局
- 每个卡片包含：图片、名称、续航、价格、特点

### Features（产品优势区）
- 三个优势项：环保、经济、性能
- 每项包含图标和描述

### Contact（联系表单区）
- 表单字段：姓名、电话、邮箱、意向车型、留言
- 表单验证和提交功能

### Footer（页脚）
- 公司信息
- 联系方式
- 社交媒体链接
- 版权信息

## 响应式设计

- 桌面端：≥768px - 多列网格布局
- 移动端：<768px - 单列布局

## Meta 标签

- `charset`: UTF-8
- `viewport`: 移动端适配
- `description`: SEO 描述

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动浏览器

## 开发说明

直接在浏览器中打开 `index.html` 即可预览网站。

## 部署

### 🌏 中国区域优化

本项目已针对中国用户访问进行优化配置：

- ✅ **部署区域**: 香港 (hkg1) + 新加坡 (sin1)
- ✅ **预期延迟**: < 100ms
- ✅ **加载时间**: < 3 秒
- ✅ **缓存策略**: 已配置
- ✅ **验证工具**: 完整提供

**快速开始**: 查看 [中国区域部署总结](./CHINA_DEPLOYMENT_SUMMARY.md)

### 部署平台
可部署到以下平台：
- ✅ Vercel（推荐，已配置中国区域）
- Netlify
- GitHub Pages

### 部署状态

**GitHub 仓库**: https://github.com/shongting/y-car-website.git

**部署步骤**：
1. ✅ 代码已推送到 GitHub
2. ✅ 已配置中国区域（香港 + 新加坡）
3. ⏳ 等待在 Vercel 中导入项目
4. ⏳ 等待部署完成
5. ⏳ 验证部署结果

详细部署指南请查看：
- [部署指南](./DEPLOYMENT.md)
- [中国区域部署指南](./CHINA_DEPLOYMENT_GUIDE.md)
- [中国区域部署总结](./CHINA_DEPLOYMENT_SUMMARY.md)

### 部署验证

部署完成后，请使用以下工具进行验证：

#### 验证工具

1. **Node.js 验证脚本**（推荐）
   ```bash
   node verify-deployment.js https://你的URL.vercel.app
   ```

2. **中国访问检查脚本**
   ```bash
   # macOS/Linux
   ./check-china-access.sh https://你的URL.vercel.app
   
   # Windows
   check-china-access.bat https://你的URL.vercel.app
   ```

3. **浏览器验证工具**
   - 打开 `deployment-test.html` 进行可视化验证

4. **验证文档**
   - 查看 `DEPLOYMENT_VERIFICATION.md` 了解详细验证清单
   - 查看 `TASK_15_VERIFICATION_GUIDE.md` 获取完整指南

**验证项目**：
- [ ] 网站可通过公网 URL 访问（需求 5.1）
- [ ] HTTPS 连接正常（需求 5.3）
- [ ] 加载时间 < 3 秒（需求 5.2）
- [ ] 部署在香港或新加坡区域
- [ ] 桌面端显示正常
- [ ] 移动端响应式布局正常
- [ ] 所有功能正常工作
- [ ] 从中国访问延迟 < 100ms

### 访问链接

**生产环境 URL**: _部署完成后填写_

### 相关文档

- 📖 [部署指南](./DEPLOYMENT.md)
- 🌏 [中国区域部署指南](./CHINA_DEPLOYMENT_GUIDE.md)
- 📋 [中国区域部署总结](./CHINA_DEPLOYMENT_SUMMARY.md)
- ✅ [验证指南](./TASK_15_VERIFICATION_GUIDE.md)
- 🛠️ [验证工具说明](./VERIFICATION_README.md)

## 测试

### 测试文件
- `responsive-layout.test.js` - 响应式布局测试
- `vehicle-rendering.test.js` - 车型渲染测试
- `image-service.test.js` - 图片服务测试
- `image-error-handling.test.js` - 图片错误处理测试
- `image-modal.test.js` - 图片模态框测试
- `form-validation.test.js` - 表单验证测试
- `form-submission.test.js` - 表单提交测试
- `storage-service.test.js` - 存储服务测试
- `features-display.test.js` - 优势展示测试
- `interaction-feedback.test.js` - 交互反馈测试

### 运行测试
```bash
npm test
```

## 许可证

Copyright © 2025 Y-car 新能源汽车有限公司
