import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

function MinimalInput({ type = 'text', placeholder, value, onChange, onKeyDown, autoComplete }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="input-minimal"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '13px 16px',
        fontSize: 15,
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
        backgroundColor: 'var(--white)',
        color: 'var(--gray-900)',
        fontFamily: 'var(--font-ui)',
        transition: 'border-color 0.15s',
        outline: 'none',
      }}
      onFocus={e => {
        e.target.style.borderColor = 'var(--black)';
        e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--gray-200)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

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
    login: 'Sign in',
    register: 'Get started',
    forgot: 'Reset password',
    reset: 'New password',
  };
  const btnLabels = {
    login: 'Continue',
    register: 'Create account',
    forgot: 'Send link',
    reset: 'Confirm',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div key={mode} style={{ width: '100%', maxWidth: 400, animation: 'scaleIn 0.22s both' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'var(--black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>L</span>
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--gray-900)',
              letterSpacing: '-0.3px',
            }}
          >
            LinkHub
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--gray-900)',
            margin: '0 0 36px',
            letterSpacing: '-0.5px',
          }}
        >
          {titles[mode]}
        </h1>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <MinimalInput
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              onKeyDown={onEnter}
              autoComplete="email"
            />
          )}

          {mode === 'register' && (
            <MinimalInput
              placeholder="Username"
              value={form.username}
              onChange={set('username')}
              onKeyDown={onEnter}
              autoComplete="username"
            />
          )}

          {(mode === 'login' || mode === 'register') && (
            <MinimalInput
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={set('password')}
              onKeyDown={onEnter}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          )}

          {mode === 'reset' && (
            <>
              <MinimalInput
                placeholder="Reset code"
                value={form.token}
                onChange={set('token')}
                onKeyDown={onEnter}
              />
              <MinimalInput
                type="password"
                placeholder="New password"
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
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--c-error)',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 13,
                color: 'var(--c-success)',
                lineHeight: 1.6,
              }}
            >
              <div>{success}</div>
              {devUrl && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid var(--gray-200)',
                    fontSize: 11,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--gray-500)' }}>
                    Dev · Reset link:
                  </div>
                  <a
                    href={devUrl}
                    style={{ color: 'inherit', wordBreak: 'break-all', opacity: 0.8 }}
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
                width: '100%',
                background: 'var(--black)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 8,
                padding: '14px',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-ui)',
                opacity: loading ? 0.5 : 1,
                letterSpacing: '-0.2px',
                marginTop: 4,
              }}
            >
              {loading ? '...' : btnLabels[mode]}
            </button>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right' }}>
              <button style={linkBtn} onClick={() => switchMode('forgot')}>
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--gray-500)' }}>
          {mode === 'login' && (
            <span>
              No account?{' '}
              <button style={linkBtn} onClick={() => switchMode('register')}>
                Sign up
              </button>
            </span>
          )}
          {mode === 'register' && (
            <span>
              Have an account?{' '}
              <button style={linkBtn} onClick={() => switchMode('login')}>
                Sign in
              </button>
            </span>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <button style={linkBtn} onClick={() => switchMode('login')}>
              ← Back to sign in
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
  color: 'var(--gray-900)',
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: 'var(--font-ui)',
  fontWeight: 500,
  padding: 0,
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
};
