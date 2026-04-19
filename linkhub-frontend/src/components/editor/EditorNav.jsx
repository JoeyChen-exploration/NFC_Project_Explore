import { useScreenSize } from '../../hooks/useScreenSize';

export default function EditorNav({ tabs, activeTab, onTabChange, isMobile = false }) {
  const { isMobile: screenIsMobile } = useScreenSize();
  const mobileMode = isMobile || screenIsMobile;

  const handleTabClick = tabId => {
    onTabChange(tabId);
  };

  // 移动端样式
  const mobileStyles = {
    container: {
      display: 'flex',
      overflowX: 'auto',
      padding: '12px 16px',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE/Edge
    },
    tab: {
      flexShrink: 0,
      padding: '8px 16px',
      marginRight: '8px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
    },
    activeTab: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    inactiveTab: {
      backgroundColor: 'white',
      color: '#64748b',
      border: '1px solid #e2e8f0',
    },
  };

  // 桌面端样式
  const desktopStyles = {
    container: {
      display: 'flex',
      gap: '4px',
      padding: '0 24px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
    },
    tab: {
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderRadius: '8px 8px 0 0',
      transition: 'all 0.2s ease',
      position: 'relative',
    },
    activeTab: {
      backgroundColor: '#f1f5f9',
      color: '#1e293b',
    },
    inactiveTab: {
      color: '#64748b',
      '&:hover': {
        backgroundColor: '#f8fafc',
        color: '#475569',
      },
    },
  };

  const styles = mobileMode ? mobileStyles : desktopStyles;

  return (
    <div style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const tabStyle = {
          ...styles.tab,
          ...(isActive ? styles.activeTab : styles.inactiveTab),
        };

        return (
          <div
            key={tab.id}
            style={tabStyle}
            onClick={() => handleTabClick(tab.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(tab.id);
              }
            }}
            aria-label={`切换到${tab.label}标签`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>

            {/* 桌面端活动指示器 */}
            {!mobileMode && isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40%',
                  height: '3px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '3px 3px 0 0',
                }}
              />
            )}
          </div>
        );
      })}

      {/* 隐藏滚动条（移动端） */}
      <style>
        {`
          div[style*="overflow-x: auto"]::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
}
