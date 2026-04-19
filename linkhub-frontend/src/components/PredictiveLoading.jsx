import React, { useState, useEffect, useRef } from 'react';

/**
 * 2026前沿预测性加载组件
 * 在用户可能执行操作前预加载内容
 * 提供平滑的过渡和反馈
 */
const PredictiveLoading = ({
  children,
  action,
  delay = 300,
  minDuration = 300,
  showLoading = true,
  loadingComponent,
  errorComponent,
  onStart,
  onComplete,
  onError,
  className = '',
  disabled = false,
  ...props
}) => {
  const [state, setState] = useState({
    isLoading: false,
    hasLoaded: false,
    error: null,
  });

  const timeoutRef = useRef(null);
  const startTimeRef = useRef(0);

  // 清理超时
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 执行预测性加载
  const executeAction = async () => {
    if (disabled || state.isLoading) return;

    // 记录开始时间
    startTimeRef.current = Date.now();

    // 触发开始回调
    if (onStart) {
      onStart();
    }

    // 设置加载状态
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // 执行动作
      const result = await action();

      // 计算剩余时间以确保最小持续时间
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(minDuration - elapsed, 0);

      // 延迟设置完成状态
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasLoaded: true,
        }));

        // 触发完成回调
        if (onComplete) {
          onComplete(result);
        }
      }, remaining);

      return result;
    } catch (error) {
      // 计算剩余时间
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(minDuration - elapsed, 0);

      // 延迟设置错误状态
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || '加载失败',
        }));

        // 触发错误回调
        if (onError) {
          onError(error);
        }
      }, remaining);

      throw error;
    }
  };

  // 预加载内容（不显示加载状态）
  const preload = async () => {
    if (disabled || state.hasLoaded || state.isLoading) return;

    try {
      await action();
      setState(prev => ({
        ...prev,
        hasLoaded: true,
      }));
    } catch (error) {
      // 静默失败，预加载不影响用户体验
      console.debug('预加载失败:', error);
    }
  };

  // 鼠标悬停时预加载
  const handleMouseEnter = () => {
    if (!state.hasLoaded && !state.isLoading) {
      preload();
    }
  };

  // 焦点时预加载
  const handleFocus = () => {
    if (!state.hasLoaded && !state.isLoading) {
      preload();
    }
  };

  // 默认加载组件
  const DefaultLoading = () => (
    <div className="predictive-loading">
      <div className="flex items-center justify-center space-x-2">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="text-sm text-gray-500">加载中...</span>
      </div>
    </div>
  );

  // 默认错误组件
  const DefaultError = ({ error }) => (
    <div className="p-4 border border-red-200 bg-red-50 rounded-md">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm text-red-700">{error || '加载失败'}</span>
      </div>
    </div>
  );

  // 渲染内容
  const renderContent = () => {
    if (state.isLoading && showLoading) {
      return loadingComponent ? loadingComponent() : <DefaultLoading />;
    }

    if (state.error && errorComponent) {
      return errorComponent({ error: state.error });
    }

    if (state.error) {
      return <DefaultError error={state.error} />;
    }

    return children;
  };

  return (
    <div
      className={`predictive-loading-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      {renderContent()}

      {/* 隐藏的触发按钮，用于可访问性 */}
      {!disabled && (
        <button type="button" onClick={executeAction} className="sr-only" aria-label="执行操作">
          执行
        </button>
      )}
    </div>
  );
};

PredictiveLoading.displayName = 'PredictiveLoading';

export default PredictiveLoading;
