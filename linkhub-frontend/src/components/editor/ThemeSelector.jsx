import { useScreenSize } from '../../hooks/useScreenSize';
import { Card, SectionTitle } from './ui';
import { THEMES } from '../themes';
import { useI18n } from '../../hooks/useI18n';

export default function ThemeSelector({ currentThemeId, onSelect }) {
  const { tc } = useI18n();
  const { isMobile } = useScreenSize();

  return (
    <Card>
      <div>
        <div className="mono-kicker">Atmosphere</div>
        <SectionTitle style={{ marginTop: 8 }}>{tc('主题风格', 'Theme')}</SectionTitle>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 10 : 12,
          marginTop: 16,
        }}
      >
        {THEMES.map(t => (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              cursor: 'pointer',
              border:
                currentThemeId === t.id
                  ? '1px solid rgba(15, 15, 15, 0.84)'
                  : '1px solid rgba(15, 15, 15, 0.08)',
              boxShadow:
                currentThemeId === t.id
                  ? '0 18px 46px rgba(15, 15, 15, 0.12)'
                  : '0 10px 32px rgba(15, 15, 15, 0.05)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ height: 58, background: t.bg }} />
            <div
              style={{
                background: 'rgba(255,255,255,0.96)',
                padding: '10px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: currentThemeId === t.id ? 'var(--mono-text)' : 'var(--mono-text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
