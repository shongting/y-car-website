@echo off
REM Y-car 网站中国访问检查脚本 (Windows 版本)
REM 用于验证网站是否针对中国访问进行了优化

echo 🌏 Y-car 网站中国访问检查
echo ================================
echo.

REM 检查是否提供了 URL
if "%~1"=="" (
    echo ❌ 错误：请提供部署 URL
    echo 使用方法：check-china-access.bat ^<部署URL^>
    echo 示例：check-china-access.bat https://y-car-website.vercel.app
    exit /b 1
)

set DEPLOYMENT_URL=%~1

echo 📍 检查 URL: %DEPLOYMENT_URL%
echo.

REM 1. 检查 HTTPS
echo 1️⃣ 检查 HTTPS 连接...
echo %DEPLOYMENT_URL% | findstr /i "https://" >nul
if %errorlevel%==0 (
    echo    ✅ 使用 HTTPS 协议
) else (
    echo    ❌ 未使用 HTTPS 协议
)
echo.

REM 2. 检查响应时间
echo 2️⃣ 检查响应时间...
where curl >nul 2>nul
if %errorlevel%==0 (
    echo    正在测试响应时间...
    curl -o nul -s -w "   响应时间: %%{time_total}s\n" %DEPLOYMENT_URL%
    echo    ℹ️  如果响应时间 ^< 3 秒则符合需求
) else (
    echo    ⚠️  未安装 curl，跳过响应时间检查
    echo    提示：可以从 https://curl.se/windows/ 下载 curl
)
echo.

REM 3. 检查服务器区域
echo 3️⃣ 检查服务器区域...
where curl >nul 2>nul
if %errorlevel%==0 (
    echo    正在检查 Vercel 区域...
    curl -s -I %DEPLOYMENT_URL% | findstr /i "x-vercel-id"
    echo    ℹ️  如果包含 hkg1 或 sin1 则为最佳配置
) else (
    echo    ⚠️  未安装 curl，跳过区域检查
)
echo.

REM 4. 检查 DNS 解析
echo 4️⃣ 检查 DNS 解析...
for /f "tokens=2 delims=/" %%a in ("%DEPLOYMENT_URL%") do set DOMAIN=%%a
set DOMAIN=%DOMAIN:~2%
echo    域名: %DOMAIN%
nslookup %DOMAIN% >nul 2>nul
if %errorlevel%==0 (
    echo    ✅ DNS 解析成功
) else (
    echo    ⚠️  DNS 解析失败
)
echo.

REM 5. 检查缓存配置
echo 5️⃣ 检查缓存配置...
where curl >nul 2>nul
if %errorlevel%==0 (
    echo    正在检查缓存策略...
    curl -s -I %DEPLOYMENT_URL% | findstr /i "cache-control"
    echo    ℹ️  应该包含 max-age 配置
) else (
    echo    ⚠️  未安装 curl，跳过缓存检查
)
echo.

REM 6. 检查内容类型
echo 6️⃣ 检查内容类型...
where curl >nul 2>nul
if %errorlevel%==0 (
    curl -s -I %DEPLOYMENT_URL% | findstr /i "content-type"
    echo    ℹ️  应该返回 text/html
) else (
    echo    ⚠️  未安装 curl，跳过内容类型检查
)
echo.

REM 7. 网络延迟测试
echo 7️⃣ 网络延迟测试...
echo    正在 ping %DOMAIN% (4 次)...
ping -n 4 %DOMAIN% | findstr /i "平均"
if %errorlevel%==0 (
    echo    ℹ️  延迟 ^< 100ms 为优秀，^< 200ms 为良好
) else (
    echo    ⚠️  无法获取平均延迟
)
echo.

REM 总结
echo ================================
echo 📊 检查完成
echo ================================
echo.
echo 💡 优化建议：
echo.
echo 1. 确保 vercel.json 配置了香港和新加坡区域：
echo    "regions": ["hkg1", "sin1"]
echo.
echo 2. 使用国内 CDN 加速图片和静态资源
echo.
echo 3. 考虑使用自定义域名 + 国内 DNS
echo.
echo 4. 参考完整优化指南：
echo    y-car-website\CHINA_DEPLOYMENT_GUIDE.md
echo.
echo 5. 运行完整验证：
echo    node y-car-website\verify-deployment.js %DEPLOYMENT_URL%
echo.

pause
