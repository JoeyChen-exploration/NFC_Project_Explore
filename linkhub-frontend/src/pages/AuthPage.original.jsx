import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

// ── Floating label input ─────────────────────────────────────────────────

function FloatInput({ label, type = 'text', value, onChange, onKeyDown, autoComplete, prefix }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || Boolean(value);

  return (
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span
          style={{
            position: 'absolute',
            left: 16,
            top: lifted ? '60%' : '50%',
            transform: 'translateY(-50%)',
            fontSize: 15,
            color: 'rgba(255,255,255,0.35)',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'opacity 0.18s',
            opacity: lifted ? 1 : 0,
            fontFamily: 'var(--font-ui)',
          }}
        >
          {prefix}
        </span>
      )}
      <label
        style={{
          position: 'absolute',
          zIndex: 1,
          left: prefix && lifted ? `${prefix.length * 9 + 16}px` : 16,
          top: lifted ? 10 : '50%',
          transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? 11 : 15,
          fontWeight: lifted ? 600 : 400,
          color: focused ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.4)',
          transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: 'none',
          letterSpacing: lifted ? '0.05em' : 0,
          textTransform: lifted ? 'uppercase' : 'none',
        }}
      >
        {label}
      </label>
      <input
        className="auth-input"
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${focused ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 12,
          padding: lifted
            ? `26px ${prefix && lifted ? prefix.length * 9 + 52 : 16}px 10px 16px`
            : '18px 16px',
          color: '#fff',
          fontSize: 15,
          fontFamily: 'var(--font-ui)',
          outline: 'none',
          transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: focused ? '0 0 0 4px rgba(124,58,237,0.15)' : 'none',
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    token: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setMode('reset');
      setForm(f => ({ ...f, token }));
    }
  }, [searchParams]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const switchMode = m => {
    setMode(m);
    setError('');
    setSuccess('');
    setDevUrl('');
  };

  async function handleSubmit() {
    setError('');
    setSuccess('');
    setDevUrl('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await api.login({ email: form.email, password: form.password });
        login(data.token, data.user);
        navigate('/dashboard');
      } else if (mode === 'register') {
        const data = await api.register({
          email: form.email,
          username: form.username,
          password: form.password,
        });
        login(data.token, data.user);
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        const data = await api.forgotPassword({ email: form.email });
        setSuccess(data.message);
        if (data.dev_reset_url) setDevUrl(data.dev_reset_url);
      } else if (mode === 'reset') {
        const data = await api.resetPassword({ token: form.token, newPassword: form.newPassword });
        setSuccess(data.message);
        setTimeout(() => switchMode('login'), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const onEnter = e => e.key === 'Enter' && handleSubmit();

  const titles = {
    login: '欢迎回来',
    register: '开始你的旅程',
    forgot: '找回账号',
    reset: '重设密码',
  };
  const subtitles = {
    login: '你的个人主页，一扫即达',
    register: '30 秒创建专属 link-in-bio 主页',
    forgot: '输入邮箱，我们发送重置链接',
    reset: '输入新密码完成重置',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'var(--font-ui)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Background orbs ── */}
      <div
        className="auth-orb-1"
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-8%',
          width: 680,
          height: 680,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 40% 40%, rgba(124,58,237,0.30) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="auth-orb-2"
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-12%',
          width: 580,
          height: 580,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 60% 60%, rgba(6,182,212,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="auth-orb-3"
        style={{
          position: 'absolute',
          top: '50%',
          left: '35%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Noise texture overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.5,
        }}
      />

      {/* ── Card ── */}
      <div
        key={mode}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.10)',
          padding: '40px 36px 32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          animation: 'scaleIn 0.28s cubic-bezier(0.4,0,0.2,1) both',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>L</span>
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.65))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.3px',
            }}
          >
            LinkHub
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: '0 0 6px',
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.6px',
          }}
        >
          {titles[mode]}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.45)',
            margin: '0 0 28px',
            lineHeight: 1.6,
          }}
        >
          {subtitles[mode]}
        </p>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <FloatInput
              label="邮箱"
              type="email"
              value={form.email}
              onChange={set('email')}
              onKeyDown={onEnter}
              autoComplete="email"
            />
          )}

          {mode === 'register' && (
            <FloatInput
              label="用户名"
              value={form.username}
              onChange={set('username')}
              onKeyDown={onEnter}
              prefix="linkhub.app/"
              autoComplete="username"
            />
          )}

          {(mode === 'login' || mode === 'register') && (
            <FloatInput
              label="密码"
              type="password"
              value={form.password}
              onChange={set('password')}
              onKeyDown={onEnter}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          )}

          {mode === 'reset' && (
            <>
              <FloatInput
                label="重置码"
                value={form.token}
                onChange={set('token')}
                onKeyDown={onEnter}
              />
              <FloatInput
                label="新密码"
                type="password"
                value={form.newPassword}
                onChange={set('newPassword')}
                onKeyDown={onEnter}
                autoComplete="new-password"
              />
            </>
          )}

          {error && (
            <div
              style={{
                background: 'rgba(255,59,48,0.12)',
                border: '1px solid rgba(255,59,48,0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: '#ff6b6b',
                animation: 'fadeUp 0.15s both',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: 'rgba(52,199,89,0.12)',
                border: '1px solid rgba(52,199,89,0.3)',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 13,
                color: '#4ade80',
                lineHeight: 1.6,
              }}
            >
              <div>{success}</div>
              {devUrl && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(52,199,89,0.2)',
                    fontSize: 11,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4, opacity: 0.8 }}>
                    开发模式 · 重置链接：
                  </div>
                  <a
                    href={devUrl}
                    style={{ color: 'inherit', wordBreak: 'break-all', opacity: 0.7 }}
                  >
                    {devUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {!success && (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: 12,
                padding: '14px',
                marginTop: 4,
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)',
                opacity: loading ? 0.65 : 1,
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                letterSpacing: '-0.2px',
              }}
            >
              {loading
                ? '处理中...'
                : {
                    login: '登录',
                    register: '立即注册',
                    forgot: '发送重置链接',
                    reset: '确认重置',
                  }[mode]}
            </button>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <button style={linkBtn} onClick={() => switchMode('forgot')}>
                忘记密码？
              </button>
            </div>
          )}
        </div>

        {/* Footer switch */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
          {mode === 'login' && (
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
              还没有账号？
              <button style={linkBtn} onClick={() => switchMode('register')}>
                免费注册
              </button>
            </span>
          )}
          {mode === 'register' && (
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
              已有账号？
              <button style={linkBtn} onClick={() => switchMode('login')}>
                登录
              </button>
            </span>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <button style={linkBtn} onClick={() => switchMode('login')}>
              ← 返回登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const linkBtn = {
  background: 'none',
  border: 'none',
  color: 'rgba(167,139,250,0.9)',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: 'var(--font-ui)',
  fontWeight: 500,
  marginLeft: 4,
  transition: 'color 0.15s',
};
