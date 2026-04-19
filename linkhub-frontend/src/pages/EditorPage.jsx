import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useScreenSize } from '../hooks/useScreenSize';
import { THEMES } from '../components/themes';
import ProfilePreview from '../components/ProfilePreview';
import EditorLayout from '../components/editor/EditorLayout';
import ProfileEditor from '../components/editor/ProfileEditor';
import LinkList from '../components/editor/LinkList';
import ThemeSelector from '../components/editor/ThemeSelector';
import SocialLinksEditor from '../components/editor/SocialLinksEditor';
import SettingsPanel from '../components/editor/SettingsPanel';
import {
  Card,
  SectionTitle,
  FormField,
  LightInput,
  Toggle,
  navBtnStyle,
  ShareIcon,
} from '../components/editor/ui';
import NfcEditor from '../components/editor/NfcEditor';

// ── Bento icons ──────────────────────────────────────────────────────────────

const IconLinks = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const IconAppearance = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const IconNfc = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8.32a7.43 7.43 0 010 7.36" />
    <path d="M9.46 6.21a11.76 11.76 0 010 11.58" />
    <path d="M12.91 4.1a15.91 15.91 0 01.01 15.8" />
    <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconSettings = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

// ── Bento Tile ───────────────────────────────────────────────────────────────

function BentoTile({ Icon, title, detail, onClick }) {
  return (
    <div
      className="bento-tile"
      onClick={onClick}
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 12,
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 128,
      }}
    >
      <div style={{ color: 'var(--c-text-2)' }}>
        <Icon />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{ fontWeight: 600, fontSize: 15, color: 'var(--c-text)', letterSpacing: '-0.2px' }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--c-text-3)', marginTop: 3 }}>{detail}</div>
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--c-text-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <span>→</span>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const [tab, setTab] = useState(null); // null = bento home
  const [newLinkId, setNewLinkId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [data, setData] = useState({
    profile: {
      name: '',
      bio: '',
      avatar_seed: 1,
      theme_id: 'midnight',
      embed_url: '',
      show_embed: false,
    },
    socials: { instagram: '', twitter: '', github: '', youtube: '', tiktok: '', website: '' },
    links: [],
  });

  useEffect(() => {
    api
      .getProfile()
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  const saved = (msg = 'Saved') => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 2000);
  };

  async function patchProfile(patch) {
    setData(d => ({ ...d, profile: { ...d.profile, ...patch } }));
    setSaving(true);
    try {
      await api.updateProfile(patch);
      saved();
    } catch {
      saved('Failed');
    } finally {
      setSaving(false);
    }
  }

  async function patchSocials(patch) {
    setData(d => ({ ...d, socials: { ...d.socials, ...patch } }));
    setSaving(true);
    try {
      await api.updateSocials(patch);
      saved();
    } catch {
      saved('Failed');
    } finally {
      setSaving(false);
    }
  }

  async function addLink() {
    try {
      const res = await api.addLink({ label: '', url: '' });
      setData(d => ({ ...d, links: [...d.links, res.link] }));
      setNewLinkId(res.link.id);
    } catch (e) {
      alert(e.message);
    }
  }

  async function removeLink(id) {
    try {
      await api.deleteLink(id);
      setData(d => ({ ...d, links: d.links.filter(l => l.id !== id) }));
    } catch (e) {
      alert(e.message);
    }
  }

  function updateLinkField(id, field, val) {
    setData(d => ({ ...d, links: d.links.map(l => (l.id === id ? { ...l, [field]: val } : l)) }));
  }

  async function saveLink(id) {
    const link = data.links.find(l => l.id === id);
    if (!link) return;
    setSaving(true);
    try {
      await api.updateLink(id, { label: link.label, url: link.url, active: link.active });
      saved();
    } catch {
      saved('Failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleLink(id) {
    const link = data.links.find(l => l.id === id);
    const newActive = !link.active;
    setData(d => ({
      ...d,
      links: d.links.map(l => (l.id === id ? { ...l, active: newActive } : l)),
    }));
    try {
      await api.toggleLink(id);
    } catch (e) {
      console.error(e);
    }
  }

  async function batchToggleLinks(ids) {
    try {
      const res = await api.batchToggleLinks(ids);
      const map = Object.fromEntries(res.results.filter(r => r.success).map(r => [r.id, r.active]));
      setData(d => ({
        ...d,
        links: d.links.map(l => (l.id in map ? { ...l, active: map[l.id] } : l)),
      }));
    } catch (e) {
      console.error(e);
    }
  }

  async function batchDeleteLinks(ids) {
    try {
      await api.batchDeleteLinks(ids);
      setData(d => ({ ...d, links: d.links.filter(l => !ids.includes(l.id)) }));
    } catch (e) {
      console.error(e);
    }
  }

  // ── Bento tile config ──────────────────────────────────────────────────────

  const currentTheme = THEMES.find(t => t.id === data.profile.theme_id);
  const tiles = [
    {
      id: 'links',
      Icon: IconLinks,
      title: 'Links',
      detail: data.links.length
        ? `${data.links.length} link${data.links.length !== 1 ? 's' : ''}`
        : 'Add your first link',
    },
    {
      id: 'appearance',
      Icon: IconAppearance,
      title: 'Appearance',
      detail: currentTheme?.label || 'Theme & social',
    },
    {
      id: 'nfc',
      Icon: IconNfc,
      title: 'NFC',
      detail: 'Manage tap cards',
    },
    {
      id: 'settings',
      Icon: IconSettings,
      title: 'Settings',
      detail: user?.email || 'Account',
    },
  ];

  const tabTitles = { links: 'Links', appearance: 'Appearance', nfc: 'NFC', settings: 'Settings' };

  // ── Back button ────────────────────────────────────────────────────────────

  const backBtn = (
    <button
      onClick={() => setTab(null)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        padding: '0 0 18px 0',
        color: 'var(--c-text-3)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--font-ui)',
        letterSpacing: '-0.1px',
      }}
    >
      ← Dashboard
    </button>
  );

  // ── Left panel ─────────────────────────────────────────────────────────────

  const leftPanel =
    tab === null ? (
      <div className="tab-content">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          {tiles.map(tile => (
            <BentoTile
              key={tile.id}
              Icon={tile.Icon}
              title={tile.title}
              detail={tile.detail}
              onClick={() => setTab(tile.id)}
            />
          ))}
        </div>
      </div>
    ) : (
      <div key={tab} className="tab-content">
        {backBtn}

        {tab === 'links' && (
          <>
            <ProfileEditor
              profile={data.profile}
              onChange={patch => setData(d => ({ ...d, profile: { ...d.profile, ...patch } }))}
              onPatch={patchProfile}
            />
            <LinkList
              links={data.links}
              onAdd={addLink}
              onRemove={removeLink}
              onUpdate={updateLinkField}
              onSave={saveLink}
              onToggle={toggleLink}
              onBatchToggle={batchToggleLinks}
              onBatchDelete={batchDeleteLinks}
              newLinkId={newLinkId}
              onNewLinkFocused={() => setNewLinkId(null)}
            />
          </>
        )}

        {tab === 'appearance' && (
          <>
            <ThemeSelector
              currentThemeId={data.profile.theme_id}
              onSelect={id => patchProfile({ theme_id: id })}
            />
            <SocialLinksEditor
              socials={data.socials}
              onChange={patch => setData(d => ({ ...d, socials: { ...d.socials, ...patch } }))}
              onPatch={patchSocials}
            />
            <Card>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <SectionTitle style={{ marginBottom: 0 }}>Embed</SectionTitle>
                <Toggle
                  on={data.profile.show_embed}
                  onClick={() => patchProfile({ show_embed: !data.profile.show_embed })}
                />
              </div>
              <FormField label="Embed URL (iframe src)">
                <LightInput
                  value={data.profile.embed_url}
                  onChange={e =>
                    setData(d => ({ ...d, profile: { ...d.profile, embed_url: e.target.value } }))
                  }
                  onBlur={e => patchProfile({ embed_url: e.target.value })}
                  placeholder="Spotify / YouTube embed URL"
                />
              </FormField>
            </Card>
          </>
        )}

        {tab === 'nfc' && <NfcEditor />}
        {tab === 'settings' && <SettingsPanel user={user} />}
      </div>
    );

  // ── Right panel (preview phone) ────────────────────────────────────────────

  const rightPanel = (
    <div
      style={{
        position: 'sticky',
        top: 72,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          width: 260,
          borderRadius: 40,
          background: '#111',
          padding: '10px 8px 14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <div
            style={{
              width: 64,
              height: 16,
              background: '#000',
              borderRadius: '0 0 10px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 36, height: 3, background: '#333', borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ height: 480, borderRadius: 30, overflow: 'hidden' }}>
          <ProfilePreview data={{ ...data, links: data.links.filter(l => l.active) }} />
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--c-text-3)', textAlign: 'center' }}>
        linkhub.app/
        <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>{user?.username}</span>
      </div>
      <button
        onClick={() => window.open(`/${user?.username}`, '_blank')}
        style={{ ...navBtnStyle, marginTop: 10, width: '100%', justifyContent: 'center' }}
      >
        ↗ Open public page
      </button>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--c-bg)',
        fontFamily: 'var(--font-ui)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          background: 'var(--c-surface)',
          borderBottom: '1px solid var(--c-border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 28px',
          height: 52,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Left: Logo + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              background: 'var(--c-accent)',
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>L</span>
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--c-text)',
              letterSpacing: '-0.3px',
              fontFamily: 'var(--font-display)',
            }}
          >
            LinkHub
          </span>
          {tab && !isMobile && (
            <>
              <span style={{ color: 'var(--c-text-3)', fontSize: 13 }}>/</span>
              <span style={{ fontSize: 13, color: 'var(--c-text-2)', fontWeight: 500 }}>
                {tabTitles[tab]}
              </span>
            </>
          )}
        </div>

        {/* Right: save indicator + share + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveMsg && (
            <span
              style={{
                fontSize: 12,
                color: saving ? 'var(--c-warning)' : 'var(--c-success)',
                fontWeight: 500,
              }}
            >
              {saveMsg}
            </span>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${user?.username}`);
              saved('Copied');
            }}
            style={navBtnStyle}
          >
            <ShareIcon /> Share
          </button>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid var(--c-border)',
              cursor: 'pointer',
            }}
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out"
          >
            <img
              src={
                data.profile.avatar_url ||
                `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.profile.avatar_seed}&backgroundColor=b6e3f4,c0aede`
              }
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <EditorLayout leftPanel={leftPanel} rightPanel={rightPanel} />
    </div>
  );
}
