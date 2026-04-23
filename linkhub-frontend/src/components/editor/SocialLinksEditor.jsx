import { useEffect, useState } from 'react';
import { Card, SectionTitle, FormField, LightInput } from './ui';
import { SOCIAL_LIST, SOCIAL_ICONS } from '../themes';
import { useI18n } from '../../hooks/useI18n';

export default function SocialLinksEditor({ socials, onChange, onPatch }) {
  const { tc } = useI18n();
  const hasConfiguredSocial = SOCIAL_LIST.some(key => (socials?.[key] || '').trim());
  const [expanded, setExpanded] = useState(hasConfiguredSocial);

  useEffect(() => {
    if (hasConfiguredSocial) setExpanded(true);
  }, [hasConfiguredSocial]);

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div className="mono-kicker">Presence</div>
          <SectionTitle style={{ marginTop: 8 }}>{tc('社交账号', 'Social Icons')}</SectionTitle>
        </div>
        <button
          type="button"
          className="mono-btn-ghost"
          style={{ minHeight: 36, padding: '0 12px', fontSize: 12 }}
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? tc('收起', 'Hide') : tc('展开', 'Show')}
        </button>
      </div>

      {!expanded && (
        <div className="mono-note" style={{ marginTop: 10 }}>
          {tc(
            '可选项：只在你想展示社交身份时填写，避免与下方链接矩阵重复。',
            'Optional: use this only for identity icons to avoid repeating links below.',
          )}
        </div>
      )}

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          {SOCIAL_LIST.map(s => (
            <FormField
              key={s}
              label={
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--mono-text-soft)',
                  }}
                >
                  {SOCIAL_ICONS[s]('currentColor')}
                  <span style={{ textTransform: 'capitalize' }}>{s}</span>
                </span>
              }
            >
              <LightInput
                value={socials[s]}
                onChange={e => onChange({ [s]: e.target.value })}
                onBlur={e => onPatch({ [s]: e.target.value })}
                placeholder={
                  s === 'website'
                    ? tc('https://你的官网或作品集', 'https://your-site-or-portfolio')
                    : tc('@用户名或主页链接', '@username or profile URL')
                }
              />
            </FormField>
          ))}
        </div>
      )}
    </Card>
  );
}
