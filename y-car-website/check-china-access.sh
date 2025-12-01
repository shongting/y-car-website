#!/bin/bash

# Y-car 网站中国访问检查脚本
# 用于验证网站是否针对中国访问进行了优化

echo "🌏 Y-car 网站中国访问检查"
echo "================================"
echo ""

# 检查是否提供了 URL
if [ -z "$1" ]; then
    echo "❌ 错误：请提供部署 URL"
    echo "使用方法：./check-china-access.sh <部署URL>"
    echo "示例：./check-china-access.sh https://y-car-website.vercel.app"
    exit 1
fi

DEPLOYMENT_URL=$1

echo "📍 检查 URL: $DEPLOYMENT_URL"
echo ""

# 1. 检查 HTTPS
echo "1️⃣ 检查 HTTPS 连接..."
if [[ $DEPLOYMENT_URL == https://* ]]; then
    echo "   ✅ 使用 HTTPS 协议"
else
    echo "   ❌ 未使用 HTTPS 协议"
fi
echo ""

# 2. 检查响应时间
echo "2️⃣ 检查响应时间..."
if command -v curl &> /dev/null; then
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' $DEPLOYMENT_URL)
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
    echo "   响应时间: ${RESPONSE_TIME_MS%.*} ms"
    
    if (( $(echo "$RESPONSE_TIME < 3" | bc -l) )); then
        echo "   ✅ 响应时间 < 3 秒（符合需求）"
    else
        echo "   ⚠️  响应时间 > 3 秒（需要优化）"
    fi
else
    echo "   ⚠️  未安装 curl，跳过响应时间检查"
fi
echo ""

# 3. 检查服务器区域
echo "3️⃣ 检查服务器区域..."
if command -v curl &> /dev/null; then
    VERCEL_ID=$(curl -s -I $DEPLOYMENT_URL | grep -i "x-vercel-id" | cut -d: -f2 | tr -d ' \r')
    
    if [[ -n "$VERCEL_ID" ]]; then
        echo "   Vercel ID: $VERCEL_ID"
        
        if [[ $VERCEL_ID == *"hkg1"* ]]; then
            echo "   ✅ 部署在香港区域（最佳）"
        elif [[ $VERCEL_ID == *"sin1"* ]]; then
            echo "   ✅ 部署在新加坡区域（良好）"
        elif [[ $VERCEL_ID == *"nrt1"* ]]; then
            echo "   ⚠️  部署在东京区域（可接受）"
        else
            echo "   ⚠️  部署在其他区域（建议改为香港或新加坡）"
        fi
    else
        echo "   ⚠️  无法检测 Vercel 区域"
    fi
else
    echo "   ⚠️  未安装 curl，跳过区域检查"
fi
echo ""

# 4. 检查 DNS 解析
echo "4️⃣ 检查 DNS 解析..."
DOMAIN=$(echo $DEPLOYMENT_URL | sed -e 's|^[^/]*//||' -e 's|/.*$||')
if command -v dig &> /dev/null; then
    DNS_TIME=$(dig $DOMAIN | grep "Query time:" | awk '{print $4}')
    if [[ -n "$DNS_TIME" ]]; then
        echo "   DNS 解析时间: $DNS_TIME ms"
        if [ "$DNS_TIME" -lt 100 ]; then
            echo "   ✅ DNS 解析快速"
        else
            echo "   ⚠️  DNS 解析较慢，建议使用国内 DNS"
        fi
    fi
else
    echo "   ⚠️  未安装 dig，跳过 DNS 检查"
fi
echo ""

# 5. 检查缓存配置
echo "5️⃣ 检查缓存配置..."
if command -v curl &> /dev/null; then
    CACHE_CONTROL=$(curl -s -I $DEPLOYMENT_URL | grep -i "cache-control" | cut -d: -f2 | tr -d ' \r')
    
    if [[ -n "$CACHE_CONTROL" ]]; then
        echo "   Cache-Control: $CACHE_CONTROL"
        if [[ $CACHE_CONTROL == *"max-age"* ]]; then
            echo "   ✅ 已配置缓存策略"
        else
            echo "   ⚠️  未配置缓存策略"
        fi
    else
        echo "   ⚠️  无法检测缓存配置"
    fi
else
    echo "   ⚠️  未安装 curl，跳过缓存检查"
fi
echo ""

# 6. 检查内容类型
echo "6️⃣ 检查内容类型..."
if command -v curl &> /dev/null; then
    CONTENT_TYPE=$(curl -s -I $DEPLOYMENT_URL | grep -i "content-type" | cut -d: -f2 | tr -d ' \r')
    
    if [[ $CONTENT_TYPE == *"text/html"* ]]; then
        echo "   ✅ 正确返回 HTML 内容"
    else
        echo "   ⚠️  内容类型: $CONTENT_TYPE"
    fi
else
    echo "   ⚠️  未安装 curl，跳过内容类型检查"
fi
echo ""

# 7. 网络延迟测试
echo "7️⃣ 网络延迟测试..."
if command -v ping &> /dev/null; then
    echo "   正在 ping $DOMAIN (3 次)..."
    PING_RESULT=$(ping -c 3 $DOMAIN 2>&1)
    
    if [[ $PING_RESULT == *"time="* ]]; then
        AVG_TIME=$(echo "$PING_RESULT" | tail -1 | awk -F '/' '{print $5}')
        echo "   平均延迟: $AVG_TIME ms"
        
        if (( $(echo "$AVG_TIME < 100" | bc -l) )); then
            echo "   ✅ 延迟优秀（< 100ms）"
        elif (( $(echo "$AVG_TIME < 200" | bc -l) )); then
            echo "   ⚠️  延迟良好（100-200ms）"
        else
            echo "   ⚠️  延迟较高（> 200ms），建议优化"
        fi
    else
        echo "   ⚠️  无法 ping 服务器"
    fi
else
    echo "   ⚠️  未安装 ping，跳过延迟测试"
fi
echo ""

# 总结
echo "================================"
echo "📊 检查完成"
echo "================================"
echo ""
echo "💡 优化建议："
echo ""
echo "1. 确保 vercel.json 配置了香港和新加坡区域："
echo "   \"regions\": [\"hkg1\", \"sin1\"]"
echo ""
echo "2. 使用国内 CDN 加速图片和静态资源"
echo ""
echo "3. 考虑使用自定义域名 + 国内 DNS"
echo ""
echo "4. 参考完整优化指南："
echo "   y-car-website/CHINA_DEPLOYMENT_GUIDE.md"
echo ""
echo "5. 运行完整验证："
echo "   node y-car-website/verify-deployment.js $DEPLOYMENT_URL"
echo ""
