# Y-car 网站部署指南

## 部署到 Vercel

本项目已配置好 Vercel 部署，按照以下步骤即可完成部署：

### 前置条件

1. 拥有 GitHub 账号
2. 拥有 Vercel 账号（可使用 GitHub 账号登录）

### 部署步骤

#### 1. 推送代码到 GitHub

如果还没有创建 GitHub 仓库，请按以下步骤操作：

```bash
# 在 GitHub 上创建新仓库（通过网页操作）
# 然后在本地添加远程仓库
git remote add origin https://github.com/你的用户名/y-car-website.git
git branch -M main
git push -u origin main
```

#### 2. 在 Vercel 中导入项目

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 授权 Vercel 访问你的 GitHub 账号
5. 选择 `y-car-website` 仓库

#### 3. 配置构建设置

Vercel 会自动检测到 `vercel.json` 配置文件，无需手动配置。

默认配置：
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: 无需构建命令（静态网站）
- **Output Directory**: `y-car-website`

#### 4. 部署

点击 "Deploy" 按钮，Vercel 将自动：
- 克隆你的仓库
- 构建项目
- 部署到全球 CDN

部署通常在 1-2 分钟内完成。

#### 5. 获取访问链接

部署完成后，Vercel 会提供：
- **生产环境 URL**: `https://你的项目名.vercel.app`
- **预览 URL**: 每次 Git 推送都会生成新的预览链接

### 自动部署

配置完成后，每次推送到 GitHub 的 `main` 分支都会自动触发部署：

```bash
git add .
git commit -m "更新网站内容"
git push origin main
```

### 自定义域名（可选）

1. 在 Vercel 项目设置中选择 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录
4. Vercel 会自动配置 HTTPS 证书

### 环境变量（如需要）

如果项目需要环境变量：
1. 在 Vercel 项目设置中选择 "Environment Variables"
2. 添加所需的环境变量
3. 重新部署项目

### 性能优化

Vercel 自动提供：
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 自动压缩（Gzip/Brotli）
- ✅ 图片优化
- ✅ 边缘缓存

### 监控和分析

在 Vercel 控制台可以查看：
- 部署历史
- 访问分析
- 性能指标
- 错误日志

## 其他部署选项

### Netlify

1. 访问 [Netlify](https://netlify.com)
2. 点击 "New site from Git"
3. 选择 GitHub 仓库
4. 配置：
   - Build command: 留空
   - Publish directory: `y-car-website`
5. 点击 "Deploy site"

### GitHub Pages

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择分支：`main`
3. 选择目录：`/y-car-website`
4. 保存设置
5. 访问 `https://你的用户名.github.io/仓库名/`

## 故障排除

### 部署失败

- 检查 `vercel.json` 配置是否正确
- 确保所有文件路径正确
- 查看 Vercel 部署日志

### 页面显示异常

- 检查浏览器控制台错误
- 确认所有资源路径正确
- 验证 CSS 和 JS 文件已正确加载

### 图片加载失败

- 确认图片 URL 可访问
- 检查 CORS 设置
- 使用占位符图片作为后备方案

## 联系支持

如有问题，请查看：
- [Vercel 文档](https://vercel.com/docs)
- [GitHub Issues](https://github.com/你的用户名/y-car-website/issues)
