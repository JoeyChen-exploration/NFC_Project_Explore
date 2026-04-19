import { useState } from 'react';
import { api } from '../../api';
import { Card, SectionTitle, FormField, LightInput, bluePillBtn } from './ui';

export default function SettingsPanel({ user }) {
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setPwd(p => ({ ...p, [k]: e.target.value }));

  async function handleChange() {
    setMsg('');
    setErr('');
    if (pwd.newPassword !== pwd.confirm) {
      setErr('两次输入的新密码不一致');
      return;
    }
    setLoading(true);
    try {
      const res = await api.changePassword({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setMsg(res.message);
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle>账号信息</SectionTitle>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '11px 0',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
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
            <LightInput
              type="password"
              value={pwd.currentPassword}
              onChange={set('currentPassword')}
              placeholder="••••••••"
            />
          </FormField>
          <FormField label="新密码">
            <LightInput
              type="password"
              value={pwd.newPassword}
              onChange={set('newPassword')}
              placeholder="至少 6 位"
            />
          </FormField>
          <FormField label="确认新密码">
            <LightInput
              type="password"
              value={pwd.confirm}
              onChange={set('confirm')}
              placeholder="再输一次"
            />
          </FormField>

          {err && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#dc2626',
              }}
            >
              ⚠ {err}
            </div>
          )}
          {msg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#16a34a',
              }}
            >
              ✓ {msg}
            </div>
          )}

          <button
            onClick={handleChange}
            disabled={loading}
            style={{
              ...bluePillBtn,
              borderRadius: 8,
              padding: '11px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '修改中...' : '确认修改密码'}
          </button>
        </div>
      </Card>
    </div>
  );
}
