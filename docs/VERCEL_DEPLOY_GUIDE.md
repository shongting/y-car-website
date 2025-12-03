# Vercel 部署指南（香港区域）

## ✅ 项目已配置香港区域

你的项目已经配置好了香港和新加坡区域：
- 香港 (hkg1) - 主要区域
- 新加坡 (sin1) - 备用区域

配置文件：`vercel.json`

---

## 🚀 部署步骤（10分钟）

### 步骤 1：准备 GitHub 仓库

#### 如果还没有推送到 GitHub：

```bash
# 1. 在 GitHub 上创建新仓库
# 访问 https://github.com/new
# 仓库名：y-car-website

# 2. 在本地添加远程仓库
git remote add origin https://github.com/你的用户名/y-car-website.git

# 3. 推送代码
git add .
git commit -m "配置 Vercel 部署"
git push -u origin main
```

#### 如果已经有 GitHub 仓库：

```bash
# 确保代码是最新的
git add .
git commit -m "更新配置"
git push origin main
```

---

### 步骤 2：注册/登录 Vercel

1. 访问 https://vercel.com
2. 点击 "Sign Up"（注册）或 "Log In"（登录）
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub

---

### 步骤 3：导入项目

1. 在 Vercel 控制台，点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 找到你的 `y-car-website` 仓库
4. 点击 "Import"

---

### 步骤 4：配置项目

Vercel 会自动检测到 `vercel.json` 配置，你会看到：

#### 项目设置：
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: (留空)
- **Output Directory**: `y-car-website`
- **Install Command**: (留空)

#### 区域设置：
- ✅ **Regions**: Hong Kong (hkg1), Singapore (sin1)
  - 这是从 `vercel.json` 自动读取的

**不需要修改任何设置**，Vercel 会自动使用配置文件。

---

### 步骤 5：部署

1. 确认配置无误
2. 点击 "Deploy" 按钮
3. 等待部署完成（通常 1-2 分钟）

你会看到部署进度：
```
Building...
Deploying...
✓ Deployment Complete
```

---

### 步骤 6：获取访问链接

部署完成后，Vercel 会提供：

**生产环境 URL**：
```
https://y-car-website.vercel.app
```
或
```
https://y-car-website-[hash].vercel.app
```

点击链接访问你的网站！

---

## 🔍 验证部署区域

### 方法 1：使用浏览器

1. 打开你的网站
2. 按 F12 打开开发者工具
3. 切换到 "Network" 标签
4. 刷新页面
5. 查看响应头中的 `x-vercel-id`
6. 应该包含 `hkg1` 或 `sin1`

### 方法 2：使用 curl

```bash
curl -I https://你的域名.vercel.app | grep x-vercel-id
```

应该看到类似：
```
x-vercel-id: hkg1::xxxxx
```

### 方法 3：使用验证脚本

```bash
node y-car-website/verify-deployment.js https://你的域名.vercel.app
```

---

## 🔄 自动部署

配置完成后，每次推送代码到 GitHub 都会自动部署：

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "更新网站内容"

# 3. 推送到 GitHub
git push origin main

# 4. Vercel 自动部署（约 1-2 分钟）
```

你可以在 Vercel 控制台查看部署状态。

---

## 🌐 配置自定义域名（可选）

### 步骤 1：在 Vercel 中添加域名

1. 进入项目设置
2. 点击 "Domains"
3. 输入你的域名（如 `www.y-car.com`）
4. 点击 "Add"

### 步骤 2：配置 DNS

Vercel 会提供 DNS 配置说明，通常是：

**使用 A 记录**：
```
A    @    76.76.21.21
```

**或使用 CNAME 记录**：
```
CNAME    www    cname.vercel-dns.com
```

### 步骤 3：等待生效

DNS 生效通常需要几分钟到 24 小时。

---

## ⚠️ 中国访问说明

### 重要提示

虽然项目配置了香港区域，但 Vercel 在中国的访问情况因地区而异：

- ✅ 某些地区可以访问
- ⚠️ 某些地区访问较慢
- ❌ 某些地区可能无法访问

### 测试访问

部署完成后，请在中国网络环境下测试：

```bash
# 测试访问速度
curl -w "@curl-format.txt" -o /dev/null -s https://你的域名.vercel.app

# 或使用在线工具
# https://www.17ce.com
```

### 如果无法访问

如果在中国无法访问 Vercel，建议使用：

1. **Gitee Pages**（完全免费，100% 可访问）
   - 查看 `DEPLOY_NOW.md`

2. **阿里云 OSS**（1-5元/月，最佳性能）
   - 查看 `ALIYUN_OSS_GUIDE.md`

---

## 📊 Vercel 免费额度

Vercel 免费计划包括：

- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署
- ✅ 预览部署

对于小型网站完全够用！

---

## 🔧 高级配置

### 环境变量

如果需要环境变量：

1. 在 Vercel 项目设置中
2. 点击 "Environment Variables"
3. 添加变量
4. 重新部署

### 构建设置

如果需要修改构建设置：

1. 在项目设置中
2. 点击 "Build & Development Settings"
3. 修改配置
4. 保存

### 重定向规则

在 `vercel.json` 中添加：

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

---

## 🐛 故障排除

### 问题 1：部署失败

**检查**：
- 查看 Vercel 部署日志
- 确认 `vercel.json` 语法正确
- 确认文件路径正确

**解决**：
```bash
# 本地测试配置
vercel --prod --debug
```

### 问题 2：网站显示 404

**检查**：
- 确认 Output Directory 设置为 `y-car-website`
- 确认 `index.html` 在正确位置

**解决**：
- 在项目设置中检查 Root Directory
- 重新部署

### 问题 3：区域不是香港

**检查**：
```bash
curl -I https://你的域名.vercel.app | grep x-vercel-id
```

**解决**：
- 确认 `vercel.json` 中的 regions 配置
- 强制重新部署：
  ```bash
  vercel --prod --force
  ```

### 问题 4：在中国无法访问

**这是正常的**，Vercel 在中国的访问受限。

**解决方案**：
1. 使用 Gitee Pages（免费）
2. 使用阿里云 OSS（1-5元/月）
3. 使用 Cloudflare（可能改善访问）

---

## 📈 监控和分析

### Vercel Analytics

1. 在项目设置中
2. 启用 "Analytics"
3. 查看访问数据：
   - 页面浏览量
   - 访问来源
   - 性能指标

### 自定义分析

添加 Google Analytics 或其他分析工具：

```html
<!-- 在 index.html 中添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## ✅ 部署检查清单

- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 GitHub
- [ ] Vercel 账号已注册
- [ ] 项目已导入到 Vercel
- [ ] 配置已确认（使用 vercel.json）
- [ ] 部署已完成
- [ ] 网站可以访问
- [ ] 区域已验证（hkg1 或 sin1）
- [ ] 从中国测试访问（如适用）
- [ ] 所有功能正常工作

---

## 🎯 快速命令参考

```bash
# 推送代码到 GitHub
git add .
git commit -m "部署到 Vercel"
git push origin main

# 验证部署
curl -I https://你的域名.vercel.app | grep x-vercel-id

# 使用验证脚本
node y-car-website/verify-deployment.js https://你的域名.vercel.app

# 测试中国访问
./y-car-website/check-china-access.sh https://你的域名.vercel.app
```

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Vercel 支持**: https://vercel.com/support
- **社区论坛**: https://github.com/vercel/vercel/discussions

---

## 💡 总结

### Vercel 优势
- ✅ 完全免费
- ✅ 自动部署
- ✅ 全球 CDN
- ✅ 配置简单

### Vercel 限制
- ⚠️ 在中国访问可能受限
- ⚠️ 免费版有带宽限制（100GB/月）

### 建议

1. **先部署到 Vercel** - 看看是否可以访问
2. **测试中国访问** - 在实际网络环境测试
3. **如果无法访问** - 使用 Gitee Pages 或阿里云

---

**现在就开始部署吧！** 🚀

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 点击 Deploy
4. 完成！
