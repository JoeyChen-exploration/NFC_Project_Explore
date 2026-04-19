import React, { useEffect, useRef, useState } from 'react';

/**
 * 2026前沿滚动动画组件
 * 使用Intersection Observer实现滚动触发动画
 * 支持多种动画效果和阈值配置
 */
const ScrollAnimation = ({
  children,
  animation = 'fadeInUp',
  threshold = 0.1,
  rootMargin = '0px',
  delay = 0,
  duration = 400,
  once = true,
  className = '',
  style,
  onVisible,
  ...props
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // 动画配置
  const animations = {
    fadeInUp: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeInLeft: {
      from: { opacity: 0, transform: 'translateX(-20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    fadeInRight: {
      from: { opacity: 0, transform: 'translateX(20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    rotateIn: {
      from: { opacity: 0, transform: 'rotate(-5deg) scale(0.95)' },
      to: { opacity: 1, transform: 'rotate(0) scale(1)' },
    },
    blurIn: {
      from: { opacity: 0, filter: 'blur(10px)' },
      to: { opacity: 1, filter: 'blur(0)' },
    },
  };

  // 获取动画配置
  const animConfig = animations[animation] || animations.fadeInUp;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 创建Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;

        if (visible && !isVisible) {
          setIsVisible(true);

          // 触发回调
          if (onVisible) {
            onVisible();
          }

          // 如果只动画一次，标记为已动画
          if (once) {
            setHasAnimated(true);
          }
        } else if (!visible && !once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    // 开始观察
    observer.observe(element);

    // 清理函数
    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, onVisible]);

  // 计算动画样式
  const getAnimationStyle = () => {
    const baseStyle = {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      transitionDelay: `${delay}ms`,
      ...style,
    };

    if (isVisible || hasAnimated) {
      return {
        ...baseStyle,
        ...animConfig.to,
      };
    }

    return {
      ...baseStyle,
      ...animConfig.from,
    };
  };

  // 处理减少运动的偏好
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = e => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 如果用户偏好减少运动，直接显示内容
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={getAnimationStyle()} aria-live="polite" {...props}>
      {children}
    </div>
  );
};

ScrollAnimation.displayName = 'ScrollAnimation';

export default ScrollAnimation;
