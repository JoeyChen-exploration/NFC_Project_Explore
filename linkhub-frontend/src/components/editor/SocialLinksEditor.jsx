import { Card, SectionTitle, FormField, LightInput } from './ui';
import { SOCIAL_LIST, SOCIAL_ICONS } from '../themes';

export default function SocialLinksEditor({ socials, onChange, onPatch }) {
  return (
    <Card>
      <div>
        <div className="mono-kicker">Presence</div>
        <SectionTitle style={{ marginTop: 8 }}>社交账号</SectionTitle>
      </div>
      <p className="mono-panel-meta" style={{ marginTop: 12 }}>
        保持少而精。把最能代表你身份和可信度的平台放在前面，比全部铺满更有质感。
      </p>
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
              placeholder={s === 'website' ? 'https://你的官网或作品集' : '@用户名或主页链接'}
            />
          </FormField>
        ))}
      </div>
    </Card>
  );
}
