# 用户身份验证系统

一个安全的用户身份验证系统，具有登录、注销和密码重置功能。

## 功能

- 用户登录和注销
- 基于令牌的会话管理
- 密码重置功能
- 速率限制防止暴力攻击
- 安全的密码哈希
- 审计日志记录

## 项目结构

```
src/
├── models/          # 数据模型
├── services/        # 业务逻辑服务
├── repositories/    # 数据访问层
├── api/            # API 端点
└── errors/         # 自定义错误类
```

## 安装

```bash
npm install
```

## 构建

```bash
npm run build
```

## 测试

```bash
npm test
```

## 开发

```bash
npm run test:watch
```
