import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { AppShell, AppTopbar } from '../components/AppShell';

const titles = {
  login: '进入你的名片工作台',
  register: '创建一个更高级的数字名片',
  forgot: '重设密码',
  reset: '设置新密码',
};

const buttonLabels = {
  login: '进入控制台',
  register: '创建账号',
  forgot: '发送重设链接',
  reset: '确认新密码',
};

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    token: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devUrl, setDevUrl] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setMode('reset');
      setForm(current => ({ ...current, token }));
    }
  }, [searchParams]);

  function setField(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
    setDevUrl('');
  }

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
        if (data.dev_reset_url) {
          setDevUrl(data.dev_reset_url);
        }
      } else if (mode === 'reset') {
        const data = await api.resetPassword({ token: form.token, newPassword: form.newPassword });
        setSuccess(data.message);
        setTimeout(() => switchMode('login'), 1800);
      }
    } catch (err) {
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <AppShell>
      <AppTopbar
        title="LinkHub"
        subtitle="Monochrome NFC identity system"
        actions={
          <>
            <button className="mono-btn-ghost" onClick={() => navigate('/showcase')}>
              设计方向
            </button>
            <button
              className="mono-btn-muted"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? '注册' : '登录'}
            </button>
          </>
        }
      />

      <div className="mono-auth">
        <section className="mono-auth-panel mono-auth-stage">
          <div>
            <div className="mono-kicker">Black / White / Precise</div>
            <h1 className="mono-title" style={{ maxWidth: 560 }}>
              简约，不等于平淡。
            </h1>
            <p className="mono-copy">
              这个项目最好的方向，是把公开主页、NFC
              分发和数据反馈做成一套统一体验。登录页也应该提前传达这种气质：克制、专业、没有噪音。
            </p>
          </div>

          <ul className="mono-showcase-list" style={{ padding: 0, marginBottom: 0 }}>
            <li>单色基调配合高级留白，而不是用颜色堆气氛。</li>
            <li>信息层级先于装饰，交互反馈克制但清晰。</li>
            <li>移动端和桌面端保持同一套设计语言。</li>
          </ul>
        </section>

        <section className="mono-auth-panel mono-auth-form">
          <div className="mono-kicker">{mode.toUpperCase()}</div>
          <h2 style={{ margin: '14px 0 10px', fontSize: '2rem', letterSpacing: '-0.05em' }}>
            {titles[mode]}
          </h2>
          <p className="mono-panel-meta" style={{ marginBottom: 22 }}>
            用最少的操作进入系统，把注意力留给主页和卡片本身。
          </p>

          <div className="mono-stack">
            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div className="mono-field">
                <label>Email</label>
                <input
                  className="mono-input"
                  type="email"
                  value={form.email}
                  placeholder="name@studio.com"
                  autoComplete="email"
                  onChange={event => setField('email', event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {mode === 'register' && (
              <div className="mono-field">
                <label>Username</label>
                <input
                  className="mono-input"
                  value={form.username}
                  placeholder="yourname"
                  autoComplete="username"
                  onChange={event => setField('username', event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="mono-field">
                <label>Password</label>
                <input
                  className="mono-input"
                  type="password"
                  value={form.password}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  onChange={event => setField('password', event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="mono-field">
                  <label>Reset Token</label>
                  <input
                    className="mono-input"
                    value={form.token}
                    placeholder="paste token"
                    onChange={event => setField('token', event.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="mono-field">
                  <label>New Password</label>
                  <input
                    className="mono-input"
                    type="password"
                    value={form.newPassword}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    onChange={event => setField('newPassword', event.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </>
            )}

            {error && <div className="mono-alert is-error">{error}</div>}
            {success && (
              <div className="mono-alert is-success">
                <div>{success}</div>
                {devUrl && (
                  <div style={{ marginTop: 8, wordBreak: 'break-all' }}>
                    <a href={devUrl}>{devUrl}</a>
                  </div>
                )}
              </div>
            )}

            <button className="mono-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? '处理中...' : buttonLabels[mode]}
            </button>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {mode !== 'login' && (
                <button className="mono-btn-ghost" onClick={() => switchMode('login')}>
                  返回登录
                </button>
              )}
              {mode === 'login' && (
                <>
                  <button className="mono-btn-ghost" onClick={() => switchMode('forgot')}>
                    忘记密码
                  </button>
                  <button className="mono-btn-muted" onClick={() => switchMode('register')}>
                    创建账号
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
