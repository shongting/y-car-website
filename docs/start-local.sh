#!/bin/bash

# Y-car 本地预览启动脚本

echo "🚗 Y-car 网站本地预览"
echo "================================"
echo ""

# 检查当前目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误：请在 y-car-website 目录中运行此脚本"
    echo "使用方法：cd y-car-website && ./start-local.sh"
    exit 1
fi

echo "选择启动方式："
echo ""
echo "1. Python 3 服务器（推荐）"
echo "2. Python 2 服务器"
echo "3. Node.js http-server"
echo "4. 直接在浏览器中打开"
echo ""
read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动 Python 3 服务器..."
        echo "📍 访问地址: http://localhost:8000"
        echo "⏹️  停止服务器: 按 Ctrl+C"
        echo ""
        python3 -m http.server 8000
        ;;
    2)
        echo ""
        echo "🚀 启动 Python 2 服务器..."
        echo "📍 访问地址: http://localhost:8000"
        echo "⏹️  停止服务器: 按 Ctrl+C"
        echo ""
        python -m SimpleHTTPServer 8000
        ;;
    3)
        # 检查是否安装了 http-server
        if ! command -v http-server &> /dev/null; then
            echo ""
            echo "⚠️  http-server 未安装"
            echo "正在安装..."
            npm install -g http-server
        fi
        echo ""
        echo "🚀 启动 Node.js 服务器..."
        echo "📍 访问地址: http://localhost:8000"
        echo "⏹️  停止服务器: 按 Ctrl+C"
        echo ""
        http-server -p 8000
        ;;
    4)
        echo ""
        echo "🌐 在浏览器中打开..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            open index.html
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            xdg-open index.html
        else
            echo "请手动打开 index.html 文件"
        fi
        echo "✅ 完成！"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
