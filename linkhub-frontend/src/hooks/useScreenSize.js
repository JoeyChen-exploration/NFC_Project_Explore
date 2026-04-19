import { useState, useEffect } from 'react';

/**
 * 屏幕尺寸检测Hook
 * 检测当前屏幕是否为移动端（宽度≤768px）
 *
 * @returns {Object} 包含isMobile布尔值
 * @property {boolean} isMobile - 是否为移动端
 *
 * @example
 * const { isMobile } = useScreenSize();
 * if (isMobile) {
 *   // 移动端布局
 * } else {
 *   // 桌面端布局
 * }
 */
export function useScreenSize() {
  const [isMobile, setIsMobile] = useState(() => {
    // 初始值基于当前窗口宽度
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  });

  useEffect(() => {
    // 如果不在浏览器环境，直接返回
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 初始检查
    handleResize();

    // 添加resize事件监听
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isMobile };
}

/**
 * 获取精确的屏幕尺寸信息
 *
 * @returns {Object} 屏幕尺寸信息
 * @property {number} width - 窗口宽度
 * @property {number} height - 窗口高度
 * @property {boolean} isMobile - 是否为移动端（≤768px）
 * @property {boolean} isTablet - 是否为平板（769-1024px）
 * @property {boolean} isDesktop - 是否为桌面端（>1024px）
 */
export function useScreenDetails() {
  const [screen, setScreen] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 0, height: 0, isMobile: false, isTablet: false, isDesktop: true };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreen({
        width,
        height,
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screen;
}

/**
 * 响应式断点检测
 *
 * @param {Object} breakpoints 自定义断点配置
 * @param {number} breakpoints.mobile - 移动端最大宽度，默认768
 * @param {number} breakpoints.tablet - 平板最大宽度，默认1024
 * @returns {Object} 包含各断点状态的响应式信息
 */
export function useResponsive(breakpoints = { mobile: 768, tablet: 1024 }) {
  const { mobile: mobileBreakpoint = 768, tablet: tabletBreakpoint = 1024 } = breakpoints;

  const [responsive, setResponsive] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: 'desktop',
      };
    }

    const width = window.innerWidth;
    let breakpoint = 'desktop';

    if (width <= mobileBreakpoint) {
      breakpoint = 'mobile';
    } else if (width <= tabletBreakpoint) {
      breakpoint = 'tablet';
    }

    return {
      isMobile: width <= mobileBreakpoint,
      isTablet: width > mobileBreakpoint && width <= tabletBreakpoint,
      isDesktop: width > tabletBreakpoint,
      breakpoint,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      let breakpoint = 'desktop';

      if (width <= mobileBreakpoint) {
        breakpoint = 'mobile';
      } else if (width <= tabletBreakpoint) {
        breakpoint = 'tablet';
      }

      setResponsive({
        isMobile: width <= mobileBreakpoint,
        isTablet: width > mobileBreakpoint && width <= tabletBreakpoint,
        isDesktop: width > tabletBreakpoint,
        breakpoint,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileBreakpoint, tabletBreakpoint]);

  return responsive;
}
