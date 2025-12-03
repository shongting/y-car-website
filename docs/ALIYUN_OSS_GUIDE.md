# 阿里云 OSS 部署指南

## ⚠️ 重要说明

**阿里云 OSS 不是完全免费的**，但价格非常便宜：

- **存储费用**：0.12 元/GB/月
- **流量费用**：0.5 元/GB（前 10GB 免费）
- **预计月费用**：1-5 元（小型网站）

### 新用户优惠

- 阿里云新用户可能有免费试用额度
- 可能有代金券
- 首月可能有优惠

---

## 📋 部署步骤

### 步骤 1：注册阿里云账号

1. 访问 https://www.aliyun.com
2. 点击"免费注册"
3. 填写信息并完成实名认证
4. 绑定支付方式（支付宝/银行卡）

### 步骤 2：开通 OSS 服务

1. 登录阿里云控制台
2. 搜索"对象存储 OSS"
3. 点击"立即开通"
4. 同意服务协议
5. 开通成功

### 步骤 3：创建 Bucket

1. 进入 OSS 控制台
2. 点击"创建 Bucket"
3. 配置：
   - **Bucket 名称**：`y-car-website`（全局唯一）
   - **区域**：华东1（杭州）或华北2（北京）或华东2（上海）
   - **存储类型**：标准存储
   - **读写权限**：公共读
   - **版本控制**：关闭
   - **服务端加密**：关闭
4. 点击"确定"

### 步骤 4：上传网站文件

#### 方法 A：使用控制台上传（简单）

1. 进入你的 Bucket
2. 点击"文件管理"
3. 点击"上传文件"
4. 选择 `y-car-website` 目录下的所有文件：
   - index.html
   - styles.css
   - script.js
   - concept-car-placeholder.svg
5. 点击"开始上传"

#### 方法 B：使用 ossutil 工具（推荐）

```bash
# 1. 下载 ossutil
# macOS/Linux
wget http://gosspublic.alicdn.com/ossutil/1.7.15/ossutil64
chmod +x ossutil64

# Windows
# 从 https://help.aliyun.com/document_detail/120075.html 下载

# 2. 配置 ossutil
./ossutil64 config
# 输入 Endpoint: oss-cn-shanghai.aliyuncs.com（根据你的区域）
# 输入 AccessKeyId: 你的 AccessKey ID
# 输入 AccessKeySecret: 你的 AccessKey Secret

# 3. 上传文件
cd y-car-website
../ossutil64 cp . oss://y-car-website/ -r
```

### 步骤 5：配置静态网站托管

1. 在 Bucket 管理页面
2. 点击"基础设置"
3. 找到"静态页面"
4. 点击"设置"
5. 配置：
   - **默认首页**：index.html
   - **默认 404 页**：index.html（可选）
6. 点击"保存"

### 步骤 6：访问网站

你的网站地址：
```
http://y-car-website.oss-cn-shanghai.aliyuncs.com
```

（将 `shanghai` 替换为你选择的区域）

---

## 🚀 配置 CDN 加速（可选，推荐）

### 为什么需要 CDN？

- ✅ 更快的访问速度
- ✅ 更低的流量费用
- ✅ 支持 HTTPS
- ✅ 支持自定义域名

### 配置步骤

1. 进入 CDN 控制台
2. 点击"添加域名"
3. 配置：
   - **加速域名**：你的域名（如 www.y-car.com）
   - **业务类型**：图片小文件
   - **源站类型**：OSS 域名
   - **源站域名**：选择你的 Bucket
   - **端口**：80
4. 点击"下一步"
5. 配置 HTTPS（可选）：
   - 上传 SSL 证书
   - 或使用免费证书
6. 完成配置

### 配置 DNS

在你的域名注册商处添加 CNAME 记录：

```
类型: CNAME
主机记录: www
记录值: [CDN 提供的 CNAME 域名]
TTL: 600
```

---

## 💰 费用说明

### 存储费用

- **标准存储**：0.12 元/GB/月
- 示例：1GB 网站 = 0.12 元/月

### 流量费用

- **外网流出流量**：0.5 元/GB
- **CDN 流量**：0.24 元/GB（更便宜）
- 示例：100 次访问（约 100MB）= 0.05 元

### 预计总费用

| 网站大小 | 月访问量 | 月费用 |
|---------|---------|--------|
| 1GB | 1000 次 | 1-2 元 |
| 1GB | 5000 次 | 2-5 元 |
| 1GB | 10000 次 | 5-10 元 |

### 新用户优惠

- 查看阿里云官网的新用户优惠
- 可能有免费试用额度
- 可能有代金券

---

## 🔄 更新网站

### 使用控制台

1. 进入 OSS 控制台
2. 选择你的 Bucket
3. 删除旧文件
4. 上传新文件

### 使用 ossutil

```bash
# 上传更新的文件
cd y-car-website
../ossutil64 cp . oss://y-car-website/ -r -f
```

### 使用脚本自动化

创建 `deploy-to-aliyun.sh`：

```bash
#!/bin/bash

BUCKET_NAME="y-car-website"
REGION="oss-cn-shanghai"

echo "📦 开始部署到阿里云 OSS..."

# 上传文件
cd y-car-website
ossutil64 cp . oss://$BUCKET_NAME/ -r -f

echo "✅ 部署完成！"
echo "🌐 访问地址: http://$BUCKET_NAME.$REGION.aliyuncs.com"
```

使用：
```bash
chmod +x deploy-to-aliyun.sh
./deploy-to-aliyun.sh
```

---

## 🔐 配置 HTTPS

### 使用 CDN 配置 HTTPS

1. 在 CDN 控制台
2. 选择你的域名
3. 点击"HTTPS 配置"
4. 上传 SSL 证书或申请免费证书
5. 开启"强制跳转 HTTPS"

### 免费 SSL 证书

阿里云提供免费的 SSL 证书（DV 证书）：

1. 进入"SSL 证书"控制台
2. 点击"购买证书"
3. 选择"免费证书"
4. 填写域名信息
5. 完成验证
6. 下载证书
7. 在 CDN 中配置

---

## 🎯 最佳实践

### 1. 使用 CDN

- 降低流量费用
- 提升访问速度
- 支持 HTTPS

### 2. 配置缓存

在 CDN 中配置缓存规则：
- HTML 文件：不缓存或短时间缓存
- CSS/JS 文件：长时间缓存
- 图片文件：长时间缓存

### 3. 压缩文件

上传前压缩文件：
```bash
# 压缩 CSS
npx cssnano styles.css styles.min.css

# 压缩 JS
npx terser script.js -o script.min.js
```

### 4. 监控费用

- 在阿里云控制台查看费用
- 设置费用预警
- 定期检查流量使用

---

## 🆚 对比其他方案

| 特性 | 阿里云 OSS | Gitee Pages | GitHub Pages |
|------|-----------|-------------|--------------|
| 费用 | 1-5元/月 | 免费 | 免费 |
| 速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 自动部署 | ❌ | ✅ | ✅ |
| 自定义域名 | ✅ | ✅ | ✅ |
| HTTPS | ✅ | ✅ | ✅ |

---

## 🐛 故障排除

### 问题：文件上传失败

**解决**：
- 检查 AccessKey 配置
- 确认 Bucket 权限
- 检查网络连接

### 问题：网站无法访问

**解决**：
- 确认 Bucket 权限为"公共读"
- 检查静态网站托管配置
- 确认文件已上传

### 问题：费用过高

**解决**：
- 配置 CDN 降低流量费用
- 压缩文件减小大小
- 设置缓存策略

---

## 📞 获取帮助

- **阿里云文档**：https://help.aliyun.com/product/31815.html
- **OSS 定价**：https://www.aliyun.com/price/product#/oss/detail
- **工单支持**：在阿里云控制台提交工单

---

## 💡 建议

### 如果你是新手或预算有限

**推荐使用 Gitee Pages**（完全免费）：
- 查看 [Gitee Pages 部署指南](./GITEE_PAGES_GUIDE.md)
- 或查看 [立即部署指南](./DEPLOY_NOW.md)

### 如果你需要最佳性能

**使用阿里云 OSS + CDN**：
- 按照本指南操作
- 预算：5-20 元/月
- 适合生产环境

---

**祝部署顺利！** 🎉
