# 本地预览网站指南

## 🖥️ 方法 1：直接在浏览器中打开（最简单）

### 步骤：

1. **找到 index.html 文件**
   ```bash
   cd y-car-website
   ```

2. **在浏览器中打开**
   
   **macOS**:
   ```bash
   open index.html
   ```
   
   **Windows**:
   ```bash
   start index.html
   ```
   
   **Linux**:
   ```bash
   xdg-open index.html
   ```
   
   或者直接双击 `y-car-website/index.html` 文件

3. **查看网站**
   
   浏览器会自动打开，显示网站内容。

### ✅ 优点
- 最简单，无需安装任何工具
- 立即可用

### ⚠️ 限制
- 某些功能可能受限（如 LocalStorage 在某些浏览器中）
- 文件路径显示为 `file:///...`

---

## 🌐 方法 2：使用 Python 简单服务器（推荐）

### 步骤：

1. **进入网站目录**
   ```bash
   cd y-car-website
   ```

2. **启动服务器**
   
   **Python 3**（推荐）:
   ```bash
   python3 -m http.server 8000
   ```
   
   **Python 2**:
   ```bash
   python -m SimpleHTTPServer 8000
   ```

3. **在浏览器中访问**
   ```
   http://localhost:8000
   ```

4. **停止服务器**
   按 `Ctrl + C`

### ✅ 优点
- 完整的 HTTP 服务器环境
- 所有功能正常工作
- 可以测试 LocalStorage 等功能

### 📝 说明
- 端口 8000 可以改为其他端口（如 3000, 5000）
- 服务器会在终端显示访问日志

---

## 🚀 方法 3：使用 Node.js 服务器

### 步骤：

1. **安装 http-server**（只需一次）
   ```bash
   npm install -g http-server
   ```

2. **进入网站目录**
   ```bash
   cd y-car-website
   ```

3. **启动服务器**
   ```bash
   http-server -p 8000
   ```
   
   或使用默认端口 8080：
   ```bash
   http-server
   ```

4. **在浏览器中访问**
   ```
   http://localhost:8000
   ```

5. **停止服务器**
   按 `Ctrl + C`

### ✅ 优点
- 功能强大
- 支持 CORS
- 自动刷新（使用 -c-1 参数）

---

## 🔧 方法 4：使用 VS Code Live Server

### 步骤：

1. **安装 Live Server 扩展**
   - 在 VS Code 中打开扩展面板（Ctrl+Shift+X）
   - 搜索 "Live Server"
   - 点击安装

2. **打开 index.html**
   - 在 VS Code 中打开 `y-car-website/index.html`

3. **启动 Live Server**
   - 右键点击 index.html
   - 选择 "Open with Live Server"
   
   或者点击右下角的 "Go Live" 按钮

4. **查看网站**
   - 浏览器会自动打开 `http://localhost:5500`

### ✅ 优点
- 自动刷新（修改代码后自动更新）
- 集成在 VS Code 中
- 开发体验最好

---

## 📱 测试移动端显示

### 使用浏览器开发者工具

1. **打开网站**（使用上述任一方法）

2. **打开开发者工具**
   - Chrome/Edge: 按 `F12` 或 `Ctrl+Shift+I`
   - Firefox: 按 `F12`
   - Safari: `Cmd+Option+I`

3. **切换到设备模拟模式**
   - 点击设备工具栏图标（手机/平板图标）
   - 或按 `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)

4. **选择设备**
   - iPhone 12 Pro
   - Samsung Galaxy S20
   - iPad
   - 或自定义尺寸

5. **测试响应式布局**
   - 检查布局是否切换为单列
   - 测试所有功能
   - 验证触摸交互

---

## ✅ 验证清单

在本地预览时，请检查以下项目：

### 页面结构
- [ ] Header 导航栏显示正常
- [ ] Hero 区域显示正常
- [ ] 车型卡片显示正常（至少3款）
- [ ] 新能源优势区块显示正常
- [ ] 联系表单显示正常
- [ ] Footer 显示正常

### 车型信息
- [ ] 每个车型显示名称
- [ ] 每个车型显示图片
- [ ] 每个车型显示续航里程
- [ ] 每个车型显示价格区间
- [ ] 每个车型显示核心特点

### 交互功能
- [ ] 点击"立即咨询"显示表单
- [ ] 表单验证正常工作
- [ ] 表单可以提交
- [ ] 提交后显示成功消息
- [ ] 提交后表单被清空
- [ ] 图片可以点击放大
- [ ] 模态框可以关闭
- [ ] 平滑滚动正常工作

### 响应式布局
- [ ] 桌面端（>768px）显示多列布局
- [ ] 移动端（<768px）显示单列布局
- [ ] 所有元素在小屏幕上可见
- [ ] 无横向滚动条

### 样式和动画
- [ ] 按钮悬停效果正常
- [ ] 卡片悬停效果正常
- [ ] 页面滚动动画流畅
- [ ] 所有过渡动画平滑

### 数据持久化
- [ ] 表单数据保存到 LocalStorage
- [ ] 刷新页面后数据仍然存在
- [ ] 可以在开发者工具中查看数据

---

## 🔍 查看 LocalStorage 数据

### Chrome/Edge/Firefox

1. 打开开发者工具（F12）
2. 切换到 "Application" 或 "Storage" 标签
3. 展开 "Local Storage"
4. 选择你的网站
5. 查看保存的数据

### 清除 LocalStorage

在控制台（Console）中运行：
```javascript
localStorage.clear()
```

---

## 🐛 常见问题

### Q: 图片不显示？

**A**: 检查以下几点：
1. 确认 `concept-car-placeholder.svg` 文件存在
2. 检查图片路径是否正确
3. 查看浏览器控制台是否有错误

### Q: 样式没有加载？

**A**: 
1. 确认 `styles.css` 文件存在
2. 检查 HTML 中的 link 标签路径
3. 清除浏览器缓存（Ctrl+Shift+R）

### Q: JavaScript 不工作？

**A**:
1. 确认 `script.js` 文件存在
2. 打开浏览器控制台查看错误
3. 确认 script 标签在 body 底部

### Q: LocalStorage 不工作？

**A**:
1. 使用 HTTP 服务器而不是直接打开文件
2. 某些浏览器在 file:// 协议下限制 LocalStorage
3. 检查浏览器隐私设置

### Q: 移动端布局不正确？

**A**:
1. 确认 viewport meta 标签存在
2. 检查 CSS 媒体查询（@media）
3. 使用浏览器开发者工具调试

---

## 📊 性能测试

### 使用 Chrome DevTools Lighthouse

1. 打开网站
2. 按 F12 打开开发者工具
3. 切换到 "Lighthouse" 标签
4. 选择类别：
   - Performance
   - Accessibility
   - Best Practices
   - SEO
5. 点击 "Analyze page load"
6. 查看报告和建议

### 目标分数
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🎯 快速命令参考

```bash
# 方法 1：直接打开（macOS）
open y-car-website/index.html

# 方法 2：Python 服务器
cd y-car-website && python3 -m http.server 8000

# 方法 3：Node.js 服务器
cd y-car-website && http-server -p 8000

# 方法 4：使用 npx（无需安装）
cd y-car-website && npx http-server -p 8000
```

---

## 📝 下一步

本地验证完成后：

1. ✅ 确认所有功能正常
2. ✅ 修复发现的问题
3. ✅ 准备部署到线上
4. ✅ 选择部署方案（Gitee Pages / 阿里云 / GitHub Pages）

---

**祝本地预览顺利！** 🎉

如有问题，请查看浏览器控制台的错误信息。
