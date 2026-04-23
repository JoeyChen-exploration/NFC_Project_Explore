import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { AppShell, AppTopbar } from '../components/AppShell';
import { useI18n } from '../hooks/useI18n';

const EMPTY_FORM = {
  card_name: '',
  card_serial: '',
};

function formatDate(value, locale) {
  if (!value) return locale === 'zh' ? '尚未使用' : 'Not used yet';

  try {
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
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
  const { tc, locale } = useI18n();
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
      setBanner({
        type: 'error',
        message: error.message || tc('加载仪表板失败', 'Failed to load dashboard'),
      });
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
      setBanner({ type: 'error', message: tc('请填写卡片名称。', 'Please enter a card name.') });
      return;
    }

    if (!isValidCardSerial(card_serial)) {
      setBanner({
        type: 'error',
        message: tc(
          '序列号格式不对，示例：04:A1:BC:9F。',
          'Invalid serial format, e.g. 04:A1:BC:9F.',
        ),
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.bindNfcCard({ card_name, card_serial });
      setForm(EMPTY_FORM);
      setBanner({
        type: 'success',
        message: tc('NFC 卡片绑定成功。', 'NFC card bound successfully.'),
      });
      await loadDashboard({ silent: true });
    } catch (error) {
      setBanner({
        type: 'error',
        message: error.message || tc('绑定卡片失败', 'Failed to bind card'),
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy(label, value) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setBanner({ type: 'success', message: tc(`${label}已复制。`, `${label} copied.`) });
    } catch {
      setBanner({
        type: 'error',
        message: tc(
          `复制${label}失败，请手动复制。`,
          `Failed to copy ${label}. Please copy manually.`,
        ),
      });
    }
  }

  async function handleToggleCard(card) {
    try {
      await api.updateNfcCard(card.id, { active: !card.active });
      await loadDashboard({ silent: true });
      setBanner({
        type: 'success',
        message: tc(`${card.card_name} 已更新状态。`, `${card.card_name} status updated.`),
      });
    } catch (error) {
      setBanner({
        type: 'error',
        message: error.message || tc('更新卡片状态失败', 'Failed to update card status'),
      });
    }
  }

  async function handleDeleteCard(cardId) {
    try {
      await api.deleteNfcCard(cardId);
      await loadDashboard({ silent: true });
      setBanner({ type: 'success', message: tc('卡片已解绑。', 'Card unbound.') });
    } catch (error) {
      setBanner({
        type: 'error',
        message: error.message || tc('解绑卡片失败', 'Failed to unbind card'),
      });
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
        subtitle={
          username
            ? tc(`@${username} 的 NFC 分发总览`, `@${username} NFC distribution overview`)
            : 'NFC dashboard'
        }
        actions={
          <>
            <button className="mono-btn-ghost" onClick={() => navigate('/analytics')}>
              {tc('分析', 'Analytics')}
            </button>
            <button className="mono-btn-muted" onClick={() => navigate('/editor')}>
              {tc('编辑主页', 'Edit page')}
            </button>
            <button className="mono-btn-ghost" onClick={() => loadDashboard({ silent: true })}>
              {refreshing ? tc('刷新中...', 'Refreshing...') : tc('刷新', 'Refresh')}
            </button>
            <button className="mono-btn" onClick={handleLogout}>
              {tc('退出', 'Logout')}
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
                {tc(
                  '这是你的分发中枢，不只是一个主页后台。',
                  'This is your distribution hub, not just a page admin.',
                )}
              </h1>
              <div
                className="mono-actions-inline"
                style={{ justifyContent: 'flex-start', marginTop: 24 }}
              >
                <button className="mono-btn" onClick={() => navigate('/editor')}>
                  {tc('继续完善主页', 'Continue editing page')}
                </button>
                <button
                  className="mono-btn-muted"
                  onClick={() => handleCopy(tc('主页链接', 'profile URL'), profileUrl)}
                >
                  {tc('复制主页链接', 'Copy profile URL')}
                </button>
                <button
                  className="mono-btn-ghost"
                  onClick={() => window.open(profileUrl, '_blank')}
                >
                  {tc('打开公开页', 'Open public page')}
                </button>
              </div>
            </div>

            <div className="mono-panel" style={{ background: 'rgba(255,255,255,0.56)' }}>
              <div className="mono-kicker">Current Signal</div>
              <h2 style={{ margin: '14px 0 8px', fontSize: '2rem', letterSpacing: '-0.05em' }}>
                {totalCards > 0
                  ? tc('已经可以开始分发', 'Ready for distribution')
                  : tc('先绑定第一张卡片', 'Bind your first card')}
              </h2>
              <p className="mono-panel-meta">
                {mostUsedCard
                  ? tc(
                      `目前最常用的是 ${mostUsedCard.card_name}，累计 ${mostUsedCard.scan_count || 0} 次扫描。`,
                      `Most-used card: ${mostUsedCard.card_name} with ${mostUsedCard.scan_count || 0} scans.`,
                    )
                  : tc(
                      '先打通第一条真实链路：卡片绑定、NFC 跳转、主页访问和链接点击。',
                      'Start by connecting the first full flow: bind card, NFC redirect, page view, link click.',
                    )}
              </p>
              <div className="mono-list-row" style={{ marginTop: 20 }}>
                <div className="mono-list-row-main">
                  <div className="mono-kicker">Public Page</div>
                  <div className="mono-note" style={{ marginTop: 6, wordBreak: 'break-all' }}>
                    {profileUrl ||
                      tc('登录后自动生成公开主页地址', 'Public URL appears after login')}
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
              {tc('正在整理你的 NFC 数据...', 'Preparing your NFC data...')}
            </div>
          </div>
        ) : (
          <>
            <section className="mono-grid-4" style={{ marginBottom: 20 }}>
              <Stat
                label={tc('卡片数', 'Cards')}
                value={totalCards}
                note={tc('绑定的 NFC 卡片', 'Bound NFC cards')}
              />
              <Stat
                label={tc('激活数', 'Active')}
                value={activeCards}
                note={tc('当前激活的卡片', 'Currently active cards')}
              />
              <Stat
                label={tc('扫描数', 'Scans')}
                value={totalScans}
                note={tc('累计 NFC 扫描', 'Total NFC scans')}
              />
              <Stat
                label={tc('访问 / 点击', 'Views / Clicks')}
                value={`${totalViews} / ${totalClicks}`}
                note={tc('公开页访问与点击', 'Public page views and clicks')}
              />
            </section>

            <section className="mono-grid-2">
              <div className="mono-panel">
                <div className="mono-panel-header">
                  <div>
                    <div className="mono-kicker">Bind New Card</div>
                    <h2>{tc('把真实卡片接入系统', 'Bind a real card')}</h2>
                  </div>
                  <span className="mono-badge">Max 20</span>
                </div>

                <form className="mono-stack" style={{ marginTop: 20 }} onSubmit={handleCreateCard}>
                  <div className="mono-field">
                    <label>{tc('卡片名称', 'Card Name')}</label>
                    <input
                      className="mono-input"
                      value={form.card_name}
                      placeholder={tc('例如：商务交换卡', 'e.g. Event card')}
                      onChange={event =>
                        setForm(current => ({ ...current, card_name: event.target.value }))
                      }
                    />
                  </div>
                  <div className="mono-field">
                    <label>{tc('芯片序列号', 'Card Serial')}</label>
                    <input
                      className="mono-input"
                      value={form.card_serial}
                      placeholder={tc('例如：04:A1:BC:9F', 'e.g. 04:A1:BC:9F')}
                      onChange={event =>
                        setForm(current => ({
                          ...current,
                          card_serial: normalizeSerial(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="mono-note">
                    {tc(
                      '支持十六进制和冒号格式。之后可以把 `/nfc/serial` 写入芯片。',
                      'Hex and colon format supported. Then write `/nfc/serial` to the chip.',
                    )}
                  </div>
                  <div className="mono-actions-inline" style={{ justifyContent: 'flex-start' }}>
                    <button className="mono-btn" type="submit" disabled={submitting}>
                      {submitting ? tc('绑定中...', 'Binding...') : tc('绑定卡片', 'Bind card')}
                    </button>
                    <button
                      className="mono-btn-ghost"
                      type="button"
                      onClick={() => setForm(EMPTY_FORM)}
                    >
                      {tc('清空', 'Clear')}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mono-panel">
                <div className="mono-panel-header">
                  <div>
                    <div className="mono-kicker">Direction</div>
                    <h2>{tc('接下来最值得推进的地方', 'What to improve next')}</h2>
                  </div>
                </div>
                <div className="mono-stack">
                  <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                    <strong>
                      {tc('先把公开页打磨成能承接注意力的页面。', 'Polish the public page first.')}
                    </strong>
                    <div className="mono-note" style={{ marginTop: 6 }}>
                      {tc(
                        'NFC 被扫之后，真正留住用户的是公开页，不是后台。',
                        'After an NFC tap, the public page retains users.',
                      )}
                    </div>
                  </div>
                  <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                    <strong>
                      {tc('不同场景对应不同卡片。', 'Different scenarios need different cards.')}
                    </strong>
                    <div className="mono-note" style={{ marginTop: 6 }}>
                      {tc(
                        '展会卡、销售卡、品牌卡，应该被当作不同触达入口来运营。',
                        'Treat event, sales, and brand cards as different entry points.',
                      )}
                    </div>
                  </div>
                  <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                    <strong>{tc('把分析页变成决策页。', 'Turn analytics into decisions.')}</strong>
                    <div className="mono-note" style={{ marginTop: 6 }}>
                      {tc(
                        '看趋势、看卡片、看点击，最后指向的是“哪种内容最有效”。',
                        'Trends, cards, and clicks should answer: what content performs best?',
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mono-panel" style={{ marginTop: 20 }}>
              <div className="mono-panel-header">
                <div>
                  <div className="mono-kicker">Bound Cards</div>
                  <h2>{tc('已绑定卡片', 'Bound cards')}</h2>
                </div>
                <span className="mono-badge">{tc(`${cards.length} 张`, `${cards.length}`)}</span>
              </div>

              {cards.length === 0 ? (
                <div className="mono-note">
                  {tc(
                    '还没有 NFC 卡片。绑定第一张之后，这个产品的价值会立刻具体起来。',
                    'No NFC cards yet. Bind the first card to activate the workflow.',
                  )}
                </div>
              ) : (
                <div className="mono-list">
                  {cards.map(card => (
                    <article key={card.id} className="mono-list-row">
                      <div className="mono-list-row-main">
                        <div className="mono-list-row-title">
                          <h3>{card.card_name}</h3>
                          <span className={`mono-status ${card.active ? 'is-live' : ''}`}>
                            {card.active ? tc('已启用', 'Active') : tc('已停用', 'Inactive')}
                          </span>
                        </div>
                        <div className="mono-list-row-meta">
                          <span>
                            {tc('序列号', 'Serial')} {card.card_serial}
                          </span>
                          <span>
                            {tc(`${card.scan_count || 0} 次扫描`, `${card.scan_count || 0} scans`)}
                          </span>
                          <span>{formatDate(card.last_used_at, locale)}</span>
                        </div>
                      </div>

                      <div className="mono-actions-inline">
                        <button
                          className="mono-btn-ghost"
                          onClick={() =>
                            handleCopy(
                              tc('卡片跳转地址', 'Card redirect URL'),
                              getNfcRedirectUrl(card.card_serial),
                            )
                          }
                        >
                          {tc('复制跳转地址', 'Copy redirect URL')}
                        </button>
                        <button className="mono-btn-muted" onClick={() => handleToggleCard(card)}>
                          {card.active ? tc('停用', 'Disable') : tc('启用', 'Enable')}
                        </button>
                        <button
                          className="mono-btn-ghost"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          {tc('解绑', 'Unbind')}
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
