import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import DashboardHeader from '../components/DashboardHeader';
import '../styles/dashboard-design-system.css';

/**
 * 全面优化的NFC仪表板 V2
 * 一次性搞定所有优化：视觉、交互、性能、移动端、可访问性、功能
 */
export default function OptimizedDashboardV2() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 状态管理优化
  const [dashboardState, setDashboardState] = useState({
    nfcCards: [],
    analytics: { total_scans: 0, unique_devices: 0, today_scans: 0 },
    profile: { name: '', username: '' },
    loading: true,
    creatingCard: false,
    searchQuery: '',
    selectedCards: new Set(),
    activeTab: 'overview',
  });

  const [newCard, setNewCard] = useState({
    name: '',
    serialNumber: '',
    redirectUrl: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState(null);

  // 计算值优化
  const filteredCards = useMemo(() => {
    const query = dashboardState.searchQuery.toLowerCase();
    return dashboardState.nfcCards.filter(
      card =>
        card.name.toLowerCase().includes(query) || card.serial_number.toLowerCase().includes(query),
    );
  }, [dashboardState.nfcCards, dashboardState.searchQuery]);

  const selectedCount = dashboardState.selectedCards.size;

  // 数据加载优化
  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardState(prev => ({ ...prev, loading: true }));

      const [cardsRes, analyticsRes, profileRes] = await Promise.allSettled([
        api.get('/api/nfc/cards'),
        api.get('/api/nfc/analytics'),
        api.get('/api/profile'),
      ]);

      const updates = {};

      if (cardsRes.status === 'fulfilled') {
        updates.nfcCards = cardsRes.value.data || [];
      }

      if (analyticsRes.status === 'fulfilled') {
        updates.analytics = analyticsRes.value.data || {};
      }

      if (profileRes.status === 'fulfilled') {
        updates.profile = profileRes.value.data || {};
      }

      setDashboardState(prev => ({
        ...prev,
        ...updates,
        loading: false,
      }));
    } catch (error) {
      console.error('加载数据失败:', error);
      setDashboardState(prev => ({ ...prev, loading: false }));
      showNotification('数据加载失败', 'error');
    }
  }, []);

  // 表单验证
  const validateForm = useCallback(() => {
    const errors = {};

    if (!newCard.name.trim()) {
      errors.name = '卡片名称不能为空';
    }

    if (newCard.serialNumber && !/^[A-Z0-9-]+$/.test(newCard.serialNumber)) {
      errors.serialNumber = '只能包含大写字母、数字和横线';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newCard]);

  // 创建卡片
  const handleCreateCard = useCallback(
    async e => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        setDashboardState(prev => ({ ...prev, creatingCard: true }));

        const cardData = {
          ...newCard,
          serialNumber: newCard.serialNumber || generateSerialNumber(),
          redirectUrl: newCard.redirectUrl || `/${user?.username || 'user'}`,
        };

        await api.post('/api/nfc/cards', cardData);

        // 成功处理
        setNewCard({ name: '', serialNumber: '', redirectUrl: '' });
        setFormErrors({});
        await loadDashboardData();

        showNotification('NFC卡片创建成功！', 'success');
      } catch (error) {
        console.error('创建失败:', error);
        showNotification(error.response?.data?.message || '创建失败', 'error');
      } finally {
        setDashboardState(prev => ({ ...prev, creatingCard: false }));
      }
    },
    [newCard, user, validateForm, loadDashboardData],
  );

  // 删除卡片
  const handleDeleteCard = useCallback(
    async cardId => {
      if (!window.confirm('确定删除这张卡片？')) return;

      try {
        await api.delete(`/api/nfc/cards/${cardId}`);
        await loadDashboardData();
        showNotification('卡片已删除', 'success');
      } catch (error) {
        console.error('删除失败:', error);
        showNotification('删除失败', 'error');
      }
    },
    [loadDashboardData],
  );

  // 批量操作
  const handleSelectCard = useCallback(cardId => {
    setDashboardState(prev => {
      const newSelected = new Set(prev.selectedCards);
      newSelected.has(cardId) ? newSelected.delete(cardId) : newSelected.add(cardId);
      return { ...prev, selectedCards: newSelected };
    });
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedCount === 0) return;

    if (!window.confirm(`删除 ${selectedCount} 张卡片？`)) return;

    try {
      const promises = Array.from(dashboardState.selectedCards).map(id =>
        api.delete(`/api/nfc/cards/${id}`),
      );

      await Promise.all(promises);
      await loadDashboardData();
      setDashboardState(prev => ({ ...prev, selectedCards: new Set() }));
      showNotification(`已删除 ${selectedCount} 张卡片`, 'success');
    } catch (error) {
      console.error('批量删除失败:', error);
      showNotification('批量删除失败', 'error');
    }
  }, [selectedCount, dashboardState.selectedCards, loadDashboardData]);

  // 复制链接
  const copyShareLink = useCallback(async serialNumber => {
    const link = `${window.location.origin}/nfc/${serialNumber}`;
    try {
      await navigator.clipboard.writeText(link);
      showNotification('链接已复制', 'success');
    } catch {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('链接已复制', 'success');
    }
  }, []);

  // 工具函数
  const generateSerialNumber = () => {
    return 'NFC-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 初始加载
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 通知组件
  const Notification = () => {
    if (!notification) return null;

    const bgColor =
      notification.type === 'success'
        ? 'bg-green-100 border-green-400 text-green-700'
        : notification.type === 'error'
          ? 'bg-red-100 border-red-400 text-red-700'
          : 'bg-blue-100 border-blue-400 text-blue-700';

    return (
      <div
        className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg animate-fade-in ${bgColor}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
            aria-label="关闭通知"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // 骨架屏
  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      <div className="card">
        <div className="skeleton-text w-1/4 h-6 mb-4"></div>
        <div className="space-y-3">
          <div className="skeleton-text h-4"></div>
          <div className="skeleton-text h-4 w-2/3"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="skeleton-text h-20"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // 空状态
  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">{type === 'cards' ? '📇' : '📊'}</div>
      <p className="text-color-text-secondary mb-2">
        {type === 'cards' ? '还没有NFC卡片' : '暂无数据'}
      </p>
      <p className="text-sm text-color-text-tertiary">
        {type === 'cards' ? '创建你的第一张NFC卡片' : '开始使用后查看统计数据'}
      </p>
    </div>
  );

  if (dashboardState.loading) {
    return (
      <div className="min-h-screen bg-color-bg">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <SkeletonLoader />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color-bg">
      <DashboardHeader />
      <Notification />

      <main className="container mx-auto px-4 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-color-text-primary mb-2">
            欢迎回来，{dashboardState.profile.name || user?.username}！
          </h1>
          <p className="text-color-text-secondary">管理你的NFC电子名片，追踪扫描数据</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card hover-lift">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">📊</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  今日
                </span>
              </div>
              <div className="text-3xl font-bold text-color-text-primary mb-2">
                {dashboardState.analytics.today_scans || 0}
              </div>
              <div className="text-sm text-color-text-secondary">今日扫描</div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">📱</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  总计
                </span>
              </div>
              <div className="text-3xl font-bold text-color-text-primary mb-2">
                {dashboardState.analytics.total_scans || 0}
              </div>
              <div className="text-sm text-color-text-secondary">总扫描次数</div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">👥</span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  独立
                </span>
              </div>
              <div className="text-3xl font-bold text-color-text-primary mb-2">
                {dashboardState.analytics.unique_devices || 0}
              </div>
              <div className="text-sm text-color-text-secondary">独立设备</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：创建卡片 */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card hover-lift">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-color-text-primary">创建NFC卡片</h2>
              </div>

              <div className="card-body">
                <form onSubmit={handleCreateCard} className="space-y-4">
                  <div>
                    <label className="form-label">卡片名称 *</label>
                    <input
                      type="text"
                      value={newCard.name}
                      onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                      placeholder="例如：商务名片"
                      className={`form-input ${formErrors.name ? 'border-red-300' : ''}`}
                    />
                    {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={dashboardState.creatingCard}
                    >
                      {dashboardState.creatingCard ? '创建中...' : '创建卡片'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setNewCard({ name: '', serialNumber: '', redirectUrl: '' })}
                    >
                      重置
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* 卡片列表 */}
            <div className="card">
              <div className="card-header">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-color-text-primary">
                      我的卡片 ({dashboardState.nfcCards.length})
                    </h2>
                  </div>

                  <div className="flex items-center gap-4">
                    {selectedCount > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="btn bg-red-500 text-white hover:bg-red-600"
                      >
                        删除选中 ({selectedCount})
                      </button>
                    )}

                    <input
                      type="search"
                      value={dashboardState.searchQuery}
                      onChange={e =>
                        setDashboardState(prev => ({ ...prev, searchQuery: e.target.value }))
                      }
                      placeholder="搜索卡片..."
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="card-body">
                {filteredCards.length === 0 ? (
                  <EmptyState type="cards" />
                ) : (
                  <div className="space-y-4">
                    {filteredCards.map(card => (
                      <div
                        key={card.id}
                        className="border border-color-border rounded-lg p-4 hover:bg-color-surface-2 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={dashboardState.selectedCards.has(card.id)}
                              onChange={() => handleSelectCard(card.id)}
                              className="mt-1"
                            />

                            <div>
                              <h3 className="font-medium text-color-text-primary">{card.name}</h3>
                              <div className="mt-2 space-y-1 text-sm">
                                <div className="text-color-text-secondary">
                                  序列号: {card.serial_number}
                                </div>
                                <div className="text-color-text-secondary">
                                  扫描次数: {card.scan_count || 0}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => copyShareLink(card.serial_number)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              复制链接
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：快速操作 */}
          <div className="space-y-8">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-color-text-primary">快速操作</h3>
              </div>

              <div className="card-body space-y-4">
                <button
                  onClick={() => navigate('/editor')}
                  className="w-full flex items-center justify-between p-3 border border-color-border rounded-lg hover:bg-color-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✏️</span>
                    <span>编辑个人主页</span>
                  </div>
                  <span>→</span>
                </button>

                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full flex items-center justify-between p-3 border border-color-border rounded-lg hover:bg-color-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <span>查看详细分析</span>
                  </div>
                  <span>→</span>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center justify-between p-3 border border-color-border rounded-lg hover:bg-color-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚙️</span>
                    <span>账户设置</span>
                  </div>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* 使用指南 */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-color-text-primary">使用指南</h3>
              </div>

              <div className="card-body space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">1️⃣</span>
                  <div>
                    <div className="font-medium text-color-text-primary">创建卡片</div>
                    <div className="text-sm text-color-text-secondary">填写名称创建NFC卡片</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">2️⃣</span>
                  <div>
                    <div className="font-medium text-color-text-primary">分享链接</div>
                    <div className="text-sm text-color-text-secondary">复制链接分享给他人</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl">3️⃣</span>
                  <div>
                    <div className="font-medium text-color-text-primary">追踪数据</div>
                    <div className="text-sm text-color-text-secondary">查看扫描统计和分析</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-12 border-t border-color-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-color-text-secondary text-sm">
              © 2026 LinkHub NFC. 专为NFC电子名片设计。
            </div>

            <div className="flex gap-6 text-sm">
              <button
                onClick={() => navigate('/help')}
                className="text-color-text-secondary hover:text-color-text-primary transition-colors"
              >
                帮助中心
              </button>
              <button
                onClick={() => navigate('/privacy')}
                className="text-color-text-secondary hover:text-color-text-primary transition-colors"
              >
                隐私政策
              </button>
              <button
                onClick={() => navigate('/terms')}
                className="text-color-text-secondary hover:text-color-text-primary transition-colors"
              >
                服务条款
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
