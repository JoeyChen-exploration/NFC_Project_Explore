import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import AccessibleButton from '../components/AccessibleButton';
import AccessibleInput from '../components/AccessibleInput';

/**
 * 专注的NFC电子名片仪表板
 * 简化界面，专注于NFC核心功能
 */
export default function NfcFocusedDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 状态管理
  const [nfcCards, setNfcCards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingCard, setCreatingCard] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    username: '',
  });

  // 新卡片表单
  const [newCard, setNewCard] = useState({
    name: '',
    serialNumber: '',
    redirectUrl: '',
  });

  // 加载数据
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [cardsRes, analyticsRes, profileRes] = await Promise.all([
        api.get('/api/nfc/cards'),
        api.get('/api/nfc/analytics'),
        api.get('/api/profile'),
      ]);

      setNfcCards(cardsRes.data || []);
      setAnalytics(analyticsRes.data || {});
      setProfile(profileRes.data || {});
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建NFC卡片
  const handleCreateCard = async e => {
    e.preventDefault();

    if (!newCard.name.trim()) {
      alert('请输入卡片名称');
      return;
    }

    try {
      setCreatingCard(true);

      // 如果没有提供序列号，生成一个
      const cardData = {
        ...newCard,
        serialNumber: newCard.serialNumber || generateSerialNumber(),
        redirectUrl: newCard.redirectUrl || `/${user?.username || 'user'}`,
      };

      await api.post('/api/nfc/cards', cardData);

      // 重置表单并刷新数据
      setNewCard({ name: '', serialNumber: '', redirectUrl: '' });
      await loadDashboardData();

      alert('NFC卡片创建成功！');
    } catch (error) {
      console.error('创建卡片失败:', error);
      alert(error.response?.data?.message || '创建失败，请重试');
    } finally {
      setCreatingCard(false);
    }
  };

  // 删除NFC卡片
  const handleDeleteCard = async cardId => {
    if (!confirm('确定要删除这个NFC卡片吗？')) return;

    try {
      await api.delete(`/api/nfc/cards/${cardId}`);
      await loadDashboardData();
      alert('卡片已删除');
    } catch (error) {
      console.error('删除卡片失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 生成随机序列号
  const generateSerialNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'NFC-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 复制分享链接
  const copyShareLink = serialNumber => {
    const link = `${window.location.origin}/nfc/${serialNumber}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert('链接已复制到剪贴板'))
      .catch(() => alert('复制失败，请手动复制链接'));
  };

  // 格式化日期
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mx-auto mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">LinkHub NFC</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                专注电子名片
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">{profile.name || user?.username}</div>
              <button
                onClick={() => navigate('/bento')}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                返回网格
              </button>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            欢迎回来，{profile.name || user?.username}！
          </h2>
          <p className="text-gray-600">管理你的NFC电子名片，追踪扫描数据，分享专业联系方式。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：NFC卡片管理 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 创建新卡片 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">创建新NFC卡片</h3>

              <form onSubmit={handleCreateCard} className="space-y-4">
                <AccessibleInput
                  label="卡片名称"
                  value={newCard.name}
                  onChange={e => setNewCard({ ...newCard, name: e.target.value })}
                  placeholder="例如：商务名片、活动名片"
                  required
                />

                <AccessibleInput
                  label="序列号（可选）"
                  value={newCard.serialNumber}
                  onChange={e => setNewCard({ ...newCard, serialNumber: e.target.value })}
                  placeholder="留空自动生成"
                  helperText="用于识别NFC芯片的唯一标识"
                />

                <AccessibleInput
                  label="重定向链接（可选）"
                  value={newCard.redirectUrl}
                  onChange={e => setNewCard({ ...newCard, redirectUrl: e.target.value })}
                  placeholder={`/${user?.username || 'user'}`}
                  helperText="扫描后跳转的链接，默认为你的个人主页"
                />

                <div className="flex space-x-4">
                  <AccessibleButton
                    type="submit"
                    variant="primary"
                    isLoading={creatingCard}
                    disabled={creatingCard}
                  >
                    {creatingCard ? '创建中...' : '创建NFC卡片'}
                  </AccessibleButton>

                  <AccessibleButton
                    type="button"
                    variant="secondary"
                    onClick={() => setNewCard({ name: '', serialNumber: '', redirectUrl: '' })}
                  >
                    重置
                  </AccessibleButton>
                </div>
              </form>
            </div>

            {/* 我的NFC卡片 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">我的NFC卡片</h3>
                <span className="text-sm text-gray-500">{nfcCards.length} 张卡片</span>
              </div>

              {nfcCards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📇</div>
                  <p className="text-gray-500 mb-4">还没有NFC卡片</p>
                  <p className="text-sm text-gray-400">点击上方的"创建NFC卡片"开始使用</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nfcCards.map(card => (
                    <div
                      key={card.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{card.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">序列号: {card.serial_number}</p>
                          <p className="text-sm text-gray-500">
                            创建时间: {formatDate(card.created_at)}
                          </p>
                          <p className="text-sm text-gray-500">扫描次数: {card.scan_count || 0}</p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyShareLink(card.serial_number)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            复制链接
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          扫描链接: {window.location.origin}/nfc/{card.serial_number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：统计和设置 */}
          <div className="space-y-8">
            {/* 扫描统计 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">扫描统计</h3>

              {analytics?.total_scans ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{analytics.total_scans}</div>
                    <div className="text-sm text-gray-500">总扫描次数</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-900">
                        {analytics.unique_scanners || 0}
                      </div>
                      <div className="text-xs text-gray-500">独立设备</div>
                    </div>

                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-900">
                        {analytics.today_scans || 0}
                      </div>
                      <div className="text-xs text-gray-500">今日扫描</div>
                    </div>
                  </div>

                  {analytics.most_scanned_card && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">最受欢迎的卡片:</p>
                      <p className="font-medium text-gray-900">
                        {analytics.most_scanned_card.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {analytics.most_scanned_card.scan_count} 次扫描
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-500">暂无扫描数据</p>
                  <p className="text-sm text-gray-400 mt-2">开始分享你的NFC卡片来收集数据</p>
                </div>
              )}
            </div>

            {/* 快速设置 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速设置</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    个人主页链接
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={`${window.location.origin}/${user?.username || 'user'}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-gray-600 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${window.location.origin}/${user?.username || 'user'}`,
                        )
                      }
                      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      复制
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">主题样式</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded text-gray-700">
                    <option>黑白简约</option>
                    <option>深色模式</option>
                    <option>浅色模式</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    进入完整编辑器
                  </button>
                </div>
              </div>
            </div>

            {/* 使用指南 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 使用指南</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>1. 创建NFC卡片并填写信息</li>
                <li>2. 将卡片链接写入NFC芯片</li>
                <li>3. 分享NFC卡片给他人</li>
                <li>4. 在统计中查看扫描数据</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">LinkHub NFC · 专注的电子名片平台</p>
            <p className="text-xs text-gray-400 mt-1">简单 · 快速 · 专注</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
