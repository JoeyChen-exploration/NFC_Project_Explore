import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * 优化的Dashboard头部组件
 * 包含：响应式导航、用户菜单、可访问性优化
 */
export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  const navigationItems = [
    { label: '仪表板', path: '/dashboard', icon: '🏠' },
    { label: '编辑器', path: '/editor', icon: '✏️' },
    { label: '分析', path: '/analytics', icon: '📊' },
    { label: '设置', path: '/settings', icon: '⚙️' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-color-surface border-b border-color-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo和品牌 */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 focus-ring rounded-lg p-2"
              aria-label="返回仪表板"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-bold text-color-text-primary hidden sm:block">
                LinkHub NFC
              </span>
            </button>
          </div>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-color-text-secondary hover:bg-color-surface-2 hover:text-color-text-primary transition-colors focus-ring"
                aria-current={window.location.pathname === item.path ? 'page' : undefined}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* 用户菜单 */}
          <div className="flex items-center gap-4">
            {/* 通知按钮 */}
            <button
              className="relative p-2 rounded-lg hover:bg-color-surface-2 transition-colors focus-ring"
              aria-label="通知"
            >
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-color-error rounded-full"></span>
            </button>

            {/* 用户头像和菜单 */}
            <div className="relative">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-color-surface-2 transition-colors focus-ring"
                aria-expanded={mobileMenuOpen}
                aria-label="用户菜单"
              >
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-color-text-primary">
                    {user?.username || '用户'}
                  </div>
                  <div className="text-xs text-color-text-tertiary">
                    {user?.email || '未设置邮箱'}
                  </div>
                </div>
                <span className={`transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* 下拉菜单 */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-color-surface border border-color-border rounded-lg shadow-lg py-2 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-color-border-light">
                    <div className="text-sm font-medium text-color-text-primary">
                      {user?.username || '用户'}
                    </div>
                    <div className="text-xs text-color-text-tertiary truncate">
                      {user?.email || '未设置邮箱'}
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left text-color-text-secondary hover:bg-color-surface-2 transition-colors"
                    >
                      <span>👤</span>
                      <span>个人资料</span>
                    </button>

                    <button
                      onClick={() => navigate('/settings')}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left text-color-text-secondary hover:bg-color-surface-2 transition-colors"
                    >
                      <span>⚙️</span>
                      <span>账户设置</span>
                    </button>

                    <button
                      onClick={() => navigate('/help')}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left text-color-text-secondary hover:bg-color-surface-2 transition-colors"
                    >
                      <span>❓</span>
                      <span>帮助中心</span>
                    </button>
                  </div>

                  <div className="border-t border-color-border-light pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left text-color-error hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 移动菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-color-surface-2 transition-colors focus-ring"
              aria-label="菜单"
              aria-expanded={mobileMenuOpen}
            >
              <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* 移动导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-color-border py-4 animate-fade-in">
            <nav className="space-y-2">
              {navigationItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-color-text-secondary hover:bg-color-surface-2 transition-colors focus-ring"
                  aria-current={window.location.pathname === item.path ? 'page' : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* 点击外部关闭菜单 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
