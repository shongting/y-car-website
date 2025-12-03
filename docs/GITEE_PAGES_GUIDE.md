# Gitee Pages 快速部署指南

## 🚀 最简单的中国部署方案

Gitee（码云）是中国的 Git 托管平台，Gitee Pages 在中国大陆访问速度快且完全免费。

## ✅ 优势

- ✅ **完全免费**
- ✅ **在中国大陆**，访问速度快
- ✅ **5 分钟部署**
- ✅ **自动部署**（推送代码自动更新）
- ✅ **支持自定义域名**
- ✅ **100% 在中国可访问**

## 📋 部署步骤

### 步骤 1：注册 Gitee 账号

1. 访问 https://gitee.com
2. 点击"注册"
3. 填写信息并完成注册
4. 验证邮箱

### 步骤 2：从 GitHub 导入仓库

#### 方法 A：直接导入（推荐）

1. 登录 Gitee
2. 点击右上角 "+" → "从 GitHub/GitLab 导入仓库"
3. 授权 Gitee 访问你的 GitHub
4. 选择 `y-car-website` 仓库
5. 点击"导入"
6. 等待导入完成（通常 1-2 分钟）

#### 方法 B：手动推送

```bash
# 1. 在 Gitee 创建新仓库
# 仓库名：y-car-website

# 2. 添加 Gitee 远程仓库
git remote add gitee https://gitee.com/你的用户名/y-car-website.git

# 3. 推送代码
git push gitee main
```

### 步骤 3：启用 Gitee Pages

1. 进入你的 Gitee 仓库
2. 点击"服务" → "Gitee Pages"
3. 配置 Pages：
   - **部署分支**：main
   - **部署目录**：y-car-website
   - **强制使用 HTTPS**：勾选
4. 点击"启动"按钮
5. 等待部署完成（约 30 秒）

### 步骤 4：访问网站

部署完成后，你会看到访问地址：

```
https://你的用户名.gitee.io/y-car-website/
```

点击链接即可访问你的网站！

## 🔄 自动更新

### 设置自动部署

每次推送代码后，需要手动更新 Gitee Pages：

1. 进入仓库
2. 服务 → Gitee Pages
3. 点击"更新"按钮

**注意**：Gitee Pages 免费版需要手动更新，付费版支持自动部署。

### 同步 GitHub 和 Gitee

```bash
# 方法 1：同时推送到两个平台
git push origin main      # 推送到 GitHub
git push gitee main       # 推送到 Gitee

# 方法 2：创建脚本自动推送
# 创建 deploy-both.sh
```

创建 `deploy-both.sh`：

```bash
#!/bin/bash

echo "📦 开始部署到 GitHub 和 Gitee..."

# 推送到 GitHub
echo "推送到 GitHub..."
git push origin main

# 推送到 Gitee
echo "推送到 Gitee..."
git push gitee main

echo "✅ 部署完成！"
echo ""
echo "GitHub Pages: https://你的用户名.github.io/y-car-website/"
echo "Gitee Pages: https://你的用户名.gitee.io/y-car-website/"
echo ""
echo "⚠️  记得在 Gitee 中手动更新 Pages"
```

使用：

```bash
chmod +x deploy-both.sh
./deploy-both.sh
```

## 🌐 配置自定义域名

### 步骤 1：准备域名

确保你有一个已注册的域名。

### 步骤 2：在 Gitee Pages 中添加域名

1. 进入 Gitee Pages 设置
2. 在"自定义域名"中输入你的域名
3. 点击"保存"

### 步骤 3：配置 DNS

在你的域名注册商处添加 CNAME 记录：

```
类型: CNAME
主机记录: www（或 @）
记录值: 你的用户名.gitee.io
TTL: 600
```

### 步骤 4：等待生效

DNS 生效通常需要 10 分钟到 24 小时。

## 📊 性能测试

部署完成后，测试访问速度：

```bash
# 使用 curl 测试
curl -w "@curl-format.txt" -o /dev/null -s https://你的用户名.gitee.io/y-car-website/

# 或使用在线工具
# https://www.17ce.com
```

预期性能（从中国访问）：
- **延迟**: 20-50ms
- **加载时间**: < 2 秒
- **稳定性**: 99%+

## 🔧 故障排除

### 问题 1：Pages 启动失败

**原因**：
- 部署目录配置错误
- 分支选择错误
- 文件结构问题

**解决**：
1. 确认部署目录为 `y-car-website`
2. 确认分支为 `main`
3. 确认 `y-car-website` 目录下有 `index.html`

### 问题 2：页面显示 404

**原因**：
- 路径配置错误
- 文件未正确上传

**解决**：
1. 检查访问 URL 是否正确
2. 确认文件已推送到 Gitee
3. 尝试重新部署

### 问题 3：样式或脚本加载失败

**原因**：
- 资源路径错误
- 相对路径问题

**解决**：

检查 `index.html` 中的资源路径：

```html
<!-- 确保使用相对路径 -->
<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>

<!-- 而不是绝对路径 -->
<!-- <link rel="stylesheet" href="/styles.css"> -->
```

### 问题 4：更新后网站没有变化

**原因**：
- 忘记点击"更新"按钮
- 浏览器缓存

**解决**：
1. 在 Gitee Pages 设置中点击"更新"
2. 清除浏览器缓存（Ctrl+Shift+R）

## 💡 最佳实践

### 1. 使用 GitHub + Gitee 双平台

```bash
# 同时维护两个平台
git remote add origin https://github.com/用户名/y-car-website.git
git remote add gitee https://gitee.com/用户名/y-car-website.git

# 推送到两个平台
git push origin main
git push gitee main
```

**优势**：
- GitHub：国际用户访问
- Gitee：中国用户访问

### 2. 自动化部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

# 提交代码
git add .
git commit -m "$1"

# 推送到 GitHub
git push origin main

# 推送到 Gitee
git push gitee main

echo "✅ 代码已推送到 GitHub 和 Gitee"
echo "⚠️  请在 Gitee 中手动更新 Pages"
```

使用：

```bash
./deploy.sh "更新网站内容"
```

### 3. 配置 .gitignore

确保不提交不必要的文件：

```
# .gitignore
node_modules/
.DS_Store
*.log
.env
```

## 📈 升级到 Gitee Pages Pro

如果需要更多功能，可以升级到 Gitee Pages Pro：

**Pro 版功能**：
- ✅ 自动部署（推送代码自动更新）
- ✅ 更快的构建速度
- ✅ 更大的存储空间
- ✅ 技术支持

**价格**：约 99 元/年

## 🆚 Gitee Pages vs GitHub Pages

| 特性 | Gitee Pages | GitHub Pages |
|------|-------------|--------------|
| 中国访问速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 国际访问速度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 自动部署 | ❌（免费版） | ✅ |
| 自定义域名 | ✅ | ✅ |
| HTTPS | ✅ | ✅ |
| 价格 | 免费 | 免费 |
| 稳定性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 推荐使用场景

### 适合使用 Gitee Pages

- ✅ 网站主要面向中国用户
- ✅ 需要快速部署
- ✅ 预算有限（免费）
- ✅ 不需要自动部署

### 不适合使用 Gitee Pages

- ❌ 网站主要面向国际用户
- ❌ 需要自动部署（除非付费）
- ❌ 需要高级功能

## 📞 获取帮助

- **Gitee 帮助中心**: https://gitee.com/help
- **Gitee Pages 文档**: https://gitee.com/help/articles/4136
- **Gitee 社区**: https://gitee.com/explore

## ✅ 完成检查清单

部署完成后，检查以下项目：

- [ ] Gitee 账号已注册
- [ ] 仓库已从 GitHub 导入
- [ ] Gitee Pages 已启动
- [ ] 网站可以访问
- [ ] 所有页面元素正常显示
- [ ] 桌面端显示正常
- [ ] 移动端显示正常
- [ ] 所有功能正常工作
- [ ] 从中国测试访问速度

## 🎉 总结

Gitee Pages 是部署到中国最简单的方案：

1. **5 分钟部署** - 从注册到上线
2. **完全免费** - 无需任何费用
3. **速度快** - 在中国大陆访问
4. **100% 可访问** - 无访问限制

**立即开始**：访问 https://gitee.com 注册账号！

---

**下一步**：部署完成后，使用验证工具测试网站性能。
