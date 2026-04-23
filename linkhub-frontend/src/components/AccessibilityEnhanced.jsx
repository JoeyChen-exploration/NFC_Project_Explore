import React, { useState, useEffect, useRef } from 'react';

/**
 * 可访问性增强的模态框
 * WCAG 2.1 AA标准，完整键盘导航，屏幕阅读器支持
 */
export function AccessibleModal({ isOpen, onClose, title, children, className = '' }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // 保存之前的焦点元素
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    }
  }, [isOpen]);

  // 焦点管理
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // 将焦点移动到模态框
      modalRef.current.focus();

      // 捕获焦点在模态框内
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = e => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }

        // Escape键关闭
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        // 恢复之前的焦点
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  // 点击外部关闭
  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto ${className}`}
      >
        {/* 标题区域 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="关闭对话框"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">{children}</div>

        {/* 屏幕阅读器专用说明 */}
        <div className="sr-only" aria-live="polite">
          对话框已打开，{title}
        </div>
      </div>
    </div>
  );
}

/**
 * 可访问性增强的下拉菜单
 */
export function AccessibleDropdown({ label, options, value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleKeyDown = e => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // 导航到下一个选项
          const currentIndex = options.findIndex(opt => opt.value === value);
          const nextIndex = (currentIndex + 1) % options.length;
          onChange(options[nextIndex].value);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // 导航到上一个选项
          const currentIndex = options.findIndex(opt => opt.value === value);
          const prevIndex = (currentIndex - 1 + options.length) % options.length;
          onChange(options[prevIndex].value);
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;

      case 'Escape':
        setIsOpen(false);
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleOptionClick = optionValue => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={dropdownRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${label}-label`}
      >
        <span id={`${label}-label`} className="sr-only">
          {label}
        </span>
        <span>{selectedOption?.label || '请选择'}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleOptionClick(option.value)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                option.value === value ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 跳过导航链接
 * 帮助键盘用户快速跳过导航
 */
export function SkipNavigation() {
  const handleClick = e => {
    e.preventDefault();
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 100);
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-700 focus:rounded-lg focus:shadow-lg"
    >
      跳到主要内容
    </a>
  );
}

/**
 * 高对比度模式支持
 */
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // 检查系统偏好
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(prefersHighContrast.matches);

    const handleChange = e => {
      setIsHighContrast(e.matches);
    };

    prefersHighContrast.addEventListener('change', handleChange);
    return () => prefersHighContrast.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    if (!isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return (
    <button
      onClick={toggleHighContrast}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={isHighContrast ? '关闭高对比度模式' : '开启高对比度模式'}
    >
      <span className="text-lg">{isHighContrast ? '🔆' : '🌙'}</span>
      <span>{isHighContrast ? '高对比度' : '普通模式'}</span>
    </button>
  );
}

/**
 * 减少动画模式支持
 */
export function ReduceMotionToggle() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(prefersReducedMotion.matches);

    const handleChange = e => {
      setReducedMotion(e.matches);
    };

    prefersReducedMotion.addEventListener('change', handleChange);
    return () => prefersReducedMotion.removeEventListener('change', handleChange);
  }, []);

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    if (!reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  return (
    <button
      onClick={toggleReducedMotion}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={reducedMotion ? '开启动画' : '减少动画'}
    >
      <span className="text-lg">{reducedMotion ? '⏸️' : '▶️'}</span>
      <span>{reducedMotion ? '减少动画' : '正常动画'}</span>
    </button>
  );
}

/**
 * 字体大小调整器
 */
export function FontSizeAdjuster() {
  const [fontSize, setFontSize] = useState(100); // 百分比

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 200);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const resetFontSize = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={decreaseFontSize}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="减小字体"
        disabled={fontSize <= 80}
      >
        A-
      </button>

      <span className="text-sm text-gray-600 min-w-[3rem] text-center">{fontSize}%</span>

      <button
        onClick={increaseFontSize}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="增大字体"
        disabled={fontSize >= 200}
      >
        A+
      </button>

      <button
        onClick={resetFontSize}
        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="重置字体大小"
      >
        重置
      </button>
    </div>
  );
}

/**
 * 屏幕阅读器实时区域
 * 用于动态内容更新通知
 */
export function LiveRegion({ message, priority = 'polite', className = '' }) {
  return (
    <div className={`sr-only ${className}`} aria-live={priority} aria-atomic="true">
      {message}
    </div>
  );
}

/**
 * 可访问性工具栏
 * 集中提供可访问性功能
 */
export function AccessibilityToolbar() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-lg">
        <HighContrastToggle />
        <ReduceMotionToggle />
        <FontSizeAdjuster />
      </div>

      <div className="text-xs text-gray-500 text-center">可访问性工具</div>
    </div>
  );
}

// 全局可访问性样式
const accessibilityStyles = `
  /* 高对比度模式 */
  .high-contrast {
    --color-text-primary: #000000;
    --color-text-secondary: #333333;
    --color-border: #000000;
    --color-primary: #0000EE;
    --color-surface: #FFFFFF;
  }
  
  .high-contrast * {
    border-width: 2px !important;
  }
  
  .high-contrast button,
  .high-contrast input,
  .high-contrast select,
  .high-contrast textarea {
    border-width: 2px !important;
  }
  
  /* 减少动画模式 */
  .reduce-motion *,
  .reduce-motion *::before,
  .reduce-motion *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  
  /* 焦点样式增强 */
  :focus {
    outline: 3px solid #2563eb !important;
    outline-offset: 2px !important;
  }
  
  /* 键盘导航焦点 */
  .focus-visible {
    outline: 3px solid #2563eb !important;
    outline-offset: 2px !important;
  }
  
  /* 屏幕阅读器专用 */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .sr-only.focusable:focus {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`;

// 注入全局样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = accessibilityStyles;
  document.head.appendChild(style);
}
