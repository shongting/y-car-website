#!/bin/bash

# Vercel 快速部署脚本

echo "🚀 Y-car 网站 Vercel 部署"
echo "================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "vercel.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Git 状态
if [ -d ".git" ]; then
    echo "✅ Git 仓库已初始化"
else
    echo "⚠️  Git 仓库未初始化"
    read -p "是否初始化 Git 仓库？(y/n): " init_git
    if [ "$init_git" = "y" ]; then
        git init
        echo "✅ Git 仓库已初始化"
    else
        echo "❌ 需要 Git 仓库才能部署到 Vercel"
        exit 1
    fi
fi

# 检查是否有远程仓库
if git remote | grep -q "origin"; then
    echo "✅ GitHub 远程仓库已配置"
    REMOTE_URL=$(git remote get-url origin)
    echo "   远程仓库: $REMOTE_URL"
else
    echo "⚠️  未配置 GitHub 远程仓库"
    echo ""
    echo "请先在 GitHub 创建仓库，然后运行："
    echo "git remote add origin https://github.com/你的用户名/y-car-website.git"
    echo ""
    read -p "是否现在配置？(y/n): " config_remote
    if [ "$config_remote" = "y" ]; then
        read -p "请输入 GitHub 仓库 URL: " repo_url
        git remote add origin "$repo_url"
        echo "✅ 远程仓库已配置"
    else
        echo "❌ 需要配置远程仓库才能部署"
        exit 1
    fi
fi

# 提交代码
echo ""
echo "📦 准备提交代码..."
git add .

read -p "请输入提交信息 (默认: 部署到 Vercel): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="部署到 Vercel"
fi

git commit -m "$commit_msg"

# 推送到 GitHub
echo ""
echo "📤 推送代码到 GitHub..."
git push origin main || git push origin master

if [ $? -eq 0 ]; then
    echo "✅ 代码已推送到 GitHub"
else
    echo "❌ 推送失败，请检查错误信息"
    exit 1
fi

# 提示下一步
echo ""
echo "================================"
echo "✅ 代码已准备好部署！"
echo "================================"
echo ""
echo "下一步："
echo ""
echo "1. 访问 https://vercel.com"
echo "2. 使用 GitHub 账号登录"
echo "3. 点击 'Add New...' → 'Project'"
echo "4. 选择你的 y-car-website 仓库"
echo "5. 点击 'Import'"
echo "6. 确认配置（Vercel 会自动读取 vercel.json）"
echo "7. 点击 'Deploy'"
echo "8. 等待部署完成（约 1-2 分钟）"
echo ""
echo "部署完成后，你会获得一个 URL："
echo "https://y-car-website.vercel.app"
echo ""
echo "================================"
echo "📖 详细指南"
echo "================================"
echo ""
echo "查看完整部署指南："
echo "cat y-car-website/VERCEL_DEPLOY_GUIDE.md"
echo ""
echo "验证部署："
echo "node y-car-website/verify-deployment.js <你的URL>"
echo ""
