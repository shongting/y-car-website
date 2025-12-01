/**
 * Y-car 网站部署验证脚本
 * 
 * 此脚本用于自动验证部署后的网站功能
 * 使用方法：node verify-deployment.js <部署URL>
 */

const https = require('https');
const http = require('http');

// 从命令行参数获取部署 URL
const deploymentUrl = process.argv[2];

if (!deploymentUrl) {
  console.error('❌ 错误：请提供部署 URL');
  console.log('使用方法：node verify-deployment.js <部署URL>');
  console.log('示例：node verify-deployment.js https://y-car-website.vercel.app');
  process.exit(1);
}

console.log('🚀 开始验证部署...');
console.log(`📍 目标 URL: ${deploymentUrl}\n`);

// 验证结果收集
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// 添加结果
function addResult(type, message) {
  results[type].push(message);
}

// 验证 HTTPS
function verifyHttps(url) {
  return new Promise((resolve) => {
    if (!url.startsWith('https://')) {
      addResult('failed', 'HTTPS 连接：URL 不是 HTTPS 协议');
      resolve(false);
      return;
    }
    addResult('passed', 'HTTPS 连接：URL 使用 HTTPS 协议');
    resolve(true);
  });
}

// 验证网站可访问性
function verifyAccessibility(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    protocol.get(url, (res) => {
      const loadTime = Date.now() - startTime;
      
      if (res.statusCode === 200) {
        addResult('passed', `网站可访问：HTTP 状态码 ${res.statusCode}`);
        
        if (loadTime < 3000) {
          addResult('passed', `加载时间：${loadTime}ms (< 3秒，符合需求 5.2)`);
        } else {
          addResult('warnings', `加载时间：${loadTime}ms (> 3秒，不符合需求 5.2)`);
        }
        
        // 检查响应头
        if (res.headers['content-type']?.includes('text/html')) {
          addResult('passed', 'Content-Type：正确返回 HTML 内容');
        } else {
          addResult('warnings', `Content-Type：${res.headers['content-type']}`);
        }
        
        // 收集响应内容
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          verifyHtmlContent(data);
          resolve(true);
        });
      } else {
        addResult('failed', `网站访问失败：HTTP 状态码 ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      addResult('failed', `网站访问失败：${err.message}`);
      resolve(false);
    });
  });
}

// 验证 HTML 内容
function verifyHtmlContent(html) {
  // 检查必要的页面元素
  const checks = [
    { pattern: /<header/i, name: 'Header 组件' },
    { pattern: /Y-Car/i, name: '品牌名称' },
    { pattern: /<nav/i, name: '导航栏' },
    { pattern: /续航|里程/i, name: '车型信息（续航）' },
    { pattern: /价格|万元/i, name: '车型信息（价格）' },
    { pattern: /<form/i, name: '联系表单' },
    { pattern: /姓名|name/i, name: '表单字段（姓名）' },
    { pattern: /电话|phone/i, name: '表单字段（电话）' },
    { pattern: /邮箱|email/i, name: '表单字段（邮箱）' },
    { pattern: /<footer/i, name: 'Footer 组件' },
    { pattern: /环保|经济|性能/i, name: '新能源优势展示' },
    { pattern: /<meta.*viewport/i, name: '响应式 meta 标签' },
    { pattern: /charset.*utf-8/i, name: 'UTF-8 字符编码' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(html)) {
      addResult('passed', `HTML 内容：包含 ${check.name}`);
    } else {
      addResult('warnings', `HTML 内容：未找到 ${check.name}`);
    }
  });
  
  // 检查图片
  const imgMatches = html.match(/<img[^>]+>/gi);
  if (imgMatches && imgMatches.length > 0) {
    addResult('passed', `图片元素：找到 ${imgMatches.length} 个图片标签`);
    
    // 检查 alt 属性
    const imgsWithAlt = imgMatches.filter(img => /alt=/i.test(img));
    if (imgsWithAlt.length === imgMatches.length) {
      addResult('passed', '可访问性：所有图片都有 alt 属性');
    } else {
      addResult('warnings', `可访问性：${imgMatches.length - imgsWithAlt.length} 个图片缺少 alt 属性`);
    }
  } else {
    addResult('warnings', 'HTML 内容：未找到图片元素');
  }
  
  // 检查 CSS 和 JS 引用
  if (/<link[^>]+stylesheet/i.test(html)) {
    addResult('passed', '资源引用：包含 CSS 样式表');
  } else {
    addResult('warnings', '资源引用：未找到 CSS 样式表引用');
  }
  
  if (/<script[^>]+src/i.test(html) || /<script>[\s\S]*<\/script>/i.test(html)) {
    addResult('passed', '资源引用：包含 JavaScript 脚本');
  } else {
    addResult('warnings', '资源引用：未找到 JavaScript 脚本');
  }
}

// 打印验证报告
function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 验证报告');
  console.log('='.repeat(60) + '\n');
  
  if (results.passed.length > 0) {
    console.log('✅ 通过的检查项 (' + results.passed.length + ')：');
    results.passed.forEach(msg => console.log('  ✓ ' + msg));
    console.log();
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  警告 (' + results.warnings.length + ')：');
    results.warnings.forEach(msg => console.log('  ⚠ ' + msg));
    console.log();
  }
  
  if (results.failed.length > 0) {
    console.log('❌ 失败的检查项 (' + results.failed.length + ')：');
    results.failed.forEach(msg => console.log('  ✗ ' + msg));
    console.log();
  }
  
  console.log('='.repeat(60));
  console.log('📈 总结');
  console.log('='.repeat(60));
  console.log(`✅ 通过：${results.passed.length} 项`);
  console.log(`⚠️  警告：${results.warnings.length} 项`);
  console.log(`❌ 失败：${results.failed.length} 项`);
  console.log();
  
  if (results.failed.length === 0) {
    console.log('🎉 所有关键检查项都已通过！');
    console.log('✨ 网站部署验证成功！');
  } else {
    console.log('⚠️  存在失败的检查项，请检查部署配置。');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📝 手动验证清单');
  console.log('='.repeat(60));
  console.log('请在浏览器中手动验证以下项目：');
  console.log('  □ 桌面端布局（宽度 > 768px）');
  console.log('  □ 移动端布局（宽度 < 768px）');
  console.log('  □ 图片点击放大功能');
  console.log('  □ 表单验证和提交');
  console.log('  □ 交互动画效果');
  console.log('  □ LocalStorage 数据持久化');
  console.log('  □ 使用 Chrome DevTools Lighthouse 进行性能测试');
  console.log();
}

// 主验证流程
async function main() {
  try {
    await verifyHttps(deploymentUrl);
    await verifyAccessibility(deploymentUrl);
    printReport();
    
    // 退出码
    process.exit(results.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ 验证过程中发生错误：', error.message);
    process.exit(1);
  }
}

main();
