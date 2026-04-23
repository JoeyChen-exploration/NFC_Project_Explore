import { useState, useEffect } from 'react';
import { THEMES, SOCIAL_LIST, SOCIAL_ICONS } from './themes';

function usePreviewScreen() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
}

function ensureAbsoluteUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function normalizeSocialUrl(platform, rawValue) {
  const value = (rawValue || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  const withoutAt = value.replace(/^@+/, '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${withoutAt}`;
    case 'twitter':
      return `https://x.com/${withoutAt}`;
    case 'github':
      return `https://github.com/${withoutAt}`;
    case 'youtube':
      return `https://youtube.com/${withoutAt.replace(/^@/, '')}`;
    case 'tiktok':
      return `https://tiktok.com/${withoutAt.startsWith('@') ? withoutAt : `@${withoutAt}`}`;
    case 'website':
      return ensureAbsoluteUrl(withoutAt);
    default:
      return ensureAbsoluteUrl(withoutAt);
  }
}

export default function ProfilePreview({ data, onLinkClick }) {
  const { isMobile } = usePreviewScreen();
  const { profile, socials, links } = data;
  const theme = THEMES.find(item => item.id === profile?.theme_id) || THEMES[0];
  const normalizedSocials = SOCIAL_LIST.reduce((acc, item) => {
    const normalized = normalizeSocialUrl(item, socials?.[item]);
    if (normalized) acc[item] = normalized;
    return acc;
  }, {});
  const activeSocials = SOCIAL_LIST.filter(item => normalizedSocials[item]);
  const avatarSrc =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.avatar_seed || 1}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        flex: 1,
        background: theme.bg,
        color: theme.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '34px 18px 26px' : '48px 24px 36px',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 296,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: isMobile ? 84 : 94,
            height: isMobile ? 84 : 94,
            padding: 4,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: `1px solid ${theme.btnBorder}`,
            boxShadow: '0 18px 48px rgba(0,0,0,0.18)',
          }}
        >
          <img
            src={avatarSrc}
            alt="avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block',
            }}
          />
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 30 : 32,
            lineHeight: 0.95,
            letterSpacing: '-0.05em',
            wordBreak: 'break-word',
          }}
        >
          {profile?.name || '你的名字'}
        </div>

        {profile?.bio && (
          <div
            style={{
              marginTop: 12,
              textAlign: 'center',
              color: theme.text,
              opacity: 0.72,
              fontSize: 13,
              lineHeight: 1.7,
              maxWidth: 250,
            }}
          >
            {profile.bio}
          </div>
        )}

        {activeSocials.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 10,
              marginTop: 22,
            }}
          >
            {activeSocials.map(item => (
              <a
                key={item}
                href={normalizedSocials[item]}
                target="_blank"
                rel="noreferrer"
                aria-label={item}
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  border: `1px solid ${theme.btnBorder}`,
                  background: theme.btn,
                  textDecoration: 'none',
                  transition: 'transform 150ms ease, background-color 150ms ease',
                }}
                onMouseEnter={event => {
                  event.currentTarget.style.transform = 'translateY(-1px)';
                  event.currentTarget.style.background = theme.card;
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.transform = 'translateY(0)';
                  event.currentTarget.style.background = theme.btn;
                }}
              >
                {SOCIAL_ICONS[item](theme.accent)}
              </a>
            ))}
          </div>
        )}

        <div
          style={{
            width: '100%',
            display: 'grid',
            gap: 10,
            marginTop: 26,
          }}
        >
          {(links || []).map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => onLinkClick?.(link.id)}
              style={{
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 16px',
                textDecoration: 'none',
                color: theme.text,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                borderRadius: 18,
                border: `1px solid ${theme.btnBorder}`,
                background: theme.card,
                backdropFilter: 'blur(14px)',
                wordBreak: 'break-word',
                transition: 'transform 150ms ease, background-color 150ms ease',
              }}
              onMouseEnter={event => {
                event.currentTarget.style.transform = 'translateY(-1px)';
                event.currentTarget.style.background = theme.btn;
              }}
              onMouseLeave={event => {
                event.currentTarget.style.transform = 'translateY(0)';
                event.currentTarget.style.background = theme.card;
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {profile?.show_embed && profile?.embed_url && (
          <div
            style={{
              width: '100%',
              marginTop: 18,
              overflow: 'hidden',
              borderRadius: 20,
              border: `1px solid ${theme.btnBorder}`,
              background: theme.card,
            }}
          >
            <iframe
              src={profile.embed_url}
              width="100%"
              height="88"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen"
              style={{ display: 'block' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
