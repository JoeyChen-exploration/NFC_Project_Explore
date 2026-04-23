import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useScreenSize } from '../../hooks/useScreenSize';
import { Card, SectionTitle, lightInputBase } from './ui';

// ── 图标 ────────────────────────────────────────────────────────────────

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

// ── NfcEditor 主组件 ─────────────────────────────────────────────────────

export default function NfcEditor() {
  const { isMobile } = useScreenSize();

  const [cards, setCards] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBindForm, setShowBindForm] = useState(false);
  const [bindSerial, setBindSerial] = useState('');
  const [bindName, setBindName] = useState('');
  const [bindError, setBindError] = useState('');
  const [binding, setBinding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 错误提示 */}
      {error && (
        <div
          style={{
            background: 'rgba(15,15,15,0.04)',
            border: '1px solid rgba(15,15,15,0.1)',
            borderRadius: 20,
            padding: 14,
            color: 'var(--mono-text)',
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
          }}
        >
          <StatCard
            label="总扫描次数"
            value={analytics.summary.total_scans}
            accent="var(--mono-text)"
          />
          <StatCard
            label="激活卡片"
            value={analytics.summary.active_cards}
            accent="var(--mono-text-soft)"
          />
          <StatCard
            label="绑定卡片"
            value={analytics.summary.total_cards}
            accent="var(--mono-text-muted)"
            style={isMobile ? { gridColumn: '1 / -1' } : {}}
          />
        </div>
      )}

      {/* ── 卡片列表 ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(15,15,15,0.08)',
          borderRadius: 28,
          boxShadow: '0 24px 56px rgba(15,15,15,0.07)',
          overflow: 'hidden',
        }}
      >
        {/* 列表标题栏 */}
        <div
          style={{
            padding: isMobile ? '14px 18px 10px' : '18px 22px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(15,15,15,0.08)',
          }}
        >
          <SectionTitle style={{ fontSize: 14 }}>NFC 卡片列表</SectionTitle>
          <button
            onClick={() => {
              setShowBindForm(v => !v);
              setBindError('');
            }}
            style={{
              background: 'var(--mono-text)',
              color: '#fff',
              border: '1px solid var(--mono-text)',
              borderRadius: 999,
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
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
              padding: isMobile ? '14px 18px' : '16px 22px',
              borderBottom: '1px solid rgba(15,15,15,0.08)',
              background: 'rgba(15,15,15,0.025)',
            }}
          >
            <div
              style={{ fontSize: 13, fontWeight: 700, color: 'var(--mono-text)', marginBottom: 10 }}
            >
              绑定新 NFC 卡片
            </div>
            {bindError && (
              <div
                style={{
                  background: 'rgba(15,15,15,0.04)',
                  border: '1px solid rgba(15,15,15,0.1)',
                  borderRadius: 18,
                  padding: '8px 12px',
                  color: 'var(--mono-text)',
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
                marginBottom: 8,
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
            <div style={{ fontSize: 12, color: 'var(--mono-text-muted)', marginBottom: 10 }}>
              序列号在 NFC 读卡器或手机 NFC 工具中可查看，通常为 8 位十六进制字符。
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={binding}
                style={{
                  background: 'var(--mono-text)',
                  color: '#fff',
                  border: '1px solid var(--mono-text)',
                  borderRadius: 999,
                  padding: '8px 16px',
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
                  background: 'rgba(255,255,255,0.84)',
                  border: '1px solid rgba(15,15,15,0.12)',
                  borderRadius: 999,
                  padding: '8px 14px',
                  fontSize: 13,
                  color: 'var(--mono-text)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                取消
              </button>
            </div>
          </form>
        )}

        {/* 加载 / 空状态 */}
        {loading && (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: 'var(--mono-text-muted)',
              fontSize: 14,
            }}
          >
            加载中...
          </div>
        )}
        {!loading && cards.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📇</div>
            <div
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--mono-text)', marginBottom: 6 }}
            >
              还没有绑定 NFC 卡片
            </div>
            <div style={{ fontSize: 13, color: 'var(--mono-text-muted)' }}>
              绑定后，扫描卡片自动跳转到你的个人主页。
            </div>
          </div>
        )}

        {/* 卡片行 */}
        {!loading &&
          cards.map(card => (
            <div
              key={card.id}
              style={{
                padding: isMobile ? '12px 18px' : '14px 22px',
                borderBottom: '1px solid rgba(15,15,15,0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: card.active ? 'rgba(15,15,15,0.05)' : 'rgba(15,15,15,0.035)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <NfcIcon
                  size={18}
                  color={card.active ? 'var(--mono-text)' : 'var(--mono-text-muted)'}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === card.id ? (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(card);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      style={{ ...inputStyle, flex: 1, padding: '4px 8px', fontSize: 14 }}
                    />
                    <button
                      onClick={() => handleRename(card)}
                      style={smallBtn('var(--mono-text)', '#fff')}
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={smallBtn(
                        'rgba(255,255,255,0.84)',
                        'var(--mono-text)',
                        '1px solid rgba(15,15,15,0.12)',
                      )}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 3,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mono-text)' }}>
                      {card.card_name}
                    </span>
                    {!card.active && (
                      <span
                        style={{
                          fontSize: 11,
                          background: 'rgba(15,15,15,0.05)',
                          color: 'var(--mono-text-muted)',
                          borderRadius: 999,
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
                    color: 'var(--mono-text-soft)',
                    fontFamily: 'monospace',
                    marginBottom: 3,
                  }}
                >
                  {card.card_serial}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--mono-text-muted)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '3px 10px',
                    marginBottom: 6,
                  }}
                >
                  <span>扫描 {card.scan_count} 次</span>
                  {card.last_used_at && (
                    <span>最近：{new Date(card.last_used_at).toLocaleDateString('zh-CN')}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--mono-text-muted)',
                      fontFamily: 'monospace',
                      background: 'rgba(15,15,15,0.03)',
                      border: '1px solid rgba(15,15,15,0.08)',
                      borderRadius: 999,
                      padding: '2px 6px',
                      maxWidth: 220,
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
                      color: 'var(--mono-text)',
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                <button
                  onClick={() => {
                    setEditingId(card.id);
                    setEditName(card.card_name);
                  }}
                  style={actionBtn}
                >
                  重命名
                </button>
                <button
                  onClick={() => handleToggleActive(card)}
                  style={{ ...actionBtn, color: 'var(--mono-text)' }}
                >
                  {card.active ? '停用' : '激活'}
                </button>
                {confirmDeleteId === card.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleDelete(card.id)}
                      style={smallBtn('var(--mono-text)', '#fff')}
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      style={smallBtn(
                        'rgba(255,255,255,0.84)',
                        'var(--mono-text)',
                        '1px solid rgba(15,15,15,0.12)',
                      )}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(card.id)}
                    style={{ ...actionBtn, color: 'var(--mono-text)' }}
                  >
                    解绑
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* ── 使用说明 ── */}
      <Card>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--mono-text-muted)',
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
            ['2', '绑定卡片', '点击「绑定新卡片」，输入序列号和名称'],
            ['3', '写入 NFC 卡片', `将扫描链接写入卡片：${window.location.origin}/nfc/<序列号>`],
            ['4', '分享名片', '别人扫描卡片，自动跳转到你的个人主页'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(15,15,15,0.06)',
                  color: 'var(--mono-text)',
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
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--mono-text)',
                    marginBottom: 2,
                  }}
                >
                  {title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--mono-text-soft)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── 子组件 & 局部样式 ────────────────────────────────────────────────────

function StatCard({ label, value, accent, style = {} }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(15,15,15,0.08)',
        borderRadius: 24,
        padding: '16px 18px',
        boxShadow: '0 20px 50px rgba(15,15,15,0.06)',
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: accent,
          fontFamily: "'DM Serif Display', serif",
          marginBottom: 4,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--mono-text-soft)' }}>{label}</div>
    </div>
  );
}

const inputStyle = {
  flex: 1,
  border: '1px solid rgba(15,15,15,0.12)',
  borderRadius: 18,
  padding: '11px 13px',
  fontSize: 14,
  fontFamily: 'var(--font-ui)',
  outline: 'none',
  background: 'rgba(255,255,255,0.9)',
  color: 'var(--mono-text)',
  width: '100%',
  boxSizing: 'border-box',
};

const actionBtn = {
  background: 'rgba(255,255,255,0.84)',
  border: '1px solid rgba(15,15,15,0.12)',
  borderRadius: 999,
  padding: '7px 10px',
  fontSize: 12,
  color: 'var(--mono-text)',
  cursor: 'pointer',
  fontFamily: 'var(--font-ui)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

function smallBtn(bg, color, border = 'none') {
  return {
    background: bg,
    color,
    border,
    borderRadius: 999,
    padding: '7px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
}
