@echo off
REM Y-car 本地预览启动脚本 (Windows)

echo 🚗 Y-car 网站本地预览
echo ================================
echo.

REM 检查当前目录
if not exist "index.html" (
    echo ❌ 错误：请在 y-car-website 目录中运行此脚本
    echo 使用方法：cd y-car-website 然后双击 start-local.bat
    pause
    exit /b 1
)

echo 选择启动方式：
echo.
echo 1. Python 3 服务器（推荐）
echo 2. Python 2 服务器
echo 3. Node.js http-server
echo 4. 直接在浏览器中打开
echo.
set /p choice="请选择 (1-4): "

if "%choice%"=="1" goto python3
if "%choice%"=="2" goto python2
if "%choice%"=="3" goto nodejs
if "%choice%"=="4" goto browser
goto invalid

:python3
echo.
echo 🚀 启动 Python 3 服务器...
echo 📍 访问地址: http://localhost:8000
echo ⏹️  停止服务器: 按 Ctrl+C
echo.
python -m http.server 8000
goto end

:python2
echo.
echo 🚀 启动 Python 2 服务器...
echo 📍 访问地址: http://localhost:8000
echo ⏹️  停止服务器: 按 Ctrl+C
echo.
python -m SimpleHTTPServer 8000
goto end

:nodejs
REM 检查是否安装了 http-server
where http-server >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  http-server 未安装
    echo 正在安装...
    npm install -g http-server
)
echo.
echo 🚀 启动 Node.js 服务器...
echo 📍 访问地址: http://localhost:8000
echo ⏹️  停止服务器: 按 Ctrl+C
echo.
http-server -p 8000
goto end

:browser
echo.
echo 🌐 在浏览器中打开...
start index.html
echo ✅ 完成！
pause
goto end

:invalid
echo ❌ 无效选择
pause
exit /b 1

:end
