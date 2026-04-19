import React from 'react';

/**
 * 2026前沿可访问输入框组件
 * 符合WCAG 2.1 AA标准，支持键盘导航和屏幕阅读器
 */
const AccessibleInput = React.forwardRef(
  (
    {
      label,
      id,
      type = 'text',
      placeholder,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      error,
      helperText,
      disabled = false,
      required = false,
      readOnly = false,
      autoComplete = 'off',
      className = '',
      inputClassName = '',
      labelClassName = '',
      errorClassName = '',
      helperClassName = '',
      showLabel = true,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    ref,
  ) => {
    // 生成唯一的ID
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    // 组合aria-describedby
    const describedBy = [errorId, helperId, ariaDescribedby].filter(Boolean).join(' ') || undefined;

    // 输入框类名
    const inputClasses = [
      'w-full px-3 py-2',
      'bg-white border border-gray-300 rounded-md',
      'text-gray-900 placeholder-gray-500',
      'focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent',
      'transition-all duration-150',
      'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
      'read-only:bg-gray-50 read-only:cursor-default',
      error ? 'border-red-500 focus:ring-red-500' : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    // 标签类名
    const labelClasses = [
      'block text-sm font-medium text-gray-700 mb-1',
      required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : '',
      labelClassName,
    ]
      .filter(Boolean)
      .join(' ');

    // 错误消息类名
    const errorClasses = ['mt-1 text-sm text-red-600', errorClassName].filter(Boolean).join(' ');

    // 帮助文本类名
    const helperClasses = ['mt-1 text-sm text-gray-500', helperClassName].filter(Boolean).join(' ');

    // 处理焦点事件
    const handleFocus = e => {
      if (onFocus) {
        onFocus(e);
      }
    };

    const handleBlur = e => {
      if (onBlur) {
        onBlur(e);
      }
    };

    // 处理键盘事件
    const handleKeyDown = e => {
      // 回车键提交表单
      if (e.key === 'Enter' && type !== 'textarea') {
        e.preventDefault();
        // 触发表单提交
        const form = e.target.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <div className={`space-y-1 ${className}`}>
        {showLabel && label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            readOnly={readOnly}
            autoComplete={autoComplete}
            className={inputClasses}
            aria-invalid={!!error}
            aria-required={required}
            aria-describedby={describedBy}
            aria-label={!showLabel ? label : undefined}
            {...props}
          />

          {/* 加载状态指示器 */}
          {props['aria-busy'] && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="loading-dots">
                <span className="w-1.5 h-1.5 bg-gray-400"></span>
                <span className="w-1.5 h-1.5 bg-gray-400"></span>
                <span className="w-1.5 h-1.5 bg-gray-400"></span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className={errorClasses} role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className={helperClasses}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;
