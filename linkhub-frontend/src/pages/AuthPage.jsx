import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

// mode: 'login' | 'register' | 'forgot' | 'reset'
export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', username: '', password: '', token: '', newPassword: '', currentPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [devUrl, setDevUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Auto-enter reset mode when ?token= is in URL
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setMode('reset')
      setForm(f => ({ ...f, token }))
    }
  }, [searchParams])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); setDevUrl('') }

  async function handleSubmit() {
    setError('')
    setSuccess('')
    setDevUrl('')
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

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <div style={{ ...styles.orb, top: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      <div style={{ ...styles.orb, bottom: '-15%', right: '-10%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>LinkHub</span>
        </div>

        <h1 style={styles.title}>
          {mode === 'login' && '欢迎回来'}
          {mode === 'register' && '创建你的主页'}
          {mode === 'forgot' && '重置密码'}
          {mode === 'reset' && '设置新密码'}
        </h1>
        <p style={styles.subtitle}>
          {mode === 'login' && '登录以继续编辑你的个人主页'}
          {mode === 'register' && '30 秒创建你的专属 link-in-bio 主页'}
          {mode === 'forgot' && '输入账号邮箱，我们将发送重置链接'}
          {mode === 'reset' && '输入新密码完成重置'}
        </p>

        <div style={styles.form}>

          {/* Email — shown in login / register / forgot */}
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <Field label="邮箱">
              <input style={styles.input} type="email" value={form.email} onChange={set('email')}
                placeholder="hello@example.com" onKeyDown={onEnter} />
            </Field>
          )}

          {/* Username — register only */}
          {mode === 'register' && (
            <Field label="用户名">
              <div style={{ position: 'relative' }}>
                <span style={styles.inputPrefix}>linkhub.app/</span>
                <input style={{ ...styles.input, paddingLeft: 108 }} value={form.username} onChange={set('username')}
                  placeholder="yourname" onKeyDown={onEnter} />
              </div>
            </Field>
          )}

          {/* Password — login / register */}
          {(mode === 'login' || mode === 'register') && (
            <Field label="密码">
              <input style={styles.input} type="password" value={form.password} onChange={set('password')}
                placeholder={mode === 'register' ? '至少 6 位' : '••••••••'} onKeyDown={onEnter} />
            </Field>
          )}

          {/* Reset token — reset mode (pre-filled from URL) */}
          {mode === 'reset' && (
            <Field label="重置码">
              <input style={styles.input} value={form.token} onChange={set('token')}
                placeholder="粘贴重置链接中的 token" onKeyDown={onEnter} />
            </Field>
          )}

          {/* New password — reset mode */}
          {mode === 'reset' && (
            <Field label="新密码">
              <input style={styles.input} type="password" value={form.newPassword} onChange={set('newPassword')}
                placeholder="至少 6 位" onKeyDown={onEnter} />
            </Field>
          )}

          {/* Error */}
          {error && <div style={styles.error}>⚠ {error}</div>}

          {/* Success */}
          {success && (
            <div style={styles.successBox}>
              <div style={{ marginBottom: devUrl ? 10 : 0 }}>✓ {success}</div>
              {devUrl && (
                <div style={{ fontSize: 12, borderTop: '1px solid rgba(34,197,94,0.2)', paddingTop: 10, marginTop: 2 }}>
                  <div style={{ color: '#4ade80', fontWeight: 600, marginBottom: 6 }}>
                    开发模式 · 重置链接：
                  </div>
                  <a href={devUrl} style={{ color: '#86efac', wordBreak: 'break-all', fontSize: 11 }}>{devUrl}</a>
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          {!success && (
            <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? '处理中...' : {
                login: '登录',
                register: '注册并开始',
                forgot: '发送重置链接',
                reset: '确认重置密码',
              }[mode]}
            </button>
          )}

          {/* Forgot password link — login mode only */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <button style={styles.link} onClick={() => switchMode('forgot')}>忘记密码？</button>
            </div>
          )}
        </div>

        {/* Bottom switch row */}
        <div style={styles.switchRow}>
          {mode === 'login' && (
            <span>还没有账号？<button style={styles.link} onClick={() => switchMode('register')}>免费注册</button></span>
          )}
          {mode === 'register' && (
            <span>已有账号？<button style={styles.link} onClick={() => switchMode('login')}>登录</button></span>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <span><button style={styles.link} onClick={() => switchMode('login')}>← 返回登录</button></span>
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
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  },
  inputPrefix: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    fontSize: 13, color: '#555', pointerEvents: 'none',
  },
  error: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171',
  },
  successBox: {
    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#4ade80', lineHeight: 1.5,
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
