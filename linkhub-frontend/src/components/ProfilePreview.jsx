import { THEMES, SOCIAL_LIST, SOCIAL_ICONS } from './themes'

export default function ProfilePreview({ data, onLinkClick }) {
  const { profile, socials, links } = data
  const theme = THEMES.find(t => t.id === profile?.theme_id) || THEMES[0]
  const activeSocials = SOCIAL_LIST.filter(s => socials?.[s])

  return (
    <div style={{
      width: '100%', height: '100%',
      background: theme.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '44px 20px 32px',
      overflowY: 'auto',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Avatar */}
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        border: `3px solid ${theme.accent}`,
        overflow: 'hidden', marginBottom: 14,
        boxShadow: `0 0 28px ${theme.accent}55`,
        flexShrink: 0,
      }}>
        <img
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.avatar_seed || 1}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
          alt="avatar" style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Name */}
      <div style={{
        fontSize: 22, fontWeight: 700, color: theme.text,
        letterSpacing: '-0.5px', marginBottom: 6, textAlign: 'center',
        fontFamily: "'DM Serif Display', serif",
      }}>{profile?.name || '你的名字'}</div>

      {/* Bio */}
      <div style={{
        fontSize: 13, color: theme.text, opacity: 0.72,
        textAlign: 'center', lineHeight: 1.65, maxWidth: 240, marginBottom: 22,
      }}>{profile?.bio || ''}</div>

      {/* Social icons */}
      {activeSocials.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {activeSocials.map(s => (
            <div key={s} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: theme.btn, border: `1px solid ${theme.btnBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'transform 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {SOCIAL_ICONS[s](theme.accent)}
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(links || []).map(link => (
          <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
            onClick={() => onLinkClick?.(link.id)}
            style={{
              display: 'block', textDecoration: 'none',
              background: theme.card,
              border: `1px solid ${theme.btnBorder}44`,
              borderRadius: 14, padding: '13px 18px',
              color: theme.text, fontSize: 14, fontWeight: 500, textAlign: 'center',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = theme.btn}
            onMouseLeave={e => e.currentTarget.style.background = theme.card}
          >{link.label}</a>
        ))}
      </div>

      {/* Embed */}
      {profile?.show_embed && profile?.embed_url && (
        <div style={{ width: '100%', marginTop: 18, borderRadius: 14, overflow: 'hidden' }}>
          <iframe src={profile.embed_url} width="100%" height="80" frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen"
            style={{ borderRadius: 14 }} />
        </div>
      )}

      <div style={{ marginTop: 28, fontSize: 11, color: theme.text, opacity: 0.25 }}>
        由 LinkHub 驱动
      </div>
    </div>
  )
}
