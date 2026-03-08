import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'
import ProfilePreview from '../components/ProfilePreview'
import { THEMES, SOCIAL_LIST, SOCIAL_ICONS } from '../components/themes'

const TABS = [['profile','👤','个人'],['links','🔗','链接'],['social','🌐','社交'],['embed','📦','嵌入'],['theme','🎨','主题']]

export default function EditorPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [data, setData] = useState({
    profile: { name: '', bio: '', avatar_seed: 1, theme_id: 'midnight', embed_url: '', show_embed: false },
    socials: { instagram: '', twitter: '', github: '', youtube: '', tiktok: '', website: '' },
    links: [],
  })
  const nextId = useRef(Date.now())

  // Load profile on mount
  useEffect(() => {
    api.getProfile().then(d => setData(d)).catch(console.error)
  }, [])

  // Auto-save helper
  const saved = (msg = '已保存 ✓') => { setSaveMsg(msg); setTimeout(() => setSaveMsg(''), 2000) }

  // Profile field update + auto-save
  async function patchProfile(patch) {
    const merged = { ...data.profile, ...patch }
    setData(d => ({ ...d, profile: merged }))
    setSaving(true)
    try { await api.updateProfile(patch); saved() }
    catch (e) { saved('保存失败') }
    finally { setSaving(false) }
  }

  async function patchSocials(patch) {
    setData(d => ({ ...d, socials: { ...d.socials, ...patch } }))
    setSaving(true)
    try { await api.updateSocials(patch); saved() }
    catch (e) { saved('保存失败') }
    finally { setSaving(false) }
  }

  async function addLink() {
    try {
      const res = await api.addLink({ label: '新链接', url: 'https://' })
      setData(d => ({ ...d, links: [...d.links, res.link] }))
    } catch (e) { alert(e.message) }
  }

  async function removeLink(id) {
    try {
      await api.deleteLink(id)
      setData(d => ({ ...d, links: d.links.filter(l => l.id !== id) }))
    } catch (e) { alert(e.message) }
  }

  async function updateLinkField(id, field, val) {
    setData(d => ({ ...d, links: d.links.map(l => l.id === id ? { ...l, [field]: val } : l) }))
  }

  async function saveLink(id) {
    const link = data.links.find(l => l.id === id)
    if (!link) return
    setSaving(true)
    try { await api.updateLink(id, { label: link.label, url: link.url, active: link.active }); saved() }
    catch (e) { saved('保存失败') }
    finally { setSaving(false) }
  }

  async function toggleLink(id) {
    const link = data.links.find(l => l.id === id)
    const newActive = !link.active
    setData(d => ({ ...d, links: d.links.map(l => l.id === id ? { ...l, active: newActive } : l) }))
    try { await api.updateLink(id, { active: newActive }) }
    catch (e) { console.error(e) }
  }

  const previewLinks = data.links.filter(l => l.active)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 380, background: '#111', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: '18px 22px 0', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, color: '#8b5cf6' }}>⬡</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'DM Serif Display',serif" }}>LinkHub</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {saveMsg && <span style={{ fontSize: 11, color: '#22c55e' }}>{saveMsg}</span>}
              <button onClick={() => navigate('/analytics')} style={btnStyle('#1e1e1e','#888')}>📊 分析</button>
              <button onClick={() => window.open(`/${user?.username}`, '_blank')} style={btnStyle('#1e1e1e','#888')}>↗ 预览</button>
              <button onClick={() => { logout(); navigate('/login') }} style={btnStyle('#1e1e1e','#555')}>退出</button>
            </div>
          </div>

          {/* URL display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#1a1a1a', borderRadius: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: '#555' }}>linkhub.app/</span>
            <span style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 600 }}>{user?.username}</span>
            <button onClick={() => navigator.clipboard.writeText(`linkhub.app/${user?.username}`)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 11 }}>复制</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map(([id, icon, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: 1, padding: '8px 4px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: tab === id ? '#1e1e1e' : 'transparent',
                color: tab === id ? '#fff' : '#555', border: 'none',
                borderRadius: '8px 8px 0 0',
                borderBottom: tab === id ? '2px solid #8b5cf6' : '2px solid transparent',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}>{icon} {label}</button>
            ))}
          </div>
        </div>

        {/* Tab body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', margin: '0 auto 8px',
                  border: '3px solid #8b5cf6', overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 0 20px #8b5cf644',
                }} onClick={() => patchProfile({ avatar_seed: Math.floor(Math.random() * 1000) })}>
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${data.profile.avatar_seed}&backgroundColor=b6e3f4,c0aede`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>点击随机更换</div>
              </div>
              <Field label="显示名称">
                <Input value={data.profile.name} onChange={e => setData(d => ({ ...d, profile: { ...d.profile, name: e.target.value } }))}
                  onBlur={e => patchProfile({ name: e.target.value })} placeholder="你的名字" />
              </Field>
              <Field label="个人简介">
                <textarea value={data.profile.bio}
                  onChange={e => setData(d => ({ ...d, profile: { ...d.profile, bio: e.target.value } }))}
                  onBlur={e => patchProfile({ bio: e.target.value })}
                  placeholder="用一句话介绍自己..." rows={3}
                  style={{ ...inputBase, resize: 'none', lineHeight: 1.6 }} />
              </Field>
            </div>
          )}

          {/* ── LINKS ── */}
          {tab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.links.map(link => (
                <div key={link.id} style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, border: '1px solid #252525' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Toggle on={link.active} onClick={() => toggleLink(link.id)} />
                    <button onClick={() => removeLink(link.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                  <Input value={link.label}
                    onChange={e => updateLinkField(link.id, 'label', e.target.value)}
                    onBlur={() => saveLink(link.id)}
                    placeholder="链接标题" style={{ marginBottom: 8 }} />
                  <Input value={link.url}
                    onChange={e => updateLinkField(link.id, 'url', e.target.value)}
                    onBlur={() => saveLink(link.id)}
                    placeholder="https://..." />
                </div>
              ))}
              <DashedBtn onClick={addLink}>+ 添加链接</DashedBtn>
            </div>
          )}

          {/* ── SOCIAL ── */}
          {tab === 'social' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SOCIAL_LIST.map(s => (
                <Field key={s} label={<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{SOCIAL_ICONS[s]('#8b5cf6')}<span style={{ textTransform: 'capitalize' }}>{s}</span></span>}>
                  <Input value={data.socials[s]}
                    onChange={e => setData(d => ({ ...d, socials: { ...d.socials, [s]: e.target.value } }))}
                    onBlur={e => patchSocials({ [s]: e.target.value })}
                    placeholder={s === 'website' ? 'https://...' : '@用户名'} />
                </Field>
              ))}
            </div>
          )}

          {/* ── EMBED ── */}
          {tab === 'embed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 16, border: '1px solid #252525' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>嵌入小组件</span>
                  <Toggle on={data.profile.show_embed} onClick={() => patchProfile({ show_embed: !data.profile.show_embed })} />
                </div>
                <Field label="Embed URL (iframe src)">
                  <Input value={data.profile.embed_url}
                    onChange={e => setData(d => ({ ...d, profile: { ...d.profile, embed_url: e.target.value } }))}
                    onBlur={e => patchProfile({ embed_url: e.target.value })}
                    placeholder="Spotify / YouTube embed URL" />
                </Field>
              </div>
              <div style={{ background: '#181510', border: '1px solid #2e2510', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, color: '#a0882a', fontWeight: 600, marginBottom: 8 }}>💡 支持平台</div>
                {['Spotify 播放器','YouTube 视频','Notion 页面','任何支持 iframe 的页面'].map(t => (
                  <div key={t} style={{ fontSize: 12, color: '#6b5a2e', marginBottom: 4 }}>· {t}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── THEME ── */}
          {tab === 'theme' && (
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>选择主题</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {THEMES.map(t => (
                  <div key={t.id} onClick={() => patchProfile({ theme_id: t.id })} style={{
                    borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    border: data.profile.theme_id === t.id ? '2px solid #8b5cf6' : '2px solid transparent',
                    boxShadow: data.profile.theme_id === t.id ? '0 0 16px #8b5cf655' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ height: 56, background: t.bg }} />
                    <div style={{ background: '#1a1a1a', padding: '6px 10px', fontSize: 12, fontWeight: 600, color: data.profile.theme_id === t.id ? '#8b5cf6' : '#555' }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Phone Preview ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{
          width: 360, height: 680, borderRadius: 44,
          overflow: 'hidden', position: 'relative',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
          border: '8px solid #1a1a1a',
        }}>
          {/* Notch */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, background: '#1a1a1a', borderRadius: '0 0 16px 16px', zIndex: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 5 }}>
            <div style={{ width: 56, height: 5, background: '#2a2a2a', borderRadius: 3 }} />
          </div>
          <div style={{ paddingTop: 28, height: '100%' }}>
            <ProfilePreview data={{ ...data, links: previewLinks }} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 28, fontSize: 11, color: '#2a2a2a', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
          实时预览 · 失焦自动保存
        </div>
      </div>
    </div>
  )
}

// ── Shared mini components ──
const inputBase = {
  width: '100%', boxSizing: 'border-box',
  background: '#1e1e1e', border: '1px solid #2a2a2a',
  borderRadius: 8, padding: '9px 12px',
  color: '#fff', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif",
}

function Input({ style, ...props }) {
  return <input style={{ ...inputBase, ...style }} {...props} />
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      {children}
    </div>
  )
}

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: on ? '#8b5cf6' : '#2a2a2a', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 17 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
  )
}

function DashedBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: '2px dashed #2a2a2a',
      borderRadius: 12, padding: 12, color: '#444',
      cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
      transition: 'all 0.15s', width: '100%',
    }}
      onMouseEnter={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.color = '#8b5cf6' }}
      onMouseLeave={e => { e.target.style.borderColor = '#2a2a2a'; e.target.style.color = '#444' }}
    >{children}</button>
  )
}

function btnStyle(bg, color) {
  return {
    background: bg, border: `1px solid #252525`, borderRadius: 7,
    padding: '5px 10px', color, fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
  }
}
