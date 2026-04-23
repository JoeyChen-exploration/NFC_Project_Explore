import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import ProfilePreview from '../components/ProfilePreview';
import { AppShell, AppTopbar } from '../components/AppShell';

export default function PublicPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getPublicPage(username)
      .then(setData)
      .catch(err => setError(err.message || '页面加载失败'));
  }, [username]);

  function handleLinkClick(linkId) {
    api.trackClick(username, linkId).catch(() => {});
  }

  if (error) {
    return (
      <AppShell>
        <AppTopbar title="LinkHub" subtitle="Public page" />
        <div className="mono-public-wrap mono-empty">
          <div className="mono-panel" style={{ maxWidth: 520 }}>
            <div className="mono-kicker">404</div>
            <h1 style={{ margin: '12px 0 8px', fontSize: '2.4rem', letterSpacing: '-0.06em' }}>
              @{username} 还没有公开主页
            </h1>
            <p className="mono-copy" style={{ margin: '0 auto 20px' }}>
              {error}
            </p>
            <a className="mono-btn" href="/login" style={{ textDecoration: 'none' }}>
              创建你的页面
            </a>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <AppTopbar title="LinkHub" subtitle="Loading public profile" />
        <div className="mono-public-wrap mono-empty">
          <div className="mono-panel" style={{ textAlign: 'center', width: 320 }}>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="mono-note" style={{ marginTop: 12 }}>
              正在加载 @{username} 的主页...
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AppTopbar title={data.profile?.name || `@${username}`} subtitle={`@${username}`} />
      <div className="mono-public-wrap">
        <div className="mono-public-card">
          <ProfilePreview data={data} onLinkClick={handleLinkClick} />
        </div>
      </div>
    </AppShell>
  );
}
