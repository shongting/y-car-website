# 🇨🇳 中国部署快速开始

## ⚠️ Vercel 无法访问？

Vercel 在中国大陆没有服务器，可能无法访问。以下是3个快速替代方案：

---

## 方案 1：Gitee Pages（推荐，最简单）

### ⏱️ 5 分钟部署

```bash
# 1. 注册 Gitee 账号
访问 https://gitee.com

# 2. 从 GitHub 导入仓库
点击 "+" → "从 GitHub 导入仓库"

# 3. 启用 Gitee Pages
服务 → Gitee Pages → 启动

# 4. 访问网站
https://你的用户名.gitee.io/y-car-website/
```

### ✅ 优势
- 完全免费
- 在中国大陆
- 100% 可访问
- 速度快（延迟 ~30ms）

### 📖 详细指南
[Gitee Pages 完整部署指南](./GITEE_PAGES_GUIDE.md)

---

## 方案 2：GitHub Pages（免费）

### ⏱️ 2 分钟部署

```bash
# 1. 在 GitHub 仓库设置中
Settings → Pages

# 2. 配置
Source: main
Folder: /y-car-website

# 3. 保存并等待（约1分钟）

# 4. 访问网站
https://你的用户名.github.io/仓库名/
```

### ✅ 优势
- 完全免费
- 自动部署
- 通常在中国可访问
- 简单易用

---

## 方案 3：阿里云 OSS（最佳性能）

### ⏱️ 15 分钟部署

```bash
# 1. 注册阿里云账号
访问 https://www.aliyun.com

# 2. 开通 OSS 服务
产品 → 对象存储 OSS

# 3. 创建 Bucket
区域：上海/北京/杭州
权限：公共读

# 4. 上传文件
上传 y-car-website 目录下所有文件

# 5. 配置静态网站
基础设置 → 静态页面 → 默认首页: index.html

# 6. 访问网站
http://your-bucket.oss-cn-shanghai.aliyuncs.com
```

### ✅ 优势
- 延迟最低（~20ms）
- 稳定性最高（99.9%）
- 价格便宜（5-20元/月）
- 可配置 CDN 加速

### 📖 详细指南
[阿里云完整部署指南](./CHINA_ALTERNATIVE_DEPLOYMENT.md)

---

## 📊 方案对比

| 方案 | 速度 | 价格 | 难度 | 推荐度 |
|------|------|------|------|--------|
| Gitee Pages | ⭐⭐⭐⭐ | 免费 | ⭐ | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⭐⭐⭐ | 免费 | ⭐ | ⭐⭐⭐⭐ |
| 阿里云 OSS | ⭐⭐⭐⭐⭐ | 5-20元/月 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 如何选择？

### 选择 Gitee Pages 如果：
- ✅ 需要免费方案
- ✅ 想要最简单的部署
- ✅ 主要用户在中国

### 选择 GitHub Pages 如果：
- ✅ 需要免费方案
- ✅ 需要自动部署
- ✅ 用户在中国和国际都有

### 选择阿里云 OSS 如果：
- ✅ 需要最佳性能
- ✅ 是生产环境
- ✅ 有小额预算（5-20元/月）

---

## 💡 推荐流程

```
1. 先试 Gitee Pages（5分钟，免费）
   ↓
2. 如果满意，继续使用
   ↓
3. 如果需要更好性能，升级到阿里云
```

---

## 📚 完整文档

- 📖 [Gitee Pages 详细指南](./GITEE_PAGES_GUIDE.md)
- 📖 [阿里云部署指南](./CHINA_ALTERNATIVE_DEPLOYMENT.md)
- 📖 [所有方案对比](./DEPLOYMENT_OPTIONS.md)

---

## 🆘 需要帮助？

### 常见问题

**Q: 为什么 Vercel 在中国无法访问？**
A: Vercel 没有中国大陆的服务器节点，且可能受到网络限制。

**Q: 哪个方案最适合我？**
A: 
- 个人项目 → Gitee Pages
- 生产环境 → 阿里云 OSS
- 国际项目 → GitHub Pages

**Q: 需要备案吗？**
A: 
- Gitee/GitHub Pages → 不需要
- 阿里云 + 自定义域名 → 需要

---

## ✅ 立即开始

### 最快方案（Gitee Pages）

1. 访问 https://gitee.com 注册
2. 导入 GitHub 仓库
3. 启用 Gitee Pages
4. 完成！

**预计时间**: 5 分钟  
**费用**: 免费  
**访问速度**: 快

---

**祝部署顺利！** 🎉
