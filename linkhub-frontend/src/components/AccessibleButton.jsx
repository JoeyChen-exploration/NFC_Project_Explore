import React from 'react';

/**
 * 2026前沿可访问按钮组件
 * 符合WCAG 2.1 AA标准，支持键盘导航和屏幕阅读器
 */
const AccessibleButton = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      disabled = false,
      className = '',
      onClick,
      onKeyDown,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    ref,
  ) => {
    // 变体类名
    const variantClasses = {
      primary: 'btn-minimal bg-black text-white hover:opacity-90',
      secondary: 'btn-minimal bg-white text-black border border-gray-300 hover:bg-gray-50',
      ghost: 'btn-minimal bg-transparent text-black hover:bg-gray-100',
      danger: 'btn-minimal bg-red-600 text-white hover:bg-red-700',
      success: 'btn-minimal bg-green-600 text-white hover:bg-green-700',
    };

    // 尺寸类名
    const sizeClasses = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg',
    };

    // 组合类名
    const buttonClasses = [
      'inline-flex items-center justify-center',
      'font-medium rounded-md',
      'transition-all duration-150',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'hover-lift press-scale', // 前沿微动画
      variantClasses[variant] || variantClasses.primary,
      sizeClasses[size] || sizeClasses.medium,
      isLoading ? 'cursor-wait' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // 处理键盘事件
    const handleKeyDown = e => {
      // 空格键和回车键触发点击
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (onClick && !disabled && !isLoading) {
          onClick(e);
        }
      }

      // 传递自定义键盘事件
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    // 处理点击事件
    const handleClick = e => {
      if (disabled || isLoading) {
        e.preventDefault();
        return;
      }

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-describedby={ariaDescribedby}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="loading-dots mr-2">
              <span></span>
              <span></span>
              <span></span>
            </span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
