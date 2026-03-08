import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { api } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getAnalytics()
      .then(setStats)
      .catch(e => setError(e.message))
  }, [])

  function fillDays(data) {
    const map = {}
    data.forEach(d => { map[d.date] = d.count })
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      result.push({ date: key.slice(5), count: map[key] || 0 })
    }
    return result
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAV (matches EditorPage) ── */}
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

        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6 }}>
          ← 返回编辑器
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>数据分析</span>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>@{user?.username}</span>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px', width: '100%', boxSizing: 'border-box' }}>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, color: '#dc2626', marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        {!stats && !error && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontSize: 14 }}>加载中...</div>
        )}

        {stats && (<>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label="总访问量"  value={stats.summary.total_page_views}  accent="#2563eb" />
            <StatCard label="总点击数"  value={stats.summary.total_link_clicks} accent="#0891b2" />
            <StatCard
              label="点击率"
              value={stats.summary.total_page_views > 0
                ? `${Math.round((stats.summary.total_link_clicks / stats.summary.total_page_views) * 100)}%`
                : '—'}
              accent="#059669" />
          </div>

          {/* Area chart */}
          <Section title="过去 7 天访问趋势">
            {stats.daily_views_7d.length === 0
              ? <Empty text="暂无访问数据，分享你的主页链接来获取访客！" />
              : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={fillDays(stats.daily_views_7d)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      labelStyle={{ color: '#6b7280' }} itemStyle={{ color: '#2563eb' }} />
                    <Area type="monotone" dataKey="count" name="访问量" stroke="#2563eb" strokeWidth={2} fill="url(#grad)" dot={{ fill: '#2563eb', r: 3, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
          </Section>

          {/* Bar chart */}
          <Section title="链接点击排行（近 30 天）" style={{ marginTop: 20 }}>
            {stats.clicks_per_link.length === 0
              ? <Empty text="还没有添加任何链接" />
              : (<>
                <ResponsiveContainer width="100%" height={Math.max(160, stats.clicks_per_link.length * 44)}>
                  <BarChart data={stats.clicks_per_link} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      labelStyle={{ color: '#6b7280' }} itemStyle={{ color: '#2563eb' }} />
                    <Bar dataKey="clicks" name="点击数" radius={[0, 6, 6, 0]}>
                      {stats.clicks_per_link.map((_, i) => (
                        <Cell key={i} fill={`hsl(${217 - i * 14}, ${80 - i * 4}%, ${52 + i * 3}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div style={{ marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                  {stats.clicks_per_link.map((link, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{link.label}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{link.url}</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb', fontFamily: "'DM Serif Display', serif", minWidth: 40, textAlign: 'right' }}>
                        {link.clicks}
                      </div>
                    </div>
                  ))}
                </div>
              </>)}
          </Section>
        </>)}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      padding: '22px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: accent, fontFamily: "'DM Serif Display', serif", marginBottom: 6, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
    </div>
  )
}

function Section({ title, children, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', ...style,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{title}</div>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#9ca3af' }}>{text}</div>
}
