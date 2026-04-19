// 移动端适配测试脚本
// 在浏览器控制台中运行此脚本测试优化效果

function testMobileOptimization() {
  console.log('🔍 开始移动端适配测试...\n');
  
  // 测试1: 检查触摸目标尺寸
  console.log('📱 测试1: 触摸目标尺寸检查');
  const buttons = document.querySelectorAll('button, [role="button"], .btn');
  let buttonPass = 0;
  let buttonFail = 0;
  
  buttons.forEach((btn, index) => {
    const rect = btn.getBoundingClientRect();
    const minSize = 44;
    const isLargeEnough = rect.width >= minSize && rect.height >= minSize;
    
    if (isLargeEnough) {
      buttonPass++;
    } else {
      buttonFail++;
      console.warn(`  按钮 #${index}: ${rect.width}×${rect.height}px (小于${minSize}px)`);
    }
  });
  
  console.log(`  ✅ 通过: ${buttonPass}, ❌ 失败: ${buttonFail}\n`);
  
  // 测试2: 检查输入框尺寸
  console.log('⌨️ 测试2: 输入框尺寸检查');
  const inputs = document.querySelectorAll('input, textarea');
  let inputPass = 0;
  let inputFail = 0;
  
  inputs.forEach((input, index) => {
    const rect = input.getBoundingClientRect();
    const minHeight = 48;
    const isTallEnough = rect.height >= minHeight;
    
    if (isTallEnough) {
      inputPass++;
    } else {
      inputFail++;
      console.warn(`  输入框 #${index}: 高度${rect.height}px (小于${minHeight}px)`);
    }
  });
  
  console.log(`  ✅ 通过: ${inputPass}, ❌ 失败: ${inputFail}\n`);
  
  // 测试3: 检查字体大小
  console.log('🔤 测试3: 移动端字体大小检查');
  const isMobile = window.innerWidth <= 768;
  const texts = document.querySelectorAll('body *');
  let fontPass = 0;
  let fontFail = 0;
  
  if (isMobile) {
    texts.forEach((element, index) => {
      const fontSize = parseInt(window.getComputedStyle(element).fontSize);
      if (fontSize < 14 && element.textContent.trim().length > 0) {
        fontFail++;
        console.warn(`  元素 #${index}: 字体${fontSize}px (移动端建议≥14px)`);
      } else if (fontSize >= 14) {
        fontPass++;
      }
    });
  } else {
    console.log('  ℹ️ 当前不是移动端尺寸，跳过字体测试');
  }
  
  console.log(`  ✅ 通过: ${fontPass}, ❌ 失败: ${fontFail}\n`);
  
  // 测试4: 检查布局适应性
  console.log('📐 测试4: 布局适应性检查');
  const container = document.querySelector('[style*="maxWidth: 1160"]');
  const viewportWidth = window.innerWidth;
  
  if (container) {
    const containerWidth = container.getBoundingClientRect().width;
    const isResponsive = containerWidth <= viewportWidth;
    
    if (isResponsive) {
      console.log(`  ✅ 容器宽度${containerWidth}px ≤ 视口宽度${viewportWidth}px`);
    } else {
      console.warn(`  ❌ 容器宽度${containerWidth}px > 视口宽度${viewportWidth}px`);
    }
  } else {
    console.log('  ℹ️ 未找到主容器');
  }
  
  console.log('\n📊 测试总结:');
  console.log(`  屏幕尺寸: ${window.innerWidth}×${window.innerHeight}px`);
  console.log(`  设备类型: ${isMobile ? '移动端' : '桌面端'}`);
  console.log(`  总测试项: 4`);
  console.log(`  建议改进: ${buttonFail + inputFail + fontFail} 项`);
  
  // 生成改进建议
  if (buttonFail > 0) {
    console.log('\n💡 改进建议:');
    console.log('  1. 增大按钮尺寸至至少44×44px');
  }
  if (inputFail > 0) {
    console.log('  2. 增大输入框高度至至少48px');
  }
  if (fontFail > 0) {
    console.log('  3. 增大移动端字体大小至至少14px');
  }
  
  return {
    totalTests: 4,
    passed: buttonPass + inputPass + fontPass,
    failed: buttonFail + inputFail + fontFail,
    isMobile: isMobile,
    viewport: `${window.innerWidth}×${window.innerHeight}`
  };
}

// 自动运行测试
if (typeof window !== 'undefined') {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(testMobileOptimization, 1000);
    });
  } else {
    setTimeout(testMobileOptimization, 1000);
  }
}

module.exports = { testMobileOptimization };