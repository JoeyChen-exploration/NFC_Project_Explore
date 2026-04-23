import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { AppShell, AppTopbar } from '../components/AppShell';

const EMPTY_FORM = {
  card_name: '',
  card_serial: '',
};

function formatDate(value) {
  if (!value) return '尚未使用';

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function normalizeSerial(value) {
  return value
    .toUpperCase()
    .replace(/[^A-F0-9:]/g, '')
    .replace(/:{2,}/g, ':')
    .replace(/^:|:$/g, '');
}

function isValidCardSerial(value) {
  return /^[A-F0-9:]{4,32}$/.test(value);
}

function getPublicProfileUrl(username) {
  if (!username) return '';
  return `${window.location.origin}/${username}`;
}

function getNfcRedirectUrl(serial) {
  if (!serial) return '';
  const frontendOrigin = window.location.origin;
  const backendOrigin = frontendOrigin.includes(':5173') ? 'http://localhost:3001' : frontendOrigin;
  return `${backendOrigin}/nfc/${serial}`;
}

function Stat({ label, value, note }) {
  return (
    <div className="mono-stat">
      <div className="mono-kicker">{label}</div>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}

export default function SimpleDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [nfcStats, setNfcStats] = useState(null);
  const [webStats, setWebStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const username = user?.username || '';
  const profileUrl = useMemo(() => getPublicProfileUrl(username), [username]);
  const totalScans = nfcStats?.summary?.total_scans || 0;
  const totalCards = nfcStats?.summary?.total_cards || cards.length;
  const activeCards = nfcStats?.summary?.active_cards || 0;
  const totalViews = webStats?.summary?.total_page_views || 0;
  const totalClicks = webStats?.summary?.total_link_clicks || 0;
  const clickRate = totalViews > 0 ? `${Math.round((totalClicks / totalViews) * 100)}%` : '0%';
  const mostUsedCard = cards.reduce(
    (best, card) => ((card.scan_count || 0) > (best?.scan_count || 0) ? card : best),
    null,
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!banner) return undefined;
    const timer = window.setTimeout(() => setBanner(null), 2800);
    return () => window.clearTimeout(timer);
  }, [banner]);

  async function loadDashboard({ silent = false } = {}) {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [cardsRes, nfcRes, webRes] = await Promise.all([
        api.getNfcCards(),
        api.getNfcAnalytics(),
        api.getAnalytics(),
      ]);
      setCards(cardsRes.cards || []);
      setNfcStats(nfcRes);
      setWebStats(webRes);
    } catch (error) {
      setBanner({ type: 'error', message: error.message || '加载仪表板失败' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleCreateCard(event) {
    event.preventDefault();
    const card_name = form.card_name.trim();
    const card_serial = normalizeSerial(form.card_serial);

    if (!card_name) {
      setBanner({ type: 'error', message: '请填写卡片名称。' });
      return;
    }

    if (!isValidCardSerial(card_serial)) {
      setBanner({ type: 'error', message: '序列号格式不对，示例：04:A1:BC:9F。' });
      return;
    }

    setSubmitting(true);
    try {
      await api.bindNfcCard({ card_name, card_serial });
      setForm(EMPTY_FORM);
      setBanner({ type: 'success', message: 'NFC 卡片绑定成功。' });
      await loadDashboard({ silent: true });
    } catch (error) {
      setBanner({ type: 'error', message: error.message || '绑定卡片失败' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy(label, value) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setBanner({ type: 'success', message: `${label}已复制。` });
    } catch {
      setBanner({ type: 'error', message: `复制${label}失败，请手动复制。` });
    }
  }

  async function handleToggleCard(card) {
    try {
      await api.updateNfcCard(card.id, { active: !card.active });
      await loadDashboard({ silent: true });
      setBanner({ type: 'success', message: `${card.card_name} 已更新状态。` });
    } catch (error) {
      setBanner({ type: 'error', message: error.message || '更新卡片状态失败' });
    }
  }

  async function handleDeleteCard(cardId) {
    try {
      await api.deleteNfcCard(cardId);
      await loadDashboard({ silent: true });
      setBanner({ type: 'success', message: '卡片已解绑。' });
    } catch (error) {
      setBanner({ type: 'error', message: error.message || '解绑卡片失败' });
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AppShell>
      <AppTopbar
        title="Dashboard"
        subtitle={username ? `@${username} 的 NFC 分发总览` : 'NFC dashboard'}
        actions={
          <>
            <button className="mono-btn-ghost" onClick={() => navigate('/analytics')}>
              分析
            </button>
            <button className="mono-btn-muted" onClick={() => navigate('/editor')}>
              编辑主页
            </button>
            <button className="mono-btn-ghost" onClick={() => loadDashboard({ silent: true })}>
              {refreshing ? '刷新中...' : '刷新'}
            </button>
            <button className="mono-btn" onClick={handleLogout}>
              退出
            </button>
          </>
        }
      />

      <main className="mono-main">
        <section className="mono-panel" style={{ marginBottom: 20 }}>
          <div className="mono-grid-2">
            <div>
              <div className="mono-kicker">NFC Identity Control</div>
              <h1 style={{ margin: '14px 0 12px', fontSize: '3rem', letterSpacing: '-0.06em' }}>
                这是你的分发中枢，不只是一个主页后台。
              </h1>
              <p className="mono-copy">
                现在这套 dashboard 已经围绕真实业务链路来组织：公开页、NFC
                卡片、扫描和点击都在同一个界面里协作，而不是被拆成几块松散的功能。
              </p>
              <div
                className="mono-actions-inline"
                style={{ justifyContent: 'flex-start', marginTop: 24 }}
              >
                <button className="mono-btn" onClick={() => navigate('/editor')}>
                  继续完善主页
                </button>
                <button
                  className="mono-btn-muted"
                  onClick={() => handleCopy('主页链接', profileUrl)}
                >
                  复制主页链接
                </button>
                <button
                  className="mono-btn-ghost"
                  onClick={() => window.open(profileUrl, '_blank')}
                >
                  打开公开页
                </button>
              </div>
            </div>

            <div className="mono-panel" style={{ background: 'rgba(255,255,255,0.56)' }}>
              <div className="mono-kicker">Current Signal</div>
              <h2 style={{ margin: '14px 0 8px', fontSize: '2rem', letterSpacing: '-0.05em' }}>
                {totalCards > 0 ? '已经可以开始分发' : '先绑定第一张卡片'}
              </h2>
              <p className="mono-panel-meta">
                {mostUsedCard
                  ? `目前最常用的是 ${mostUsedCard.card_name}，累计 ${mostUsedCard.scan_count || 0} 次扫描。`
                  : '先打通第一条真实链路：卡片绑定、NFC 跳转、主页访问和链接点击。'}
              </p>
              <div className="mono-list-row" style={{ marginTop: 20 }}>
                <div className="mono-list-row-main">
                  <div className="mono-kicker">Public Page</div>
                  <div className="mono-note" style={{ marginTop: 6, wordBreak: 'break-all' }}>
                    {profileUrl || '登录后自动生成公开主页地址'}
                  </div>
                </div>
                <div className="mono-badge">{clickRate} CTR</div>
              </div>
            </div>
          </div>
        </section>

        {banner && (
          <div
            className={`mono-alert ${banner.type === 'error' ? 'is-error' : 'is-success'}`}
            style={{ marginBottom: 20 }}
          >
            {banner.message}
          </div>
        )}

        {loading ? (
          <div className="mono-panel" style={{ textAlign: 'center' }}>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="mono-note" style={{ marginTop: 12 }}>
              正在整理你的 NFC 数据...
            </div>
          </div>
        ) : (
          <>
            <section className="mono-grid-4" style={{ marginBottom: 20 }}>
              <Stat label="Cards" value={totalCards} note="绑定的 NFC 卡片" />
              <Stat label="Active" value={activeCards} note="当前激活的卡片" />
              <Stat label="Scans" value={totalScans} note="累计 NFC 扫描" />
              <Stat
                label="Views / Clicks"
                value={`${totalViews} / ${totalClicks}`}
                note="公开页访问与点击"
              />
            </section>

            <section className="mono-grid-2">
              <div className="mono-panel">
                <div className="mono-panel-header">
                  <div>
                    <div className="mono-kicker">Bind New Card</div>
                    <h2>把真实卡片接入系统</h2>
                  </div>
                  <span className="mono-badge">Max 20</span>
                </div>
                <p className="mono-panel-meta">
                  保持流程简单但真实可用。输入卡片名称和芯片序列号后，就能开始追踪扫描表现。
                </p>

                <form className="mono-stack" style={{ marginTop: 20 }} onSubmit={handleCreateCard}>
                  <div className="mono-field">
                    <label>Card Name</label>
                    <input
                      className="mono-input"
                      value={form.card_name}
                      placeholder="例如：商务交换卡"
                      onChange={event =>
                        setForm(current => ({ ...current, card_name: event.target.value }))
                      }
                    />
                  </div>
                  <div className="mono-field">
                    <label>Card Serial</label>
                    <input
                      className="mono-input"
                      value={form.card_serial}
                      placeholder="例如：04:A1:BC:9F"
                      onChange={event =>
                        setForm(current => ({
                          ...current,
                          card_serial: normalizeSerial(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="mono-note">
                    支持十六进制和冒号格式。之后可以把 `/nfc/serial` 写入芯片。
                  </div>
                  <div className="mono-actions-inline" style={{ justifyContent: 'flex-start' }}>
                    <button className="mono-btn" type="submit" disabled={submitting}>
                      {submitting ? '绑定中...' : '绑定卡片'}
                    </button>
                    <button
                      className="mono-btn-ghost"
                      type="button"
                      onClick={() => setForm(EMPTY_FORM)}
                    >
                      清空
                    </button>
                  </div>
                </form>
              </div>

              <div className="mono-panel">
                <div className="mono-panel-header">
                  <div>
                    <div className="mono-kicker">Direction</div>
                    <h2>接下来最值得推进的地方</h2>
                  </div>
                </div>
                <div className="mono-stack">
                  <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                    <strong>先把公开页打磨成能承接注意力的页面。</strong>
                    <div className="mono-note" style={{ marginTop: 6 }}>
                      NFC 被扫之后，真正留住用户的是公开页，不是后台。
                    </div>
                  </div>
                  <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                    <strong>不同场景对应不同卡片。</strong>
                    <div className="mono-note" style={{ marginTop: 6 }}>
                      展会卡、销售卡、品牌卡，应该被当作不同触达入口来运营。
                    </div>
                  </div>
                  <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                    <strong>把分析页变成决策页。</strong>
                    <div className="mono-note" style={{ marginTop: 6 }}>
                      看趋势、看卡片、看点击，最后指向的是“哪种内容最有效”。
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mono-panel" style={{ marginTop: 20 }}>
              <div className="mono-panel-header">
                <div>
                  <div className="mono-kicker">Bound Cards</div>
                  <h2>已绑定卡片</h2>
                </div>
                <span className="mono-badge">{cards.length} 张</span>
              </div>

              {cards.length === 0 ? (
                <div className="mono-note">
                  还没有 NFC 卡片。绑定第一张之后，这个产品的价值会立刻具体起来。
                </div>
              ) : (
                <div className="mono-list">
                  {cards.map(card => (
                    <article key={card.id} className="mono-list-row">
                      <div className="mono-list-row-main">
                        <div className="mono-list-row-title">
                          <h3>{card.card_name}</h3>
                          <span className={`mono-status ${card.active ? 'is-live' : ''}`}>
                            {card.active ? '已启用' : '已停用'}
                          </span>
                        </div>
                        <div className="mono-list-row-meta">
                          <span>序列号 {card.card_serial}</span>
                          <span>{card.scan_count || 0} 次扫描</span>
                          <span>{formatDate(card.last_used_at)}</span>
                        </div>
                      </div>

                      <div className="mono-actions-inline">
                        <button
                          className="mono-btn-ghost"
                          onClick={() =>
                            handleCopy('卡片跳转地址', getNfcRedirectUrl(card.card_serial))
                          }
                        >
                          复制跳转地址
                        </button>
                        <button className="mono-btn-muted" onClick={() => handleToggleCard(card)}>
                          {card.active ? '停用' : '启用'}
                        </button>
                        <button
                          className="mono-btn-ghost"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          解绑
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}
