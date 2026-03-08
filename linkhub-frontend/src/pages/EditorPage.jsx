import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'
import ProfilePreview from '../components/ProfilePreview'
import { THEMES, SOCIAL_LIST, SOCIAL_ICONS } from '../components/themes'

const NAV_TABS = [
  { id: 'links',      label: 'Links' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'analytics',  label: 'Analytics' },
  { id: 'settings',   label: 'Settings' },
]

export default function EditorPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('links')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [data, setData] = useState({
    profile: { name: '', bio: '', avatar_seed: 1, theme_id: 'midnight', embed_url: '', show_embed: false },
    socials: { instagram: '', twitter: '', github: '', youtube: '', tiktok: '', website: '' },
    links: [],
  })

  useEffect(() => {
    api.getProfile().then(d => setData(d)).catch(console.error)
  }, [])

  const saved = (msg = '已保存') => { setSaveMsg(msg); setTimeout(() => setSaveMsg(''), 2000) }

  async function patchProfile(patch) {
    setData(d => ({ ...d, profile: { ...d.profile, ...patch } }))
    setSaving(true)
    try { await api.updateProfile(patch); saved() }
    catch { saved('保存失败') }
    finally { setSaving(false) }
  }

  async function patchSocials(patch) {
    setData(d => ({ ...d, socials: { ...d.socials, ...patch } }))
    setSaving(true)
    try { await api.updateSocials(patch); saved() }
    catch { saved('保存失败') }
    finally { setSaving(false) }
  }

  async function addLink() {
    try {
      const res = await api.addLink({ label: 'New Link', url: 'https://' })
      setData(d => ({ ...d, links: [...d.links, res.link] }))
    } catch (e) { alert(e.message) }
  }

  async function removeLink(id) {
    try {
      await api.deleteLink(id)
      setData(d => ({ ...d, links: d.links.filter(l => l.id !== id) }))
    } catch (e) { alert(e.message) }
  }

  function updateLinkField(id, field, val) {
    setData(d => ({ ...d, links: d.links.map(l => l.id === id ? { ...l, [field]: val } : l) }))
  }

  async function saveLink(id) {
    const link = data.links.find(l => l.id === id)
    if (!link) return
    setSaving(true)
    try { await api.updateLink(id, { label: link.label, url: link.url, active: link.active }); saved() }
    catch { saved('保存失败') }
    finally { setSaving(false) }
  }

  async function toggleLink(id) {
    const link = data.links.find(l => l.id === id)
    const newActive = !link.active
    setData(d => ({ ...d, links: d.links.map(l => l.id === id ? { ...l, active: newActive } : l) }))
    try { await api.updateLink(id, { active: newActive }) } catch (e) { console.error(e) }
  }

  function handleTabClick(id) {
    if (id === 'analytics') { navigate('/analytics'); return }
    setTab(id)
  }

  const previewLinks = data.links.filter(l => l.active)

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAV ── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', padding: '0 28px',
        height: 56, flexShrink: 0, position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 28 }}>
          <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>L</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111', fontFamily: "'DM Serif Display', serif" }}>LinkHub</span>
        </div>

        <nav style={{ display: 'flex', flex: 1 }}>
          {NAV_TABS.map(t => (
            <button key={t.id} onClick={() => handleTabClick(t.id)} style={{
              height: 56, padding: '0 18px', fontSize: 14, fontWeight: 500,
              background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #2563eb' : '2px solid transparent',
              color: tab === t.id ? '#2563eb' : '#6b7280', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s',
            }}>{t.label}</button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saveMsg && <span style={{ fontSize: 12, color: saving ? '#f59e0b' : '#22c55e' }}>{saveMsg}</span>}
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${user?.username}`); saved('链接已复制') }}
            style={navBtnStyle}>
            <ShareIcon /> Share
          </button>
          <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e5e7eb', cursor: 'pointer' }}
            onClick={() => { logout(); navigate('/login') }} title="点击退出登录">
            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${data.profile.avatar_seed}&backgroundColor=b6e3f4,c0aede`}
              alt="avatar" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div style={{
        flex: 1, display: 'flex', maxWidth: 1160, width: '100%',
        margin: '0 auto', padding: '32px 24px', gap: 32, boxSizing: 'border-box',
      }}>

        {/* LEFT */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {tab === 'links' && (<>
            {/* Profile card */}
            <Card>
              <SectionTitle>Profile</SectionTitle>
              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                {/* Avatar with edit button */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${data.profile.avatar_seed}&backgroundColor=b6e3f4,c0aede`}
                      alt="avatar" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <button onClick={() => patchProfile({ avatar_seed: Math.floor(Math.random() * 1000) })}
                    title="点击换头像"
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#2563eb', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', padding: 0,
                    }}>
                    <PencilIcon />
                  </button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <FormField label="PROFILE TITLE">
                    <LightInput value={data.profile.name}
                      onChange={e => setData(d => ({ ...d, profile: { ...d.profile, name: e.target.value } }))}
                      onBlur={e => patchProfile({ name: e.target.value })}
                      placeholder="@yourname" />
                  </FormField>
                  <FormField label="BIO">
                    <textarea value={data.profile.bio}
                      onChange={e => setData(d => ({ ...d, profile: { ...d.profile, bio: e.target.value } }))}
                      onBlur={e => patchProfile({ bio: e.target.value })}
                      placeholder="Tell the world about yourself..." rows={3}
                      style={{ ...lightInputBase, resize: 'none', lineHeight: 1.6 }} />
                  </FormField>
                </div>
              </div>
            </Card>

            {/* Links card */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <SectionTitle style={{ marginBottom: 0 }}>Links</SectionTitle>
                <button onClick={addLink} style={bluePillBtn}>+ Add New Link</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.links.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
                    还没有链接，点击「Add New Link」开始添加
                  </div>
                )}
                {data.links.map(link => (
                  <div key={link.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: link.active ? '#fff' : '#f9fafb',
                    border: '1px solid #e5e7eb', borderRadius: 12,
                    padding: '12px 14px',
                    opacity: link.active ? 1 : 0.55,
                    transition: 'opacity 0.2s',
                  }}>
                    <div style={{ color: '#d1d5db', flexShrink: 0 }}><DragIcon /></div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input value={link.label}
                        onChange={e => updateLinkField(link.id, 'label', e.target.value)}
                        onBlur={() => saveLink(link.id)}
                        style={{ ...inlineInput, fontWeight: 600, fontSize: 14, color: link.active ? '#111' : '#9ca3af' }}
                        placeholder="Link title" />
                      <input value={link.url}
                        onChange={e => updateLinkField(link.id, 'url', e.target.value)}
                        onBlur={() => saveLink(link.id)}
                        style={{ ...inlineInput, fontSize: 12, color: link.active ? '#2563eb' : '#9ca3af', marginTop: 2 }}
                        placeholder="https://..." />
                    </div>

                    <Toggle on={link.active} onClick={() => toggleLink(link.id)} />

                    <button onClick={() => removeLink(link.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 4, display: 'flex', lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </>)}

          {tab === 'appearance' && (<>
            <Card>
              <SectionTitle>主题</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
                {THEMES.map(t => (
                  <div key={t.id} onClick={() => patchProfile({ theme_id: t.id })} style={{
                    borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    border: data.profile.theme_id === t.id ? '2px solid #2563eb' : '2px solid #e5e7eb',
                    boxShadow: data.profile.theme_id === t.id ? '0 0 0 3px #dbeafe' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ height: 52, background: t.bg }} />
                    <div style={{ background: '#fff', padding: '6px 10px', fontSize: 12, fontWeight: 600, color: data.profile.theme_id === t.id ? '#2563eb' : '#6b7280' }}>
                      {t.label}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionTitle>社交账号</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                {SOCIAL_LIST.map(s => (
                  <FormField key={s} label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {SOCIAL_ICONS[s]('#2563eb')}
                      <span style={{ textTransform: 'capitalize' }}>{s}</span>
                    </span>
                  }>
                    <LightInput value={data.socials[s]}
                      onChange={e => setData(d => ({ ...d, socials: { ...d.socials, [s]: e.target.value } }))}
                      onBlur={e => patchSocials({ [s]: e.target.value })}
                      placeholder={s === 'website' ? 'https://...' : '@用户名'} />
                  </FormField>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <SectionTitle style={{ marginBottom: 0 }}>嵌入组件</SectionTitle>
                <Toggle on={data.profile.show_embed} onClick={() => patchProfile({ show_embed: !data.profile.show_embed })} />
              </div>
              <FormField label="Embed URL (iframe src)">
                <LightInput value={data.profile.embed_url}
                  onChange={e => setData(d => ({ ...d, profile: { ...d.profile, embed_url: e.target.value } }))}
                  onBlur={e => patchProfile({ embed_url: e.target.value })}
                  placeholder="Spotify / YouTube embed URL" />
              </FormField>
            </Card>
          </>)}

          {tab === 'settings' && <SettingsTab user={user} />}
        </div>

        {/* RIGHT: Phone Preview */}
        <div style={{ width: 290, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Phone */}
            <div style={{
              width: 270, borderRadius: 44,
              background: '#1a2035',
              padding: '10px 8px 14px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                <div style={{ width: 68, height: 18, background: '#111827', borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 38, height: 4, background: '#374151', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ height: 490, borderRadius: 32, overflow: 'hidden' }}>
                <ProfilePreview data={{ ...data, links: previewLinks }} />
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
              linkhub.app/<span style={{ color: '#2563eb', fontWeight: 600 }}>{user?.username}</span>
            </div>
            <button onClick={() => window.open(`/${user?.username}`, '_blank')}
              style={{ ...navBtnStyle, marginTop: 10, width: '100%', justifyContent: 'center' }}>
              ↗ 打开公开主页
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Small Components ──

function Card({ children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
      padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>{children}</div>
  )
}

function SectionTitle({ children, style }) {
  return <div style={{ fontSize: 16, fontWeight: 700, color: '#111', ...style }}>{children}</div>
}

function FormField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</div>
      {children}
    </div>
  )
}

const lightInputBase = {
  width: '100%', boxSizing: 'border-box',
  background: '#f9fafb', border: '1px solid #e5e7eb',
  borderRadius: 8, padding: '9px 12px',
  color: '#111', fontSize: 14, outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
}

function LightInput({ onBlur, ...props }) {
  return (
    <input
      style={lightInputBase}
      onFocus={e => e.target.style.borderColor = '#2563eb'}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; onBlur?.(e) }}
      {...props}
    />
  )
}

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
      background: on ? '#2563eb' : '#d1d5db',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 19 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  )
}

const inlineInput = {
  display: 'block', width: '100%', border: 'none', outline: 'none',
  background: 'transparent', fontFamily: "'DM Sans', sans-serif", padding: '1px 0',
}

const bluePillBtn = {
  background: '#2563eb', color: '#fff', border: 'none',
  borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
}

const navBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#374151',
  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
}

// ── Icons ──
function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
    </svg>
  )
}

function DragIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
      <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

// ── Settings Tab ──
function SettingsTab({ user }) {
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setPwd(p => ({ ...p, [k]: e.target.value }))

  async function handleChange() {
    setMsg(''); setErr('')
    if (pwd.newPassword !== pwd.confirm) { setErr('两次输入的新密码不一致'); return }
    setLoading(true)
    try {
      const res = await api.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      setMsg(res.message)
      setPwd({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle>账号信息</SectionTitle>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>用户名</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>@{user?.username}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0' }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>邮箱</span>
            <span style={{ fontSize: 14, color: '#374151' }}>{user?.email}</span>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>修改密码</SectionTitle>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="当前密码">
            <LightInput type="password" value={pwd.currentPassword} onChange={set('currentPassword')} placeholder="••••••••" />
          </FormField>
          <FormField label="新密码">
            <LightInput type="password" value={pwd.newPassword} onChange={set('newPassword')} placeholder="至少 6 位" />
          </FormField>
          <FormField label="确认新密码">
            <LightInput type="password" value={pwd.confirm} onChange={set('confirm')} placeholder="再输一次" />
          </FormField>

          {err && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
              ⚠ {err}
            </div>
          )}
          {msg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a' }}>
              ✓ {msg}
            </div>
          )}

          <button onClick={handleChange} disabled={loading}
            style={{ ...bluePillBtn, borderRadius: 8, padding: '11px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '修改中...' : '确认修改密码'}
          </button>
        </div>
      </Card>
    </div>
  )
}
