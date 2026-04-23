import React, { useState, useRef, useEffect } from 'react';

/**
 * 触摸优化按钮
 * 确保触摸目标≥44px，添加触觉反馈
 */
export function TouchButton({
  children,
  onClick,
  className = '',
  disabled = false,
  size = 'medium',
  feedback = true,
  ...props
}) {
  const [isTouching, setIsTouching] = useState(false);
  const buttonRef = useRef(null);

  const sizes = {
    small: 'min-h-[36px] min-w-[36px] px-3 py-2',
    medium: 'min-h-[44px] min-w-[44px] px-4 py-3',
    large: 'min-h-[52px] min-w-[52px] px-5 py-4',
  };

  const handleTouchStart = e => {
    setIsTouching(true);
    if (feedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // 轻微震动反馈
    }
  };

  const handleTouchEnd = e => {
    setIsTouching(false);
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const handleTouchCancel = () => {
    setIsTouching(false);
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      disabled={disabled}
      className={`
        relative
        ${sizes[size]}
        rounded-lg
        transition-all
        duration-150
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${isTouching ? 'scale-95 opacity-90' : ''}
        ${className}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={props['aria-label'] || (typeof children === 'string' ? children : '按钮')}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * 滑动删除组件
 */
export function SwipeToDelete({ children, onDelete, threshold = 100, className = '' }) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef(null);

  const handleTouchStart = e => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = e => {
    if (!isSwiping) return;

    const currentClientX = e.touches[0].clientX;
    const deltaX = currentClientX - startX;

    // 只允许向左滑动
    if (deltaX < 0) {
      setCurrentX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(currentX) > threshold) {
      // 滑动超过阈值，触发删除
      onDelete();
    }

    // 重置位置
    setCurrentX(0);
    setIsSwiping(false);
  };

  const handleTouchCancel = () => {
    setCurrentX(0);
    setIsSwiping(false);
  };

  const deleteWidth = Math.min(Math.abs(currentX), threshold);
  const progress = deleteWidth / threshold;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        touchAction: 'pan-y',
      }}
    >
      {/* 删除背景 */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white"
        style={{
          width: `${deleteWidth}px`,
          transform: `translateX(${currentX}px)`,
        }}
      >
        <span className="text-sm font-medium">删除</span>
      </div>

      {/* 内容 */}
      <div
        className="relative bg-white transition-transform duration-200"
        style={{
          transform: `translateX(${currentX}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 下拉刷新组件
 */
export function PullToRefresh({ onRefresh, children, threshold = 100, className = '' }) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);

  const handleTouchStart = e => {
    if (containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = e => {
    if (containerRef.current.scrollTop > 0) return;

    const currentClientY = e.touches[0].clientY;
    const deltaY = currentClientY - startY;

    // 只允许向下拉动
    if (deltaY > 0) {
      setCurrentY(Math.min(deltaY, threshold * 2));
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (currentY > threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    // 重置位置
    setCurrentY(0);
  };

  const progress = Math.min(currentY / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'pan-y',
      }}
    >
      {/* 刷新指示器 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform duration-200"
        style={{
          transform: `translateY(${currentY - 50}px)`,
          opacity: progress,
        }}
      >
        <div className="flex items-center gap-2 p-4">
          {isRefreshing ? (
            <>
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">刷新中...</span>
            </>
          ) : (
            <>
              <div
                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                style={{
                  transform: `rotate(${progress * 360}deg)`,
                }}
              ></div>
              <span className="text-sm text-gray-600">
                {progress > 0.8 ? '释放刷新' : '下拉刷新'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isRefreshing ? 'transform 0.3s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 长按组件
 */
export function LongPress({ children, onLongPress, duration = 500, className = '' }) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef(null);

  const handleTouchStart = () => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressing(false);
    }, duration);
  };

  const handleTouchEnd = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleTouchCancel = handleTouchEnd;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={`relative ${className} ${isPressing ? 'scale-95' : ''}`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.2s',
      }}
    >
      {children}

      {/* 长按指示器 */}
      {isPressing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

/**
 * 移动端手势检测钩子
 */
export function useTouchGesture() {
  const [gesture, setGesture] = useState({
    type: null,
    direction: null,
    distance: 0,
    velocity: 0,
  });

  const startRef = useRef({ x: 0, y: 0, time: 0 });
  const currentRef = useRef({ x: 0, y: 0, time: 0 });

  const handleTouchStart = e => {
    const touch = e.touches[0];
    startRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = e => {
    const touch = e.touches[0];
    currentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const dx = currentRef.current.x - startRef.current.x;
    const dy = currentRef.current.y - startRef.current.y;
    const dt = currentRef.current.time - startRef.current.time;

    let type = 'pan';
    let direction = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }

    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = dt > 0 ? distance / dt : 0;

    setGesture({
      type,
      direction,
      distance,
      velocity,
    });
  };

  const handleTouchEnd = () => {
    const dx = currentRef.current.x - startRef.current.x;
    const dy = currentRef.current.y - startRef.current.y;
    const dt = currentRef.current.time - startRef.current.time;

    let type = 'swipe';
    let direction = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }

    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = dt > 0 ? distance / dt : 0;

    // 如果是快速滑动
    if (velocity > 0.5) {
      setGesture({
        type,
        direction,
        distance,
        velocity,
      });
    } else {
      setGesture({
        type: null,
        direction: null,
        distance: 0,
        velocity: 0,
      });
    }
  };

  return {
    gesture,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
