import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useScreenSize } from '../hooks/useScreenSize';

export default function NfcPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();

  const [cards, setCards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 绑定表单状态
  const [showBindForm, setShowBindForm] = useState(false);
  const [bindSerial, setBindSerial] = useState('');
  const [bindName, setBindName] = useState('');
  const [bindError, setBindError] = useState('');
  const [binding, setBinding] = useState(false);

  // 编辑状态
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // 删除确认
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    Promise.all([api.getNfcCards(), api.getNfcAnalytics()])
      .then(([cardsRes, analyticsRes]) => {
        setCards(cardsRes.cards);
        setAnalytics(analyticsRes);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleBind(e) {
    e.preventDefault();
    setBindError('');
    setBinding(true);
    try {
      const res = await api.bindNfcCard({ card_serial: bindSerial, card_name: bindName });
      setCards(prev => [res.card, ...prev]);
      setAnalytics(prev =>
        prev
          ? {
              ...prev,
              summary: {
                ...prev.summary,
                total_cards: prev.summary.total_cards + 1,
                active_cards: prev.summary.active_cards + 1,
              },
            }
          : prev,
      );
      setShowBindForm(false);
      setBindSerial('');
      setBindName('');
    } catch (e) {
      setBindError(e.message);
    } finally {
      setBinding(false);
    }
  }

  async function handleToggleActive(card) {
    try {
      const res = await api.updateNfcCard(card.id, { active: !card.active });
      setCards(prev => prev.map(c => (c.id === card.id ? res.card : c)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRename(card) {
    if (!editName.trim()) return;
    try {
      const res = await api.updateNfcCard(card.id, { card_name: editName.trim() });
      setCards(prev => prev.map(c => (c.id === card.id ? res.card : c)));
      setEditingId(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteNfcCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
      setConfirmDeleteId(null);
    } catch (e) {
      setError(e.message);
    }
  }

  const scanUrl = serial => `${window.location.origin}/nfc/${serial}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f4f5',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── 顶部导航 ── */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 28px',
          height: 56,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 20 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: 'var(--c-accent)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>L</span>
          </div>
          {!isMobile && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#111',
                fontFamily: "'DM Serif Display', serif",
              }}
            >
              LinkHub
            </span>
          )}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          ← {isMobile ? '返回' : '返回编辑器'}
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <NfcIcon size={16} color="var(--c-accent)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>NFC 卡片</span>
          {!isMobile && <span style={{ fontSize: 13, color: '#9ca3af' }}>@{user?.username}</span>}
        </div>
      </header>

      {/* ── 内容区 ── */}
      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: isMobile ? '20px 16px' : '32px 24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: 14,
              color: '#dc2626',
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* ── 统计概览 ── */}
        {analytics && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="总扫描次数"
              value={analytics.summary.total_scans}
              accent="var(--c-accent)"
            />
            <StatCard label="激活卡片" value={analytics.summary.active_cards} accent="#059669" />
            <StatCard
              label="绑定卡片"
              value={analytics.summary.total_cards}
              accent="#0891b2"
              style={isMobile ? { gridColumn: '1 / -1' } : {}}
            />
          </div>
        )}

        {/* ── 卡片列表 ── */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px 18px 12px' : '20px 24px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              NFC 卡片列表
            </div>
            <button
              onClick={() => {
                setShowBindForm(v => !v);
                setBindError('');
              }}
              style={{
                background: 'var(--c-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              + 绑定新卡片
            </button>
          </div>

          {/* 绑定表单 */}
          {showBindForm && (
            <form
              onSubmit={handleBind}
              style={{
                padding: isMobile ? '14px 18px' : '18px 24px',
                borderBottom: '1px solid #f3f4f6',
                background: '#f8fafc',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                绑定新 NFC 卡片
              </div>
              {bindError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#dc2626',
                    fontSize: 13,
                    marginBottom: 10,
                  }}
                >
                  {bindError}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <input
                  required
                  placeholder="卡片序列号（如：04A3B2C1）"
                  value={bindSerial}
                  onChange={e => setBindSerial(e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="卡片名称（可选）"
                  value={bindName}
                  onChange={e => setBindName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                序列号在 NFC 读卡器或手机 NFC 工具中可查看，通常为 8 位十六进制字符。
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={binding}
                  style={{
                    background: 'var(--c-accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: binding ? 'not-allowed' : 'pointer',
                    opacity: binding ? 0.7 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  {binding ? '绑定中...' : '确认绑定'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBindForm(false);
                    setBindError('');
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 13,
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          )}

          {loading && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              加载中...
            </div>
          )}

          {!loading && cards.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📇</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                还没有绑定 NFC 卡片
              </div>
              <div style={{ fontSize: 13, color: '#9ca3af', maxWidth: 320, margin: '0 auto' }}>
                绑定 NFC 名片后，有人扫描卡片会自动跳转到你的个人主页。
              </div>
            </div>
          )}

          {!loading &&
            cards.map(card => (
              <div
                key={card.id}
                style={{
                  padding: isMobile ? '14px 18px' : '16px 24px',
                  borderBottom: '1px solid #f9fafb',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                {/* 卡片图标 */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: card.active ? 'var(--c-surface-2)' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <NfcIcon size={20} color={card.active ? 'var(--c-accent)' : '#9ca3af'} />
                </div>

                {/* 卡片信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === card.id ? (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(card);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        style={{ ...inputStyle, flex: 1, padding: '5px 10px', fontSize: 14 }}
                      />
                      <button
                        onClick={() => handleRename(card)}
                        style={smallBtnStyle('var(--c-accent)', '#fff')}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={smallBtnStyle('none', '#6b7280', '1px solid #e5e7eb')}
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
                        {card.card_name}
                      </span>
                      {!card.active && (
                        <span
                          style={{
                            fontSize: 11,
                            background: '#f3f4f6',
                            color: '#9ca3af',
                            borderRadius: 4,
                            padding: '2px 6px',
                            fontWeight: 600,
                          }}
                        >
                          已停用
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: 12,
                      color: '#6b7280',
                      fontFamily: 'monospace',
                      marginBottom: 4,
                    }}
                  >
                    {card.card_serial}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px 12px',
                    }}
                  >
                    <span>扫描 {card.scan_count} 次</span>
                    {card.last_used_at && (
                      <span>最近：{new Date(card.last_used_at).toLocaleDateString('zh-CN')}</span>
                    )}
                    {card.activated_at && (
                      <span>激活：{new Date(card.activated_at).toLocaleDateString('zh-CN')}</span>
                    )}
                  </div>

                  {/* 扫描链接 */}
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        fontFamily: 'monospace',
                        background: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        borderRadius: 4,
                        padding: '2px 6px',
                        maxWidth: 280,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {scanUrl(card.card_serial)}
                    </span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(scanUrl(card.card_serial))}
                      style={{
                        fontSize: 11,
                        color: 'var(--c-accent)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        fontFamily: 'inherit',
                      }}
                    >
                      复制
                    </button>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      setEditingId(card.id);
                      setEditName(card.card_name);
                    }}
                    style={actionBtnStyle}
                  >
                    重命名
                  </button>
                  <button
                    onClick={() => handleToggleActive(card)}
                    style={{ ...actionBtnStyle, color: card.active ? '#dc2626' : '#059669' }}
                  >
                    {card.active ? '停用' : '激活'}
                  </button>
                  {confirmDeleteId === card.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleDelete(card.id)}
                        style={smallBtnStyle('#dc2626', '#fff')}
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={smallBtnStyle('none', '#6b7280', '1px solid #e5e7eb')}
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(card.id)}
                      style={{ ...actionBtnStyle, color: '#dc2626' }}
                    >
                      解绑
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* ── 使用说明 ── */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: isMobile ? '16px 18px' : '20px 24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 14,
            }}
          >
            使用说明
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['1', '获取卡片序列号', '使用手机 NFC 工具（如 NFC Tools）读取卡片序列号'],
              ['2', '绑定卡片', '点击「绑定新卡片」，输入序列号和卡片名称'],
              [
                '3',
                '写入 NFC 卡片',
                `将扫描链接写入 NFC 卡片：${window.location.origin}/nfc/<序列号>`,
              ],
              ['4', '分享名片', '别人用手机扫描 NFC 卡片，自动跳转到你的个人主页'],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--c-surface-2)',
                    color: 'var(--c-accent)',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {num}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 子组件 & 样式 ────────────────────────────────────────────────────────

function StatCard({ label, value, accent, style = {} }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: accent,
          fontFamily: "'DM Serif Display', serif",
          marginBottom: 4,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
    </div>
  );
}

function NfcIcon({ size = 20, color = 'var(--c-accent)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
      <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
      <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
      <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
    </svg>
  );
}

const inputStyle = {
  flex: 1,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  background: '#fff',
  color: '#111',
  width: '100%',
  boxSizing: 'border-box',
};

const actionBtnStyle = {
  background: 'none',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: '5px 10px',
  fontSize: 12,
  color: '#374151',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  whiteSpace: 'nowrap',
};

function smallBtnStyle(bg, color, border = 'none') {
  return {
    background: bg,
    color,
    border,
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
  };
}
