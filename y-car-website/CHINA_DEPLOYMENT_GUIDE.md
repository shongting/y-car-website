# Y-car 网站中国区域部署指南

## 概述

本指南帮助你将 Y-car 网站部署到中国用户可以快速访问的区域。

## 🌏 区域配置

### Vercel 区域选择

我们已经在 `vercel.json` 中配置了最适合中国访问的区域：

```json
{
  "regions": ["hkg1", "sin1"]
}
```

**区域说明**：
- **hkg1**: 香港区域 - 距离中国大陆最近，延迟最低
- **sin1**: 新加坡区域 - 亚太地区备用节点

### 为什么选择这些区域？

1. **香港 (hkg1)** 
   - ✅ 距离中国大陆最近
   - ✅ 网络延迟最低（通常 < 50ms）
   - ✅ 带宽充足
   - ✅ 稳定性高

2. **新加坡 (sin1)**
   - ✅ 亚太地区中心节点
   - ✅ 作为香港的备用
   - ✅ 延迟适中（通常 < 100ms）

## 📋 部署步骤

### 方法 1：通过 Vercel 控制台配置（推荐）

#### 步骤 1：登录 Vercel

访问 [Vercel](https://vercel.com) 并登录你的账号。

#### 步骤 2：导入项目

1. 点击 "New Project"
2. 选择你的 GitHub 仓库
3. 选择 `y-car-website` 项目

#### 步骤 3：配置区域

在项目设置中：

1. 进入项目设置页面
2. 找到 "Functions" 或 "Regions" 设置
3. 选择以下区域：
   - ✅ Hong Kong (hkg1)
   - ✅ Singapore (sin1)

**注意**：Vercel 会自动读取 `vercel.json` 中的区域配置。

#### 步骤 4：部署

点击 "Deploy" 按钮，Vercel 会自动部署到配置的区域。

### 方法 2：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署到指定区域
vercel --prod --regions hkg1,sin1
```

## 🚀 优化配置

### 1. CDN 缓存优化

我们已经在 `vercel.json` 中配置了缓存策略：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

这将确保静态资源被充分缓存，减少加载时间。

### 2. 图片优化

对于中国用户，建议使用国内的图片 CDN：

#### 选项 1：使用国内图片服务

```javascript
// 在 script.js 中修改图片 URL
const imageBaseUrl = 'https://cdn.jsdelivr.net/gh/username/repo@main/images/';
// 或使用其他国内 CDN
```

#### 选项 2：使用占位符图片

项目已经包含了本地占位符图片 `concept-car-placeholder.svg`，确保在图片加载失败时有良好的用户体验。

### 3. 字体优化

如果使用 Google Fonts，建议替换为国内镜像：

```html
<!-- 原始 Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap" rel="stylesheet">

<!-- 替换为国内镜像 -->
<link href="https://fonts.loli.net/css2?family=Noto+Sans+SC&display=swap" rel="stylesheet">
```

## 🔍 验证部署

### 检查部署区域

部署完成后，可以通过以下方式验证：

#### 1. 使用 Vercel CLI

```bash
vercel inspect <deployment-url>
```

#### 2. 检查响应头

```bash
curl -I https://你的域名.vercel.app
```

查看 `x-vercel-id` 响应头，应该包含 `hkg1` 或 `sin1`。

#### 3. 测试延迟

```bash
# 使用 ping 测试
ping 你的域名.vercel.app

# 使用 curl 测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://你的域名.vercel.app
```

创建 `curl-format.txt` 文件：
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

### 预期性能指标

从中国大陆访问：
- **DNS 解析**: < 50ms
- **连接时间**: < 100ms
- **首字节时间 (TTFB)**: < 200ms
- **总加载时间**: < 3 秒（符合需求 5.2）

## 🌐 使用自定义域名（可选）

### 为什么使用自定义域名？

1. ✅ 更好的品牌形象
2. ✅ 更容易记忆
3. ✅ 可以使用国内 DNS 加速
4. ✅ 可以配置 ICP 备案（如需要）

### 配置步骤

#### 1. 在 Vercel 中添加域名

1. 进入项目设置
2. 点击 "Domains"
3. 添加你的域名（如 `www.y-car.com`）

#### 2. 配置 DNS

在你的域名注册商处添加以下记录：

**使用 A 记录**：
```
A    @    76.76.21.21
```

**或使用 CNAME 记录**：
```
CNAME    www    cname.vercel-dns.com
```

#### 3. 使用国内 DNS 服务商

推荐使用以下 DNS 服务商以获得更好的中国访问速度：

- **DNSPod**（腾讯云）
- **阿里云 DNS**
- **Cloudflare**（有中国节点）

### ICP 备案（如需要）

如果你的域名需要在中国大陆使用，可能需要 ICP 备案：

1. 选择云服务商（阿里云、腾讯云等）
2. 提交备案申请
3. 等待审核（通常 7-20 天）
4. 备案完成后配置域名

**注意**：Vercel 本身不提供 ICP 备案服务，你需要通过国内云服务商进行备案。

## 🔧 故障排除

### 问题 1：中国访问速度慢

**解决方案**：

1. 确认区域配置正确：
   ```bash
   vercel inspect <deployment-url>
   ```

2. 检查是否使用了国外的资源（如 Google Fonts）

3. 使用国内 CDN 加速静态资源

4. 考虑使用自定义域名 + 国内 DNS

### 问题 2：图片加载失败

**解决方案**：

1. 使用国内图片 CDN
2. 确保占位符图片正常工作
3. 检查图片 URL 是否可访问

### 问题 3：部署区域不正确

**解决方案**：

1. 检查 `vercel.json` 配置
2. 重新部署：
   ```bash
   vercel --prod --force
   ```

3. 在 Vercel 控制台手动选择区域

## 📊 性能对比

### 不同区域的性能对比（从中国访问）

| 区域 | 延迟 | 首字节时间 | 总加载时间 | 推荐度 |
|------|------|------------|------------|--------|
| 香港 (hkg1) | ~30ms | ~150ms | ~1.5s | ⭐⭐⭐⭐⭐ |
| 新加坡 (sin1) | ~60ms | ~200ms | ~2s | ⭐⭐⭐⭐ |
| 东京 (nrt1) | ~80ms | ~250ms | ~2.5s | ⭐⭐⭐ |
| 美国西部 (sfo1) | ~180ms | ~500ms | ~4s | ⭐⭐ |
| 美国东部 (iad1) | ~220ms | ~600ms | ~5s | ⭐ |

**结论**：香港和新加坡是中国用户的最佳选择。

## 🎯 最佳实践

### 1. 多区域部署

```json
{
  "regions": ["hkg1", "sin1", "nrt1"]
}
```

添加东京作为第三个备用节点。

### 2. 使用 Edge Functions

对于动态内容，使用 Vercel Edge Functions 可以在边缘节点处理请求：

```javascript
// api/hello.js
export const config = {
  runtime: 'edge',
  regions: ['hkg1', 'sin1']
};

export default function handler(request) {
  return new Response('Hello from Edge!');
}
```

### 3. 预加载关键资源

在 HTML 中添加预加载：

```html
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="script.js" as="script">
<link rel="dns-prefetch" href="https://你的CDN域名">
```

### 4. 使用 Service Worker

实现离线缓存，提升重复访问速度：

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
        '/concept-car-placeholder.svg'
      ]);
    })
  );
});
```

## 📱 移动端优化

中国用户主要使用移动设备，确保：

1. ✅ 响应式设计正常工作
2. ✅ 图片大小适中（< 500KB）
3. ✅ 使用懒加载
4. ✅ 减少 JavaScript 体积

## 🔐 安全性

### HTTPS 配置

Vercel 自动提供 HTTPS，但确保：

1. ✅ 所有资源都使用 HTTPS
2. ✅ 无混合内容警告
3. ✅ HSTS 头已配置

### CSP 配置

在 `vercel.json` 中添加内容安全策略：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' https:; script-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

## 📈 监控和分析

### 使用国内分析工具

推荐使用：

1. **百度统计** - https://tongji.baidu.com
2. **友盟** - https://www.umeng.com
3. **神策数据** - https://www.sensorsdata.cn

### 性能监控

```javascript
// 添加性能监控
window.addEventListener('load', () => {
  const perfData = performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('页面加载时间:', pageLoadTime, 'ms');
  
  // 发送到分析服务
  // analytics.track('page_load', { time: pageLoadTime });
});
```

## 🎉 部署检查清单

完成以下检查确保最佳的中国访问体验：

- [ ] ✅ 区域配置为 hkg1 和 sin1
- [ ] ✅ 缓存策略已配置
- [ ] ✅ 图片使用国内 CDN 或本地资源
- [ ] ✅ 字体使用国内镜像
- [ ] ✅ HTTPS 正常工作
- [ ] ✅ 从中国测试访问速度
- [ ] ✅ 移动端显示正常
- [ ] ✅ 性能指标达标（< 3 秒）
- [ ] ✅ 添加了性能监控
- [ ] ✅ 配置了错误追踪

## 🔗 相关资源

- [Vercel 区域文档](https://vercel.com/docs/concepts/edge-network/regions)
- [Vercel 中国访问优化](https://vercel.com/docs/concepts/edge-network/overview)
- [网站性能优化指南](./PERFORMANCE_OPTIMIZATION.md)
- [部署验证指南](./TASK_15_VERIFICATION_GUIDE.md)

## 💡 额外建议

### 考虑使用国内替代方案

如果 Vercel 访问仍然不够理想，可以考虑：

1. **Netlify** - 也有亚太节点
2. **Cloudflare Pages** - 有中国节点
3. **阿里云 OSS + CDN** - 完全国内方案
4. **腾讯云 COS + CDN** - 完全国内方案

### 混合部署方案

```
国际用户 → Vercel (全球 CDN)
中国用户 → 阿里云/腾讯云 (国内 CDN)
```

使用智能 DNS 根据用户地理位置分流。

---

**配置完成后，记得运行验证工具测试中国访问速度！**

```bash
node y-car-website/verify-deployment.js https://你的域名.vercel.app
```
