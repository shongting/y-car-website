#!/bin/bash

# Y-car 网站部署验证脚本
# 用于快速检查网站部署状态

echo "🚗 Y-car 网站部署验证工具"
echo "================================"
echo ""

# 检查是否提供了 URL
if [ -z "$1" ]; then
    echo "❌ 错误：请提供网站 URL"
    echo ""
    echo "使用方法："
    echo "  ./check-deployment.sh https://your-site.vercel.app"
    echo ""
    exit 1
fi

SITE_URL="$1"
echo "🔍 正在验证网站: $SITE_URL"
echo ""

# 1. 检查 HTTPS
echo "1️⃣  检查 HTTPS 连接..."
if [[ $SITE_URL == https://* ]]; then
    echo "   ✅ 使用 HTTPS 连接"
else
    echo "   ⚠️  警告：未使用 HTTPS 连接"
fi
echo ""

# 2. 检查网站可访问性
echo "2️⃣  检查网站可访问性..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ 网站可访问 (HTTP $HTTP_CODE)"
else
    echo "   ❌ 网站无法访问 (HTTP $HTTP_CODE)"
fi
echo ""

# 3. 检查响应时间
echo "3️⃣  检查响应时间..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$SITE_URL")
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
if (( $(echo "$RESPONSE_TIME < 3" | bc -l) )); then
    echo "   ✅ 响应时间: ${RESPONSE_TIME}s (< 3秒)"
else
    echo "   ⚠️  响应时间: ${RESPONSE_TIME}s (> 3秒)"
fi
echo ""

# 4. 检查内容类型
echo "4️⃣  检查内容类型..."
CONTENT_TYPE=$(curl -s -I "$SITE_URL" | grep -i "content-type" | cut -d' ' -f2-)
if [[ $CONTENT_TYPE == *"text/html"* ]]; then
    echo "   ✅ 内容类型正确: $CONTENT_TYPE"
else
    echo "   ⚠️  内容类型: $CONTENT_TYPE"
fi
echo ""

# 5. 检查页面大小
echo "5️⃣  检查页面大小..."
PAGE_SIZE=$(curl -s "$SITE_URL" | wc -c)
PAGE_SIZE_KB=$(echo "scale=2; $PAGE_SIZE / 1024" | bc)
echo "   📊 页面大小: ${PAGE_SIZE_KB} KB"
echo ""

# 6. 检查关键内容
echo "6️⃣  检查关键内容..."
PAGE_CONTENT=$(curl -s "$SITE_URL")

if [[ $PAGE_CONTENT == *"Y-car"* ]]; then
    echo "   ✅ 包含品牌名称"
else
    echo "   ❌ 缺少品牌名称"
fi

if [[ $PAGE_CONTENT == *"新能源"* ]]; then
    echo "   ✅ 包含关键词"
else
    echo "   ⚠️  缺少关键词"
fi

if [[ $PAGE_CONTENT == *"script.js"* ]]; then
    echo "   ✅ JavaScript 文件已引用"
else
    echo "   ❌ JavaScript 文件未引用"
fi

if [[ $PAGE_CONTENT == *"styles.css"* ]]; then
    echo "   ✅ CSS 文件已引用"
else
    echo "   ❌ CSS 文件未引用"
fi
echo ""

# 总结
echo "================================"
echo "✨ 验证完成！"
echo ""
echo "📋 下一步操作："
echo "   1. 在浏览器中打开: $SITE_URL"
echo "   2. 测试桌面端显示"
echo "   3. 测试移动端显示（使用开发者工具）"
echo "   4. 测试所有交互功能"
echo "   5. 填写 DEPLOYMENT_VERIFICATION.md"
echo ""
echo "🔧 详细验证工具："
echo "   - 打开 deployment-test.html 进行自动化测试"
echo "   - 查看 DEPLOYMENT_VERIFICATION.md 了解完整清单"
echo ""
