import { useScreenSize } from '../../hooks/useScreenSize';
import { Card, SectionTitle } from './ui';
import { THEMES } from '../themes';

export default function ThemeSelector({ currentThemeId, onSelect }) {
  const { isMobile } = useScreenSize();

  return (
    <Card>
      <SectionTitle>主题</SectionTitle>
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
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
              border: currentThemeId === t.id ? '2px solid var(--c-accent)' : '2px solid #e5e7eb',
              boxShadow: currentThemeId === t.id ? '0 0 0 3px #dbeafe' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ height: 52, background: t.bg }} />
            <div
              style={{
                background: '#fff',
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 600,
                color: currentThemeId === t.id ? 'var(--c-accent)' : '#6b7280',
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
