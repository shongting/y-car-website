# Node.js v14.21.3 和 PM2 安装手册

## 目录
- [系统要求](#系统要求)
- [Node.js v14.21.3 手动安装](#nodejs-v14213-手动安装)
  - [macOS 安装](#macos-安装)
  - [Linux 安装](#linux-安装)
  - [Windows 安装](#windows-安装)
- [PM2 安装](#pm2-安装)
- [验证安装](#验证安装)
- [常见问题](#常见问题)

---

## 系统要求

- **操作系统**: macOS, Linux (Ubuntu/CentOS/Debian), Windows 10+
- **磁盘空间**: 至少 500MB 可用空间
- **权限**: 管理员或 sudo 权限（Linux/macOS）

---

## Node.js v14.21.3 手动安装

### macOS 安装

#### 方法一：使用官方安装包

1. **下载 Node.js v14.21.3**
   ```bash
   curl -O https://nodejs.org/dist/v14.21.3/node-v14.21.3-darwin-x64.tar.gz
   ```

2. **解压安装包**
   ```bash
   tar -xzf node-v14.21.3-darwin-x64.tar.gz
   ```

3. **移动到系统目录**
   ```bash
   sudo mv node-v14.21.3-darwin-x64 /usr/local/node-v14.21.3
   ```

4. **创建软链接**
   ```bash
   sudo ln -s /usr/local/node-v14.21.3/bin/node /usr/local/bin/node
   sudo ln -s /usr/local/node-v14.21.3/bin/npm /usr/local/bin/npm
   sudo ln -s /usr/local/node-v14.21.3/bin/npx /usr/local/bin/npx
   ```

5. **配置环境变量（可选）**
   
   编辑 `~/.zshrc` 或 `~/.bash_profile`:
   ```bash
   export PATH="/usr/local/node-v14.21.3/bin:$PATH"
   ```
   
   使配置生效:
   ```bash
   source ~/.zshrc  # 如果使用 zsh
   # 或
   source ~/.bash_profile  # 如果使用 bash
   ```

#### 方法二：使用 Homebrew（推荐）

```bash
# 安装特定版本
brew install node@14

# 链接到系统
brew link node@14 --force --overwrite

# 添加到 PATH
echo 'export PATH="/usr/local/opt/node@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### Linux 安装

#### Ubuntu/Debian 系统

1. **下载 Node.js v14.21.3**
   ```bash
   cd /tmp
   wget https://nodejs.org/dist/v14.21.3/node-v14.21.3-linux-x64.tar.xz
   ```

2. **解压安装包**
   ```bash
   tar -xJf node-v14.21.3-linux-x64.tar.xz
   ```

3. **移动到系统目录**
   ```bash
   sudo mv node-v14.21.3-linux-x64 /usr/local/node-v14.21.3
   ```

4. **创建软链接**
   ```bash
   sudo ln -s /usr/local/node-v14.21.3/bin/node /usr/bin/node
   sudo ln -s /usr/local/node-v14.21.3/bin/npm /usr/bin/npm
   sudo ln -s /usr/local/node-v14.21.3/bin/npx /usr/bin/npx
   ```

5. **配置环境变量**
   
   编辑 `~/.bashrc`:
   ```bash
   echo 'export PATH="/usr/local/node-v14.21.3/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

#### CentOS/RHEL 系统

1. **下载并解压**
   ```bash
   cd /tmp
   wget https://nodejs.org/dist/v14.21.3/node-v14.21.3-linux-x64.tar.xz
   tar -xJf node-v14.21.3-linux-x64.tar.xz
   ```

2. **移动到系统目录**
   ```bash
   sudo mv node-v14.21.3-linux-x64 /usr/local/node-v14.21.3
   ```

3. **创建软链接**
   ```bash
   sudo ln -s /usr/local/node-v14.21.3/bin/node /usr/bin/node
   sudo ln -s /usr/local/node-v14.21.3/bin/npm /usr/bin/npm
   sudo ln -s /usr/local/node-v14.21.3/bin/npx /usr/bin/npx
   ```

4. **配置环境变量**
   ```bash
   echo 'export PATH="/usr/local/node-v14.21.3/bin:$PATH"' >> ~/.bash_profile
   source ~/.bash_profile
   ```

---

### Windows 安装

1. **下载安装包**
   
   访问: https://nodejs.org/dist/v14.21.3/
   
   下载: `node-v14.21.3-x64.msi` (64位) 或 `node-v14.21.3-x86.msi` (32位)

2. **运行安装程序**
   - 双击下载的 `.msi` 文件
   - 点击 "Next" 继续
   - 接受许可协议
   - 选择安装路径（默认: `C:\Program Files\nodejs`）
   - 确保勾选 "Add to PATH" 选项
   - 点击 "Install" 开始安装

3. **验证安装**
   
   打开命令提示符（CMD）或 PowerShell:
   ```cmd
   node --version
   npm --version
   ```

#### 手动安装（ZIP 方式）

1. **下载 ZIP 包**
   ```
   https://nodejs.org/dist/v14.21.3/node-v14.21.3-win-x64.zip
   ```

2. **解压到目标目录**
   
   例如: `C:\Program Files\nodejs-14.21.3`

3. **配置环境变量**
   - 右键 "此电脑" → "属性" → "高级系统设置"
   - 点击 "环境变量"
   - 在 "系统变量" 中找到 "Path"
   - 点击 "编辑" → "新建"
   - 添加: `C:\Program Files\nodejs-14.21.3`
   - 点击 "确定" 保存

---

## PM2 安装

PM2 是一个 Node.js 进程管理器，用于保持应用程序持续运行。

### 全局安装 PM2

安装完 Node.js 后，使用 npm 安装 PM2:

```bash
npm install -g pm2
```

### 验证 PM2 安装

```bash
pm2 --version
```

### 配置 PM2 开机自启（Linux/macOS）

1. **生成启动脚本**
   ```bash
   pm2 startup
   ```

2. **按照提示执行命令**
   
   系统会显示一条需要执行的命令，复制并执行它。例如:
   ```bash
   sudo env PATH=$PATH:/usr/local/node-v14.21.3/bin pm2 startup systemd -u your_username --hp /home/your_username
   ```

3. **保存当前进程列表**
   ```bash
   pm2 save
   ```

### 配置 PM2 开机自启（Windows）

1. **安装 pm2-windows-startup**
   ```cmd
   npm install -g pm2-windows-startup
   ```

2. **配置自启动**
   ```cmd
   pm2-startup install
   ```

3. **保存进程列表**
   ```cmd
   pm2 save
   ```

---

## 验证安装

### 检查 Node.js 版本

```bash
node --version
# 应该输出: v14.21.3
```

### 检查 npm 版本

```bash
npm --version
# 应该输出: 6.x.x
```

### 检查 PM2 版本

```bash
pm2 --version
# 应该输出: 5.x.x
```

### 测试 Node.js

创建测试文件 `test.js`:

```javascript
console.log('Node.js v14.21.3 安装成功！');
console.log('Node 版本:', process.version);
```

运行测试:

```bash
node test.js
```

### 测试 PM2

使用 PM2 运行测试文件:

```bash
pm2 start test.js --name "test-app"
pm2 list
pm2 logs test-app
pm2 stop test-app
pm2 delete test-app
```

---

## 常见问题

### 1. 权限错误

**问题**: `EACCES: permission denied`

**解决方案** (Linux/macOS):
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### 2. 命令未找到

**问题**: `command not found: node` 或 `command not found: pm2`

**解决方案**:
- 检查环境变量配置
- 重新加载配置文件: `source ~/.bashrc` 或 `source ~/.zshrc`
- 重启终端

### 3. 多版本 Node.js 管理

如果需要管理多个 Node.js 版本，建议使用版本管理工具:

- **nvm** (Node Version Manager) - Linux/macOS
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  nvm install 14.21.3
  nvm use 14.21.3
  ```

- **nvm-windows** - Windows
  
  下载: https://github.com/coreybutler/nvm-windows/releases

### 4. PM2 无法启动应用

**检查日志**:
```bash
pm2 logs
pm2 logs <app-name>
```

**重启 PM2**:
```bash
pm2 kill
pm2 resurrect
```

### 5. 更新 npm

如果需要更新 npm 到最新版本:

```bash
npm install -g npm@latest
```

---

## PM2 常用命令

```bash
# 启动应用
pm2 start app.js
pm2 start app.js --name "my-app"

# 查看所有进程
pm2 list

# 查看日志
pm2 logs
pm2 logs <app-name>

# 停止应用
pm2 stop <app-name>
pm2 stop all

# 重启应用
pm2 restart <app-name>
pm2 restart all

# 删除应用
pm2 delete <app-name>
pm2 delete all

# 监控
pm2 monit

# 查看详细信息
pm2 show <app-name>

# 保存当前进程列表
pm2 save

# 恢复保存的进程列表
pm2 resurrect
```

---

## 卸载说明

### 卸载 Node.js

**macOS/Linux**:
```bash
sudo rm -rf /usr/local/node-v14.21.3
sudo rm /usr/local/bin/node
sudo rm /usr/local/bin/npm
sudo rm /usr/local/bin/npx
```

**Windows**:
- 通过控制面板卸载
- 或删除安装目录并清理环境变量

### 卸载 PM2

```bash
pm2 kill
npm uninstall -g pm2
```

---

## 总结

现在你已经成功安装了 Node.js v14.21.3 和 PM2。你可以开始开发和部署 Node.js 应用程序了。

如有任何问题，请参考:
- Node.js 官方文档: https://nodejs.org/docs/
- PM2 官方文档: https://pm2.keymetrics.io/docs/
