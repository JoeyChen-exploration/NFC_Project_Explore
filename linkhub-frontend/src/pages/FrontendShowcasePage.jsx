import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessibleButton from '../components/AccessibleButton';
import AccessibleInput from '../components/AccessibleInput';
import ScrollAnimation from '../components/ScrollAnimation';
import PredictiveLoading from '../components/PredictiveLoading';

/**
 * 2026前沿前端技术展示页面
 * 展示最新前端技术和设计趋势
 */
export default function FrontendShowcasePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 模拟API调用
  const simulateApiCall = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 随机成功或失败
        const isSuccess = Math.random() > 0.2;
        if (isSuccess) {
          resolve({ success: true, message: '提交成功！' });
        } else {
          reject(new Error('服务器暂时不可用，请稍后重试。'));
        }
      }, 1500);
    });
  };

  // 处理表单提交
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await simulateApiCall();
      alert('表单提交成功！');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理输入变化
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 技术特性展示
  const features = [
    {
      title: '微动画系统',
      description: '悬停提升、按压缩放、浮动动画等细腻交互反馈',
      icon: '✨',
      animation: 'fadeInUp',
    },
    {
      title: '滚动触发动画',
      description: '元素进入视口时自动触发平滑动画效果',
      icon: '📜',
      animation: 'fadeInLeft',
    },
    {
      title: '预测性加载',
      description: '在用户操作前预加载内容，提供无缝体验',
      icon: '⚡',
      animation: 'fadeInRight',
    },
    {
      title: '可访问性优先',
      description: '符合WCAG 2.1 AA标准，支持屏幕阅读器和键盘导航',
      icon: '♿',
      animation: 'scaleIn',
    },
    {
      title: '金属着色器',
      description: '未来主义金属效果，增强视觉层次感',
      icon: '🔮',
      animation: 'rotateIn',
    },
    {
      title: '新拟态主义',
      description: '触觉设计，创造柔软、交互式UI元素',
      icon: '🎨',
      animation: 'blurIn',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/bento')}
              className="text-lg font-semibold text-gray-900 hover:text-black transition-colors"
            >
              ← 返回主网格
            </button>
            <div className="text-sm text-gray-500">2026前沿技术展示</div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 标题区域 */}
        <ScrollAnimation animation="fadeInUp" threshold={0.2}>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">2026前沿前端技术</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              探索最新前端设计趋势、交互技术和性能优化策略， 打造极致用户体验。
            </p>
          </div>
        </ScrollAnimation>

        {/* 特性展示网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <ScrollAnimation
              key={feature.title}
              animation={feature.animation}
              threshold={0.1}
              delay={index * 100}
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover-lift transition-all duration-300">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* 交互演示区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* 左侧：表单演示 */}
          <ScrollAnimation animation="fadeInLeft" threshold={0.2}>
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">可访问表单演示</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AccessibleInput
                  label="姓名"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="请输入您的姓名"
                  required
                />

                <AccessibleInput
                  label="邮箱"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  required
                  helperText="我们不会分享您的邮箱地址"
                />

                <AccessibleInput
                  label="消息"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="请输入您的消息..."
                  multiline
                  rows={4}
                />

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <AccessibleButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '提交中...' : '提交表单'}
                  </AccessibleButton>

                  <AccessibleButton
                    type="button"
                    variant="secondary"
                    onClick={() => setFormData({ name: '', email: '', message: '' })}
                  >
                    重置
                  </AccessibleButton>
                </div>
              </form>
            </div>
          </ScrollAnimation>

          {/* 右侧：交互演示 */}
          <ScrollAnimation animation="fadeInRight" threshold={0.2}>
            <div className="space-y-8">
              {/* 按钮演示 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">按钮变体演示</h3>
                <div className="flex flex-wrap gap-4">
                  <AccessibleButton variant="primary">主要按钮</AccessibleButton>
                  <AccessibleButton variant="secondary">次要按钮</AccessibleButton>
                  <AccessibleButton variant="ghost">幽灵按钮</AccessibleButton>
                  <AccessibleButton variant="danger">危险按钮</AccessibleButton>
                  <AccessibleButton variant="success">成功按钮</AccessibleButton>
                </div>
              </div>

              {/* 预测性加载演示 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">预测性加载演示</h3>
                <PredictiveLoading
                  action={simulateApiCall}
                  showLoading={true}
                  onComplete={() => alert('内容加载成功！')}
                  onError={error => alert(`加载失败: ${error.message}`)}
                >
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">将鼠标悬停在此区域或点击按钮来体验预测性加载。</p>
                    <div className="mt-4">
                      <AccessibleButton onClick={() => {}} variant="primary" size="small">
                        触发加载
                      </AccessibleButton>
                    </div>
                  </div>
                </PredictiveLoading>
              </div>

              {/* 动画效果演示 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">动画效果演示</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-float p-4 bg-gray-100 rounded-lg text-center">
                    <div className="text-2xl">🎈</div>
                    <div className="text-sm mt-2">浮动动画</div>
                  </div>
                  <div className="animate-shimmer p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg text-center">
                    <div className="text-2xl">✨</div>
                    <div className="text-sm mt-2">微光动画</div>
                  </div>
                  <div className="animate-morph p-4 bg-gray-100 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] text-center">
                    <div className="text-2xl">🌀</div>
                    <div className="text-sm mt-2">变形动画</div>
                  </div>
                  <div className="metal-shader p-4 rounded-lg text-center">
                    <div className="text-2xl">🔮</div>
                    <div className="text-sm mt-2">金属效果</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>

        {/* 技术说明 */}
        <ScrollAnimation animation="fadeInUp" threshold={0.1}>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">技术实现说明</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 核心特性</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 基于Intersection Observer的滚动动画</li>
                  <li>• 符合WCAG 2.1 AA的可访问性标准</li>
                  <li>• 预测性加载和资源预取</li>
                  <li>• 纯CSS微动画系统</li>
                  <li>• 响应式设计和移动端优化</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 性能优化</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 代码分割和懒加载</li>
                  <li>• 图像优化和延迟加载</li>
                  <li>• 减少JavaScript依赖</li>
                  <li>• 高效的CSS动画性能</li>
                  <li>• 内存泄漏预防</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">© 2026 LinkHub · 前沿前端技术展示</p>
            <p className="text-xs text-gray-400 mt-2">
              本页面展示了2026年前端开发的最新趋势和最佳实践
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => navigate('/bento')}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                返回主网格
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                回到顶部
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
