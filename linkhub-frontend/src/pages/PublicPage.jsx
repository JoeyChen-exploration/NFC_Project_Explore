import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import ProfilePreview from '../components/ProfilePreview';

export default function PublicPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getPublicPage(username)
      .then(setData)
      .catch(e => setError(e.message));
  }, [username]);

  function handleLinkClick(linkId) {
    api.trackClick(username, linkId).catch(() => {});
  }

  if (error)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#a3a3a3',
            marginBottom: 16,
          }}
        >
          404
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#0a0a0a',
            marginBottom: 8,
            letterSpacing: '-0.3px',
          }}
        >
          @{username} not found
        </div>
        <div style={{ fontSize: 14, color: '#a3a3a3', marginBottom: 32 }}>
          This page doesn't exist yet.
        </div>
        <a
          href="/login"
          style={{
            fontSize: 14,
            color: '#0a0a0a',
            fontWeight: 500,
            textDecoration: 'none',
            borderBottom: '1px solid #e5e5e5',
            paddingBottom: 2,
          }}
        >
          Create your page →
        </a>
      </div>
    );

  if (!data)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#d4d4d4',
                animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.25} 50%{opacity:1} }`}</style>
      </div>
    );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <ProfilePreview data={data} onLinkClick={handleLinkClick} />
      </div>
    </div>
  );
}
