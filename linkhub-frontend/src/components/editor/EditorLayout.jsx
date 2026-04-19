import { useScreenDetails } from '../../hooks/useScreenSize';

/**
 * 编辑器布局组件
 * 提供响应式的左右面板布局（移动端预览区置顶）
 */
export default function EditorLayout({ leftPanel, rightPanel, children, gap = 32, padding = 32 }) {
  const { isMobile, isTablet } = useScreenDetails();

  // 响应式样式计算
  const getResponsiveStyles = () => {
    if (isMobile) {
      return {
        container: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          margin: '0 auto',
          padding: '20px 16px',
          gap: 20,
          boxSizing: 'border-box',
          minHeight: 'calc(100vh - 60px)', // 减去导航栏高度
        },
        leftPanel: {
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        },
        rightPanel: {
          width: '100%',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          marginTop: 20,
        },
      };
    }

    if (isTablet) {
      return {
        container: {
          flex: 1,
          display: 'flex',
          maxWidth: '90%',
          width: '100%',
          margin: '0 auto',
          padding: '24px 20px',
          gap: 24,
          boxSizing: 'border-box',
          minHeight: 'calc(100vh - 60px)',
        },
        leftPanel: {
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        },
        rightPanel: {
          width: 280,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
        },
      };
    }

    // 桌面端样式
    return {
      container: {
        flex: 1,
        display: 'flex',
        maxWidth: 1160,
        width: '100%',
        margin: '0 auto',
        padding: `${padding}px 24px`,
        gap,
        boxSizing: 'border-box',
        minHeight: 'calc(100vh - 60px)',
      },
      leftPanel: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      },
      rightPanel: {
        width: 290,
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
      },
    };
  };

  const styles = getResponsiveStyles();

  // 如果提供了children，直接渲染children
  if (children) {
    return <div style={styles.container}>{children}</div>;
  }

  // 移动端：预览区显示在编辑区上方
  return (
    <div style={styles.container}>
      <div style={{ ...styles.leftPanel, order: isMobile ? 2 : 1 }}>{leftPanel}</div>
      <div style={{ ...styles.rightPanel, order: isMobile ? 1 : 2 }}>{rightPanel}</div>
    </div>
  );
}

/**
 * 响应式样式工具函数
 * 根据屏幕尺寸返回不同的样式
 */
export function getResponsiveStyle(baseStyle, mobileStyle, tabletStyle) {
  const { isMobile, isTablet } = useScreenDetails();

  if (isMobile && mobileStyle) {
    return { ...baseStyle, ...mobileStyle };
  }

  if (isTablet && tabletStyle) {
    return { ...baseStyle, ...tabletStyle };
  }

  return baseStyle;
}

/**
 * 响应式容器组件
 * 根据屏幕尺寸应用不同的样式
 */
export function ResponsiveContainer({ children, style, mobileStyle, tabletStyle, ...props }) {
  const responsiveStyle = getResponsiveStyle(style || {}, mobileStyle, tabletStyle);

  return (
    <div style={responsiveStyle} {...props}>
      {children}
    </div>
  );
}

/**
 * 响应式面板组件
 */
export function ResponsivePanel({
  children,
  type = 'left', // 'left' | 'right'
  ...props
}) {
  const { isMobile, isTablet } = useScreenDetails();

  const baseStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  if (type === 'left') {
    const style = {
      ...baseStyle,
      flex: 1,
      minWidth: 0,
      gap: isMobile ? 16 : isTablet ? 20 : 20,
    };

    return (
      <div style={style} {...props}>
        {children}
      </div>
    );
  }

  // 右侧面板
  const style = {
    ...baseStyle,
    width: isMobile ? '100%' : isTablet ? 280 : 290,
    flexShrink: 0,
    justifyContent: 'center',
    marginTop: isMobile ? 20 : 0,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
}

/**
 * EditorLayout组件属性说明
 *
 * @prop {ReactNode} leftPanel - 左侧面板内容（编辑区）
 * @prop {ReactNode} rightPanel - 右侧面板内容（预览区）
 * @prop {ReactNode} children - 自定义子内容（如果提供，忽略leftPanel/rightPanel）
 * @prop {number} gap - 左右面板间距（像素，默认32）
 * @prop {number} padding - 容器内边距（像素，默认32）
 *
 * @example
 * // 标准用法
 * <EditorLayout
 *   leftPanel={<div>编辑内容</div>}
 *   rightPanel={<div>预览内容</div>}
 *   gap={24}
 *   padding={24}
 * />
 *
 * @example
 * // 自定义布局
 * <EditorLayout>
 *   <div>自定义内容</div>
 * </EditorLayout>
 */
