# 🚀 快速本地预览

## 最简单的方法（3种选择）

### 方法 1：使用启动脚本（推荐）

#### macOS/Linux:
```bash
cd y-car-website
./start-local.sh
```

#### Windows:
```bash
cd y-car-website
start-local.bat
```

然后选择启动方式，脚本会自动帮你启动服务器。

---

### 方法 2：一键命令

#### 使用 Python（最简单，无需安装）

```bash
# 进入目录
cd y-car-website

# 启动服务器
python3 -m http.server 8000

# 在浏览器中访问
# http://localhost:8000
```

**停止服务器**：按 `Ctrl + C`

---

### 方法 3：直接打开（最快）

#### macOS:
```bash
open y-car-website/index.html
```

#### Windows:
```bash
start y-car-website\index.html
```

#### Linux:
```bash
xdg-open y-car-website/index.html
```

或者直接双击 `y-car-website/index.html` 文件。

---

## 📱 测试移动端

1. 启动本地服务器（使用上述任一方法）
2. 在浏览器中按 `F12` 打开开发者工具
3. 按 `Ctrl+Shift+M` (Windows) 或 `Cmd+Shift+M` (Mac)
4. 选择设备（iPhone, iPad, Samsung 等）
5. 测试响应式布局

---

## ✅ 验证清单

打开网站后，快速检查：

- [ ] 页面正常显示
- [ ] 至少显示 3 款车型
- [ ] 图片正常加载
- [ ] 点击"立即咨询"显示表单
- [ ] 表单可以填写和提交
- [ ] 移动端布局正常（使用开发者工具测试）

---

## 🐛 遇到问题？

### 图片不显示
- 确认在 `y-car-website` 目录中运行
- 检查 `concept-car-placeholder.svg` 文件是否存在

### Python 命令不存在
- 尝试 `python` 而不是 `python3`
- 或安装 Python: https://www.python.org/downloads/

### 端口被占用
- 更改端口号：`python3 -m http.server 3000`
- 然后访问 `http://localhost:3000`

---

## 📖 详细指南

查看完整的本地预览指南：
```bash
cat y-car-website/LOCAL_PREVIEW_GUIDE.md
```

---

**现在就试试吧！** 🎉

最快方式：
```bash
cd y-car-website && python3 -m http.server 8000
```

然后在浏览器中打开：`http://localhost:8000`
