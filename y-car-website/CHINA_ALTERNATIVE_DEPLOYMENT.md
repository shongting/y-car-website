# 中国大陆部署替代方案

## ⚠️ 重要说明

**Vercel 没有中国大陆节点**，如果网站在中国无法访问，建议使用以下国内替代方案。

## 🇨🇳 推荐方案：国内云服务商

### 方案 1：阿里云 OSS + CDN（最推荐）

#### 优势
- ✅ 完全在中国大陆部署
- ✅ 访问速度最快
- ✅ 稳定性最高
- ✅ 价格便宜（每月几元）
- ✅ 支持 HTTPS
- ✅ 有 ICP 备案支持

#### 部署步骤

**1. 开通阿里云 OSS**

访问 https://www.aliyun.com/product/oss

```bash
# 创建 Bucket
# 区域选择：华东1（杭州）或华北2（北京）或华东2（上海）
# 读写权限：公共读
# 版本控制：关闭
```

**2. 上传网站文件**

```bash
# 安装阿里云 CLI
npm install -g @alicloud/cli

# 配置凭证
aliyun configure

# 上传文件
cd y-car-website
aliyun oss cp index.html oss://your-bucket-name/
aliyun oss cp styles.css oss://your-bucket-name/
aliyun oss cp script.js oss://your-bucket-name/
aliyun oss cp concept-car-placeholder.svg oss://your-bucket-name/
```

或使用阿里云控制台手动上传。

**3. 配置静态网站托管**

在 OSS 控制台：
1. 选择 Bucket
2. 基础设置 → 静态页面
3. 默认首页：index.html
4. 默认 404 页：index.html

**4. 开通 CDN 加速**

1. 进入 CDN 控制台
2. 添加域名
3. 源站类型：OSS 域名
4. 选择你的 Bucket
5. 配置 HTTPS（免费证书）

**5. 配置自定义域名**

1. 在域名注册商添加 CNAME 记录
2. 指向 CDN 提供的域名
3. 等待生效（通常几分钟）

#### 价格参考

- OSS 存储：0.12 元/GB/月
- CDN 流量：0.24 元/GB（中国大陆）
- 预计月费用：5-20 元（小型网站）

### 方案 2：腾讯云 COS + CDN

#### 优势
- ✅ 与阿里云类似
- ✅ 价格相近
- ✅ 操作简单
- ✅ 稳定可靠

#### 部署步骤

**1. 开通腾讯云 COS**

访问 https://cloud.tencent.com/product/cos

**2. 创建存储桶**

```bash
# 区域：广州/上海/北京
# 访问权限：公有读私有写
```

**3. 上传文件**

使用 COSBrowser 工具或控制台上传所有网站文件。

**4. 配置静态网站**

1. 基础配置 → 静态网站
2. 索引文档：index.html
3. 错误文档：index.html

**5. 配置 CDN**

1. 内容分发网络 → 域名管理
2. 添加域名
3. 源站类型：COS 源
4. 选择存储桶
5. 配置 HTTPS

#### 价格参考

- COS 存储：0.118 元/GB/月
- CDN 流量：0.21 元/GB
- 预计月费用：5-20 元

### 方案 3：Cloudflare Pages（部分可用）

#### 优势
- ✅ 免费
- ✅ 有中国节点（部分地区）
- ✅ 自动部署
- ✅ 支持 Git 集成

#### 限制
- ⚠️ 在某些地区可能仍然受限
- ⚠️ 速度不如国内云服务商

#### 部署步骤

**1. 注册 Cloudflare**

访问 https://pages.cloudflare.com

**2. 连接 GitHub**

1. 创建新项目
2. 连接 GitHub 仓库
3. 选择 y-car-website 项目

**3. 配置构建**

```
Build command: (留空)
Build output directory: y-car-website
Root directory: /
```

**4. 部署**

点击 "Save and Deploy"

**5. 配置自定义域名**

1. 添加域名
2. 配置 DNS
3. 启用 HTTPS

### 方案 4：GitHub Pages + jsDelivr CDN

#### 优势
- ✅ 完全免费
- ✅ jsDelivr 在中国有节点
- ✅ 简单易用

#### 部署步骤

**1. 启用 GitHub Pages**

在 GitHub 仓库设置中：
1. Settings → Pages
2. Source: main 分支
3. Folder: /y-car-website
4. Save

**2. 使用 jsDelivr 加速**

修改资源引用：

```html
<!-- 原始 -->
<link rel="stylesheet" href="styles.css">

<!-- 使用 jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/username/repo@main/y-car-website/styles.css">
```

**3. 访问网站**

```
https://username.github.io/repo-name/
```

## 📊 方案对比

| 方案 | 速度 | 稳定性 | 价格 | 难度 | 推荐度 |
|------|------|--------|------|------|--------|
| 阿里云 OSS + CDN | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 5-20元/月 | 中 | ⭐⭐⭐⭐⭐ |
| 腾讯云 COS + CDN | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 5-20元/月 | 中 | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | ⭐⭐⭐ | ⭐⭐⭐ | 免费 | 易 | ⭐⭐⭐ |
| GitHub Pages + jsDelivr | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | 易 | ⭐⭐⭐⭐ |
| Vercel (香港) | ⭐⭐ | ⭐⭐ | 免费 | 易 | ⭐⭐ |

## 🎯 推荐选择

### 如果需要最佳性能和稳定性
→ **阿里云 OSS + CDN** 或 **腾讯云 COS + CDN**

### 如果需要免费方案
→ **GitHub Pages + jsDelivr CDN**

### 如果需要快速部署
→ **Cloudflare Pages**（但可能在某些地区受限）

## 🔧 阿里云快速部署脚本

创建 `deploy-to-aliyun.sh`：

```bash
#!/bin/bash

# 阿里云 OSS 部署脚本
BUCKET_NAME="your-bucket-name"
REGION="oss-cn-shanghai"

echo "📦 开始部署到阿里云 OSS..."

# 上传文件
ossutil cp y-car-website/index.html oss://$BUCKET_NAME/ -r -f
ossutil cp y-car-website/styles.css oss://$BUCKET_NAME/ -r -f
ossutil cp y-car-website/script.js oss://$BUCKET_NAME/ -r -f
ossutil cp y-car-website/concept-car-placeholder.svg oss://$BUCKET_NAME/ -r -f

echo "✅ 部署完成！"
echo "🌐 访问地址: http://$BUCKET_NAME.$REGION.aliyuncs.com"
```

## 🔧 腾讯云快速部署脚本

创建 `deploy-to-tencent.sh`：

```bash
#!/bin/bash

# 腾讯云 COS 部署脚本
BUCKET_NAME="your-bucket-name"
REGION="ap-shanghai"

echo "📦 开始部署到腾讯云 COS..."

# 上传文件
coscmd upload -r y-car-website/ /

echo "✅ 部署完成！"
echo "🌐 访问地址: https://$BUCKET_NAME.cos.$REGION.myqcloud.com"
```

## 📝 ICP 备案说明

如果使用自定义域名，需要进行 ICP 备案：

### 备案要求
- 域名已注册
- 有中国大陆的云服务器或 CDN
- 提供个人或企业资料

### 备案流程
1. 在云服务商控制台提交备案申请
2. 填写网站信息和主体信息
3. 上传身份证明材料
4. 等待初审（1-2 个工作日）
5. 拍照核验或视频核验
6. 等待管局审核（7-20 个工作日）
7. 备案完成，获得备案号

### 备案期间
- 网站可以使用云服务商提供的临时域名访问
- 备案完成后才能使用自定义域名

## 🚀 快速开始（推荐：GitHub Pages + jsDelivr）

这是最简单的免费方案：

### 1. 启用 GitHub Pages

```bash
# 在 GitHub 仓库设置中启用 Pages
# Settings → Pages → Source: main → Folder: /y-car-website
```

### 2. 等待部署（约 1 分钟）

### 3. 访问网站

```
https://你的用户名.github.io/仓库名/
```

### 4. 测试访问速度

```bash
curl -w "@curl-format.txt" -o /dev/null -s https://你的用户名.github.io/仓库名/
```

## 💡 临时解决方案

如果急需让网站可访问，可以：

### 1. 使用 GitHub Pages
最快的免费方案，通常在中国可以访问。

### 2. 使用 Gitee Pages
Gitee（码云）是中国的 Git 托管平台：
- 访问 https://gitee.com
- 导入 GitHub 仓库
- 启用 Gitee Pages
- 完全在中国大陆，速度最快

## 📞 获取帮助

- **阿里云文档**: https://help.aliyun.com/product/31815.html
- **腾讯云文档**: https://cloud.tencent.com/document/product/436
- **Cloudflare 文档**: https://developers.cloudflare.com/pages/

---

**建议：如果网站主要面向中国用户，强烈推荐使用阿里云或腾讯云。**
