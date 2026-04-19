import { useState, useEffect } from 'react';
import { THEMES, SOCIAL_LIST, SOCIAL_ICONS } from './themes';

// 屏幕尺寸检测钩子
function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
      });
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
}

export default function ProfilePreview({ data, onLinkClick }) {
  const screenSize = useScreenSize();
  const { profile, socials, links } = data;
  const theme = THEMES.find(t => t.id === profile?.theme_id) || THEMES[0];
  const activeSocials = SOCIAL_LIST.filter(s => socials?.[s]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: theme.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: screenSize.isMobile ? '32px 16px 24px' : '44px 20px 32px',
        overflowY: 'auto',
        fontFamily: "'DM Sans', sans-serif",
        WebkitOverflowScrolling: 'touch', // iOS平滑滚动
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: screenSize.isMobile ? 80 : 90,
          height: screenSize.isMobile ? 80 : 90,
          borderRadius: '50%',
          border: `3px solid ${theme.accent}`,
          overflow: 'hidden',
          marginBottom: screenSize.isMobile ? 12 : 14,
          boxShadow: `0 0 28px ${theme.accent}55`,
          flexShrink: 0,
        }}
      >
        <img
          src={
            profile?.avatar_url ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.avatar_seed || 1}&backgroundColor=b6e3f4,c0aede,d1d4f9`
          }
          alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: screenSize.isMobile ? 20 : 22,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: '-0.5px',
          marginBottom: screenSize.isMobile ? 4 : 6,
          textAlign: 'center',
          fontFamily: "'DM Serif Display', serif",
          padding: '0 8px',
          wordBreak: 'break-word',
        }}
      >
        {profile?.name || '你的名字'}
      </div>

      {/* Bio */}
      <div
        style={{
          fontSize: 13,
          color: theme.text,
          opacity: 0.72,
          textAlign: 'center',
          lineHeight: 1.65,
          maxWidth: 240,
          marginBottom: 22,
        }}
      >
        {profile?.bio || ''}
      </div>

      {/* Social icons */}
      {activeSocials.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {activeSocials.map(s => (
            <div
              key={s}
              style={{
                width: screenSize.isMobile ? 44 : 38, // 增大触摸目标
                height: screenSize.isMobile ? 44 : 38,
                borderRadius: '50%',
                background: theme.btn,
                border: `1px solid ${theme.btnBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s',
                minWidth: '44px', // 确保最小触摸目标
                minHeight: '44px',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.95)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {SOCIAL_ICONS[s](theme.accent)}
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(links || []).map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onLinkClick?.(link.id)}
            style={{
              display: 'block',
              textDecoration: 'none',
              background: theme.card,
              border: `1px solid ${theme.btnBorder}44`,
              borderRadius: screenSize.isMobile ? 12 : 14,
              padding: screenSize.isMobile ? '16px 14px' : '13px 18px',
              color: theme.text,
              fontSize: screenSize.isMobile ? 15 : 14,
              fontWeight: 500,
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
              minHeight: '52px', // 最小触摸目标高度
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              wordBreak: 'break-word',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = theme.btn)}
            onMouseLeave={e => (e.currentTarget.style.background = theme.card)}
            onTouchStart={e => (e.currentTarget.style.background = theme.btn)}
            onTouchEnd={e => (e.currentTarget.style.background = theme.card)}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Embed */}
      {profile?.show_embed && profile?.embed_url && (
        <div style={{ width: '100%', marginTop: 18, borderRadius: 14, overflow: 'hidden' }}>
          <iframe
            src={profile.embed_url}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen"
            style={{ borderRadius: 14 }}
          />
        </div>
      )}

      <div style={{ marginTop: 28, fontSize: 11, color: theme.text, opacity: 0.25 }}>
        由 LinkHub 驱动
      </div>
    </div>
  );
}
