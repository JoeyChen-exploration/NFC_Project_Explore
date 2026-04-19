import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard-design-system.css';

/**
 * 简化但有效的Dashboard
 * 直接应用设计系统工具类
 */
export default function SimpleDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCard, setNewCard] = useState({ name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/api/nfc/cards');
      setCards(res.data || []);
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!newCard.name.trim()) return;

    try {
      await api.post('/api/nfc/cards', {
        name: newCard.name,
        serialNumber: `NFC-${Date.now()}`,
        redirectUrl: `/${user?.username || 'user'}`,
      });
      setNewCard({ name: '' });
      await loadData();
      alert('卡片创建成功！');
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-color-bg p-8">
        <div className="container mx-auto">
          <div className="skeleton-card">
            <div className="skeleton-text w-1/4 mb-4"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-color-bg">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-color-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-bold text-color-text-primary">LinkHub NFC</span>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
                仪表板
              </button>
              <button onClick={() => navigate('/editor')} className="btn btn-ghost">
                编辑器
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-color-text-primary">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-color-text-primary mb-2">
            欢迎回来，{user?.username}！
          </h1>
          <p className="text-color-text-secondary">管理你的NFC电子名片</p>
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
              <div className="text-3xl font-bold text-color-text-primary mb-2">0</div>
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
              <div className="text-3xl font-bold text-color-text-primary mb-2">0</div>
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
              <div className="text-3xl font-bold text-color-text-primary mb-2">0</div>
              <div className="text-sm text-color-text-secondary">独立设备</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 创建卡片 */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-color-text-primary">创建NFC卡片</h2>
              </div>

              <div className="card-body">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">卡片名称 *</label>
                    <input
                      type="text"
                      value={newCard.name}
                      onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                      placeholder="例如：商务名片"
                      className="form-input"
                    />
                    <div className="form-help">建议使用简洁明了的名称</div>
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" className="btn btn-primary">
                      创建卡片
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setNewCard({ name: '' })}
                    >
                      重置
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* 卡片列表 */}
            <div className="card mt-8">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-color-text-primary">
                  我的卡片 ({cards.length})
                </h2>
              </div>

              <div className="card-body">
                {cards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📇</div>
                    <p className="text-color-text-secondary mb-2">还没有NFC卡片</p>
                    <p className="text-sm text-color-text-tertiary">创建你的第一张NFC卡片</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cards.map(card => (
                      <div
                        key={card.id}
                        className="border border-color-border rounded-lg p-4 hover:bg-color-surface-2 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-color-text-primary">{card.name}</h3>
                            <div className="mt-2 text-sm text-color-text-secondary">
                              序列号: {card.serial_number}
                            </div>
                          </div>
                          <button className="btn btn-outline text-sm">复制链接</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div>
            <div className="card mb-8">
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
              </div>
            </div>

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
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-color-border py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-color-text-secondary text-sm">
            © 2026 LinkHub NFC. 专为NFC电子名片设计。
          </div>
        </div>
      </footer>
    </div>
  );
}
