import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

// 极致输入框组件
function MinimalInput({ type = 'text', placeholder, value, onChange, onKeyDown }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="input-minimal"
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        border: '1px solid var(--gray-200)',
        borderRadius: '8px',
        backgroundColor: 'var(--white)',
        color: 'var(--gray-900)',
        transition: 'all 0.2s ease',
      }}
      onFocus={e => {
        e.target.style.borderColor = 'var(--black)';
        e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.05)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--gray-200)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

// 极致按钮组件
function MinimalButton({ children, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px 24px',
        fontSize: '16px',
        fontWeight: '500',
        color: 'var(--white)',
        backgroundColor: 'var(--black)',
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.target.style.backgroundColor = 'var(--gray-800)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.target.style.backgroundColor = 'var(--black)';
        }
      }}
      onMouseDown={e => {
        if (!disabled) {
          e.target.style.transform = 'scale(0.98)';
        }
      }}
      onMouseUp={e => {
        if (!disabled) {
          e.target.style.transform = 'scale(1)';
        }
      }}
    >
      {children}
    </button>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const mode = searchParams.get('mode') || 'login';
  const isLogin = mode === 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('Email and password required');
      return;
    }

    if (!isLogin && !username.trim()) {
      setError('Username required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await api.register({ email, password, username });
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  // 极致克制的登录页面
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
      }}
    >
      {/* 极致卡片 */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: '16px',
          padding: '64px 48px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Logo + 标题 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '64px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--black)',
              letterSpacing: '-0.5px',
              marginBottom: '8px',
            }}
          >
            LinkHub
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'var(--gray-600)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </div>
        </div>

        {/* 表单区域 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {!isLogin && (
            <MinimalInput
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}

          <MinimalInput
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <MinimalInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div
            style={{
              fontSize: '14px',
              color: 'var(--gray-600)',
              textAlign: 'center',
              marginBottom: '24px',
              padding: '12px',
              backgroundColor: 'var(--gray-50)',
              borderRadius: '8px',
              border: '1px solid var(--gray-200)',
            }}
          >
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <MinimalButton onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : isLogin ? 'Continue' : 'Create Account'}
        </MinimalButton>

        {/* 切换链接 */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: 'var(--gray-600)',
          }}
        >
          {isLogin ? (
            <span>
              No account?{' '}
              <button
                onClick={() => navigate('/login?mode=register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--black)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--black)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
