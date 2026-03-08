import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', username: '', password: '', token: '', newPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [devUrl, setDevUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) { setMode('reset'); setForm(f => ({ ...f, token })) }
  }, [searchParams])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); setDevUrl('') }

  async function handleSubmit() {
    setError(''); setSuccess(''); setDevUrl('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const data = await api.login({ email: form.email, password: form.password })
        login(data.token, data.user)
        navigate('/dashboard')
      } else if (mode === 'register') {
        const data = await api.register({ email: form.email, username: form.username, password: form.password })
        login(data.token, data.user)
        navigate('/dashboard')
      } else if (mode === 'forgot') {
        const data = await api.forgotPassword({ email: form.email })
        setSuccess(data.message)
        if (data.dev_reset_url) setDevUrl(data.dev_reset_url)
      } else if (mode === 'reset') {
        const data = await api.resetPassword({ token: form.token, newPassword: form.newPassword })
        setSuccess(data.message)
        setTimeout(() => switchMode('login'), 2000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onEnter = (e) => e.key === 'Enter' && handleSubmit()

  const titles = { login: '欢迎回来', register: '创建你的主页', forgot: '重置密码', reset: '设置新密码' }
  const subtitles = {
    login: '登录以继续编辑你的个人主页',
    register: '30 秒创建你的专属 link-in-bio 主页',
    forgot: '输入账号邮箱，我们将发送重置链接',
    reset: '输入新密码完成重置',
  }

  return (
    <div style={s.root}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoBox}><span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>L</span></div>
          <span style={s.logoText}>LinkHub</span>
        </div>

        <h1 style={s.title}>{titles[mode]}</h1>
        <p style={s.subtitle}>{subtitles[mode]}</p>

        <div style={s.form}>
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <Field label="邮箱">
              <input style={s.input} type="email" value={form.email} onChange={set('email')}
                placeholder="hello@example.com" onKeyDown={onEnter}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </Field>
          )}

          {mode === 'register' && (
            <Field label="用户名">
              <div style={{ position: 'relative' }}>
                <span style={s.inputPrefix}>linkhub.app/</span>
                <input style={{ ...s.input, paddingLeft: 108 }} value={form.username} onChange={set('username')}
                  placeholder="yourname" onKeyDown={onEnter}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </Field>
          )}

          {(mode === 'login' || mode === 'register') && (
            <Field label="密码">
              <input style={s.input} type="password" value={form.password} onChange={set('password')}
                placeholder={mode === 'register' ? '至少 6 位' : '••••••••'} onKeyDown={onEnter}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </Field>
          )}

          {mode === 'reset' && (<>
            <Field label="重置码">
              <input style={s.input} value={form.token} onChange={set('token')}
                placeholder="粘贴重置链接中的 token" onKeyDown={onEnter}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </Field>
            <Field label="新密码">
              <input style={s.input} type="password" value={form.newPassword} onChange={set('newPassword')}
                placeholder="至少 6 位" onKeyDown={onEnter}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </Field>
          </>)}

          {error && <div style={s.error}>⚠ {error}</div>}

          {success && (
            <div style={s.successBox}>
              <div>✓ {success}</div>
              {devUrl && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #bbf7d0', fontSize: 12 }}>
                  <div style={{ color: '#16a34a', fontWeight: 600, marginBottom: 6 }}>开发模式 · 重置链接：</div>
                  <a href={devUrl} style={{ color: '#15803d', wordBreak: 'break-all', fontSize: 11 }}>{devUrl}</a>
                </div>
              )}
            </div>
          )}

          {!success && (
            <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? '处理中...' : { login: '登录', register: '注册并开始', forgot: '发送重置链接', reset: '确认重置密码' }[mode]}
            </button>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <button style={s.link} onClick={() => switchMode('forgot')}>忘记密码？</button>
            </div>
          )}
        </div>

        <div style={s.switchRow}>
          {mode === 'login' && <span style={{ color: '#6b7280' }}>还没有账号？<button style={s.link} onClick={() => switchMode('register')}>免费注册</button></span>}
          {mode === 'register' && <span style={{ color: '#6b7280' }}>已有账号？<button style={s.link} onClick={() => switchMode('login')}>登录</button></span>}
          {(mode === 'forgot' || mode === 'reset') && <button style={s.link} onClick={() => switchMode('login')}>← 返回登录</button>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f4f4f5', padding: 20, fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: '100%', maxWidth: 420,
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20,
    padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoBox: {
    width: 28, height: 28, background: '#2563eb', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: 700, fontFamily: 'DM Serif Display, serif', color: '#111' },
  title: { fontSize: 26, fontWeight: 700, color: '#111', marginBottom: 6, marginTop: 0, fontFamily: "'DM Serif Display', serif" },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.6, marginTop: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: 8, padding: '10px 14px',
    color: '#111', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.2s',
  },
  inputPrefix: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    fontSize: 13, color: '#9ca3af', pointerEvents: 'none',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626',
  },
  successBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#16a34a', lineHeight: 1.6,
  },
  btn: {
    background: '#2563eb', border: 'none',
    borderRadius: 8, padding: '12px', color: '#fff', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 4,
    transition: 'opacity 0.2s',
  },
  switchRow: { textAlign: 'center', marginTop: 22, fontSize: 14 },
  link: {
    background: 'none', border: 'none', color: '#2563eb',
    cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginLeft: 4,
  },
}
