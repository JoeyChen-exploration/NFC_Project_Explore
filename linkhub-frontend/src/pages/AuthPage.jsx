import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const data = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      {/* Background noise texture */}
      <div style={styles.bg} />

      {/* Glow orbs */}
      <div style={{ ...styles.orb, top: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      <div style={{ ...styles.orb, bottom: '-15%', right: '-10%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>LinkHub</span>
        </div>

        <h1 style={styles.title}>
          {mode === 'login' ? '欢迎回来' : '创建你的主页'}
        </h1>
        <p style={styles.subtitle}>
          {mode === 'login' ? '登录以继续编辑你的个人主页' : '30 秒创建你的专属 link-in-bio 主页'}
        </p>

        {/* Form */}
        <div style={styles.form}>
          <Field label="邮箱">
            <input style={styles.input} type="email" value={form.email} onChange={set('email')}
              placeholder="hello@example.com" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </Field>

          {mode === 'register' && (
            <Field label="用户名">
              <div style={{ position: 'relative' }}>
                <span style={styles.inputPrefix}>linkhub.app/</span>
                <input style={{ ...styles.input, paddingLeft: 108 }} value={form.username} onChange={set('username')}
                  placeholder="yourname" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
            </Field>
          )}

          <Field label="密码">
            <input style={styles.input} type="password" value={form.password} onChange={set('password')}
              placeholder={mode === 'register' ? '至少 6 位' : '••••••••'} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </Field>

          {error && (
            <div style={styles.error}>⚠ {error}</div>
          )}

          <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册并开始'}
          </button>
        </div>

        <div style={styles.switchRow}>
          {mode === 'login' ? (
            <span>还没有账号？<button style={styles.link} onClick={() => { setMode('register'); setError('') }}>免费注册</button></span>
          ) : (
            <span>已有账号？<button style={styles.link} onClick={() => { setMode('login'); setError('') }}>登录</button></span>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
      {children}
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#080808', position: 'relative', overflow: 'hidden', padding: 20,
  },
  bg: {
    position: 'absolute', inset: 0, opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundSize: '200px',
  },
  orb: { position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%', pointerEvents: 'none' },
  card: {
    width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24,
    padding: '40px 36px', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: { fontSize: 22, color: '#8b5cf6' },
  logoText: { fontSize: 18, fontWeight: 700, fontFamily: 'DM Serif Display, serif', color: '#fff', letterSpacing: '-0.3px' },
  title: { fontSize: 28, fontWeight: 400, fontFamily: 'DM Serif Display, serif', color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 32, lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', transition: 'border-color 0.2s',
  },
  inputPrefix: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    fontSize: 13, color: '#555', pointerEvents: 'none',
  },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171',
  },
  btn: {
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none',
    borderRadius: 10, padding: '13px', color: '#fff', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4,
    transition: 'opacity 0.2s, transform 0.1s',
  },
  switchRow: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#555' },
  link: { background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, marginLeft: 4 },
}
