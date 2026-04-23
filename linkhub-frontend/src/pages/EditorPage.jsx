import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { THEMES } from '../components/themes';
import ProfilePreview from '../components/ProfilePreview';
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
import { AppShell, AppTopbar } from '../components/AppShell';

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

function BentoTile({ Icon, title, detail, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mono-surface"
      style={{
        borderRadius: 24,
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 156,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div style={{ color: 'var(--mono-text-soft)' }}>
        <Icon />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 1, opacity: 0 }} />
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--mono-text)',
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </div>
        <div
          style={{ fontSize: 12, color: 'var(--mono-text-muted)', marginTop: 6, lineHeight: 1.6 }}
        >
          {detail}
        </div>
      </div>
      <div className="mono-kicker">Open</div>
    </button>
  );
}

export default function EditorPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(null);
  const [newLinkId, setNewLinkId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [data, setData] = useState({
    profile: {
      name: '',
      bio: '',
      avatar_seed: 1,
      theme_id: 'noir',
      embed_url: '',
      show_embed: false,
    },
    socials: { instagram: '', twitter: '', github: '', youtube: '', tiktok: '', website: '' },
    links: [],
  });

  useEffect(() => {
    api
      .getProfile()
      .then(result => setData(result))
      .catch(console.error);
  }, []);

  const saved = (message = 'Saved') => {
    setSaveMsg(message);
    window.setTimeout(() => setSaveMsg(''), 1800);
  };

  async function patchProfile(patch) {
    setData(current => ({ ...current, profile: { ...current.profile, ...patch } }));
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
    setData(current => ({ ...current, socials: { ...current.socials, ...patch } }));
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
      setData(current => ({ ...current, links: [...current.links, res.link] }));
      setNewLinkId(res.link.id);
    } catch (error) {
      window.alert(error.message);
    }
  }

  async function removeLink(id) {
    try {
      await api.deleteLink(id);
      setData(current => ({ ...current, links: current.links.filter(link => link.id !== id) }));
    } catch (error) {
      window.alert(error.message);
    }
  }

  function updateLinkField(id, field, value) {
    setData(current => ({
      ...current,
      links: current.links.map(link => (link.id === id ? { ...link, [field]: value } : link)),
    }));
  }

  async function saveLink(id) {
    const link = data.links.find(item => item.id === id);
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
    const link = data.links.find(item => item.id === id);
    if (!link) return;
    const nextActive = !link.active;
    setData(current => ({
      ...current,
      links: current.links.map(item => (item.id === id ? { ...item, active: nextActive } : item)),
    }));
    try {
      await api.toggleLink(id);
    } catch (error) {
      console.error(error);
    }
  }

  async function batchToggleLinks(ids) {
    try {
      const res = await api.batchToggleLinks(ids);
      const map = Object.fromEntries(
        res.results.filter(item => item.success).map(item => [item.id, item.active]),
      );
      setData(current => ({
        ...current,
        links: current.links.map(link =>
          link.id in map ? { ...link, active: map[link.id] } : link,
        ),
      }));
    } catch (error) {
      console.error(error);
    }
  }

  async function batchDeleteLinks(ids) {
    try {
      await api.batchDeleteLinks(ids);
      setData(current => ({
        ...current,
        links: current.links.filter(link => !ids.includes(link.id)),
      }));
    } catch (error) {
      console.error(error);
    }
  }

  const currentTheme = THEMES.find(item => item.id === data.profile.theme_id);
  const tiles = [
    {
      id: 'links',
      Icon: IconLinks,
      title: 'Profile & Links',
      detail: data.links.length ? `${data.links.length} 个外链入口` : '先编辑你的资料和第一条链接',
    },
    {
      id: 'appearance',
      Icon: IconAppearance,
      title: 'Visual System',
      detail: currentTheme?.label || '选择公开页氛围与社交链接',
    },
    { id: 'nfc', Icon: IconNfc, title: 'NFC Cards', detail: '管理芯片绑定、状态和扫描入口' },
    {
      id: 'settings',
      Icon: IconSettings,
      title: 'Account',
      detail: user?.email || '管理账号和密码',
    },
  ];

  const tabTitles = {
    links: 'Profile & Links',
    appearance: 'Visual System',
    nfc: 'NFC Cards',
    settings: 'Account',
  };

  const leftPanel =
    tab === null ? (
      <section className="mono-panel">
        <div className="mono-panel-header">
          <div>
            <div className="mono-kicker">Editor Home</div>
            <h2>选择一个区域开始编辑</h2>
          </div>
          <span className="mono-badge">Live Preview</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
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
      </section>
    ) : (
      <div className="mono-editor-column">
        <button
          className="mono-btn-ghost"
          style={{ justifyContent: 'flex-start' }}
          onClick={() => setTab(null)}
        >
          返回编辑导航
        </button>

        {tab === 'links' && (
          <>
            <ProfileEditor
              profile={data.profile}
              onChange={patch =>
                setData(current => ({ ...current, profile: { ...current.profile, ...patch } }))
              }
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
              onChange={patch =>
                setData(current => ({ ...current, socials: { ...current.socials, ...patch } }))
              }
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
              <FormField label="Embed URL">
                <LightInput
                  value={data.profile.embed_url}
                  onChange={event =>
                    setData(current => ({
                      ...current,
                      profile: { ...current.profile, embed_url: event.target.value },
                    }))
                  }
                  onBlur={event => patchProfile({ embed_url: event.target.value })}
                  placeholder="Spotify / YouTube iframe 地址"
                />
              </FormField>
            </Card>
          </>
        )}

        {tab === 'nfc' && <NfcEditor />}
        {tab === 'settings' && <SettingsPanel user={user} />}
      </div>
    );

  return (
    <AppShell>
      <AppTopbar
        title="Editor"
        subtitle={tab ? tabTitles[tab] : '公开页与 NFC 名片编辑器'}
        actions={
          <>
            {saveMsg && <span className="mono-badge">{saving ? `${saveMsg}...` : saveMsg}</span>}
            <button
              className="mono-btn-ghost"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${user?.username}`);
                saved('Copied');
              }}
            >
              <ShareIcon /> 分享
            </button>
            <button className="mono-btn-muted" onClick={() => navigate('/dashboard')}>
              返回总览
            </button>
            <button
              className="mono-btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              退出
            </button>
          </>
        }
      />

      <main className="mono-main">
        <div className="mono-editor-layout">
          <div className="mono-editor-column">{leftPanel}</div>

          <aside className="mono-editor-preview">
            <div className="mono-preview-shell">
              <div className="mono-preview-device">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <div
                    style={{
                      width: 72,
                      height: 18,
                      background: '#020202',
                      borderRadius: '0 0 12px 12px',
                    }}
                  />
                </div>
                <div className="mono-preview-screen">
                  <ProfilePreview
                    data={{ ...data, links: data.links.filter(link => link.active) }}
                  />
                </div>
              </div>
            </div>

            <div className="mono-panel" style={{ padding: 18 }}>
              <div className="mono-kicker">Public URL</div>
              <div
                style={{
                  marginTop: 10,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  wordBreak: 'break-all',
                }}
              >
                {window.location.origin}/{user?.username}
              </div>
              <button
                className="mono-btn-muted"
                style={{ marginTop: 14, width: '100%' }}
                onClick={() => window.open(`/${user?.username}`, '_blank')}
              >
                打开公开页
              </button>
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
