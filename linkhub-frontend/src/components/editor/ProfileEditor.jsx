import { useRef, useState } from 'react';
import { useScreenSize } from '../../hooks/useScreenSize';
import { api } from '../../api';
import { Card, SectionTitle, FormField, LightInput, lightInputBase, bluePillBtn } from './ui';
import { useI18n } from '../../hooks/useI18n';

function PencilIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function ProfileEditor({ profile, onChange, onPatch }) {
  const { tc } = useI18n();
  const { isMobile } = useScreenSize();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const avatarSrc = profile.avatar_url
    ? profile.avatar_url
    : `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.avatar_seed}&backgroundColor=b6e3f4,c0aede`;

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadAvatar(file);
      onPatch({ avatar_url: res.avatar_url });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div className="mono-kicker">Identity</div>
          <SectionTitle style={{ marginTop: 10 }}>{tc('个人资料', 'Profile')}</SectionTitle>
        </div>
        <span className="mono-badge">Public</span>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 20,
          marginTop: 16,
          ...(isMobile ? { flexDirection: 'column' } : {}),
        }}
      >
        {/* Avatar with upload button */}
        <div
          style={{
            position: 'relative',
            width: 72,
            height: 72,
            flexShrink: 0,
            ...(isMobile ? { alignSelf: 'center' } : {}),
          }}
        >
          <div
            onClick={handleAvatarClick}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid rgba(15, 15, 15, 0.12)',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 18px 40px rgba(15, 15, 15, 0.08)',
            }}
          >
            {uploading ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--c-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid rgba(15, 15, 15, 0.12)',
                    borderTopColor: 'var(--mono-text)',
                    animation: 'spin 0.7s linear infinite',
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : (
              <img
                src={avatarSrc}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          {/* Edit button — anchored to bottom-right of the 72×72 container */}
          <button
            onClick={handleAvatarClick}
            title="Change photo"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--mono-text)',
              border: '2px solid rgba(255,255,255,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <CameraIcon />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Fields */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Profile Title">
            <LightInput
              value={profile.name}
              onChange={e => onChange({ name: e.target.value })}
              onBlur={e => onPatch({ name: e.target.value })}
              placeholder={tc('输入你的名字或品牌名', 'Enter your name or brand')}
            />
          </FormField>
          <FormField label="Bio">
            <textarea
              value={profile.bio}
              onChange={e => onChange({ bio: e.target.value })}
              placeholder={tc(
                '用一句话说明你是谁、做什么、为什么值得被记住。',
                'One line about who you are and what you do.',
              )}
              rows={3}
              style={{
                ...lightInputBase,
                resize: 'none',
                lineHeight: 1.6,
                fontSize: isMobile ? '16px' : '14px',
                minHeight: 104,
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(15, 15, 15, 0.84)';
                e.target.style.boxShadow = '0 0 0 4px rgba(15, 15, 15, 0.06)';
                e.target.style.background = '#fff';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(15, 15, 15, 0.12)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'rgba(255,255,255,0.84)';
                onPatch({ bio: e.target.value });
              }}
            />
          </FormField>
        </div>
      </div>

      {/* Randomize DiceBear fallback */}
      {!profile.avatar_url && (
        <button
          onClick={() => onPatch({ avatar_seed: Math.floor(Math.random() * 1000) })}
          style={{
            marginTop: 12,
            ...bluePillBtn,
            background: 'rgba(255,255,255,0.84)',
            color: 'var(--mono-text)',
            border: '1px solid rgba(15, 15, 15, 0.12)',
            minHeight: 0,
            minWidth: 0,
            padding: '10px 14px',
          }}
        >
          {tc('切换默认头像', 'Switch default avatar')}
        </button>
      )}
    </Card>
  );
}
