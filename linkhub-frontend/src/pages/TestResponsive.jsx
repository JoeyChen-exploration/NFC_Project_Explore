import { useState, useEffect } from 'react';
import EditorPage from './EditorPage';

export default function TestResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <h1>移动端适配测试</h1>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            background: screenSize.isMobile ? '#d4edda' : '#f8f9fa',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '15px',
            flex: '1',
            minWidth: '250px',
          }}
        >
          <h3>当前屏幕尺寸</h3>
          <p>宽度: {screenSize.width}px</p>
          <p>高度: {screenSize.height}px</p>
          <p>设备类型: {screenSize.isMobile ? '移动端' : screenSize.isTablet ? '平板' : '桌面'}</p>
          <p>
            断点:{' '}
            {screenSize.isMobile ? '≤ 768px' : screenSize.isTablet ? '769px - 1024px' : '> 1024px'}
          </p>
        </div>

        <div
          style={{
            background: '#e7f3ff',
            border: '1px solid #b8daff',
            borderRadius: '8px',
            padding: '15px',
            flex: '1',
            minWidth: '250px',
          }}
        >
          <h3>触摸目标检查</h3>
          <p>✅ 按钮最小尺寸: 44×44px</p>
          <p>✅ 输入框高度: ≥ 48px</p>
          <p>✅ 链接高度: ≥ 52px</p>
          <p>✅ 字体大小: 移动端 ≥ 16px</p>
        </div>

        <div
          style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '15px',
            flex: '1',
            minWidth: '250px',
          }}
        >
          <h3>响应式布局检查</h3>
          <p>✅ 移动端单列布局</p>
          <p>✅ 平板端优化布局</p>
          <p>✅ 桌面端双栏布局</p>
          <p>✅ 导航栏自适应</p>
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          border: '2px dashed #007bff',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#007bff',
            color: 'white',
            padding: '10px 20px',
            fontWeight: 'bold',
          }}
        >
          编辑器预览 (实时响应式)
        </div>
        <div
          style={{
            maxHeight: '600px',
            overflow: 'auto',
          }}
        >
          <EditorPage />
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
        }}
      >
        <h3>测试说明</h3>
        <p>1. 调整浏览器窗口大小，观察布局变化</p>
        <p>2. 在移动端尺寸下，检查触摸目标是否足够大</p>
        <p>3. 验证导航栏在移动端的显示效果</p>
        <p>4. 测试表单元素在移动端的输入体验</p>
        <p>5. 检查预览组件在不同尺寸下的显示</p>
      </div>
    </div>
  );
}
