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

  // Fill last 7 days (in case some days are missing from API)
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
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid #161616', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← 返回编辑器
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginLeft: 'auto' }}>
          <span style={{ color: '#8b5cf6', fontFamily: "'DM Serif Display',serif", fontSize: 17 }}>⬡ LinkHub</span>
          <span style={{ color: '#333', margin: '0 10px' }}>·</span>
          数据分析
        </div>
        <div style={{ fontSize: 13, color: '#444', marginLeft: 'auto' }}>@{user?.username}</div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 32px' }}>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 16, color: '#f87171', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {!stats && !error && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#333', fontSize: 14 }}>加载中...</div>
        )}

        {stats && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
              <StatCard label="总访问量" value={stats.summary.total_page_views} icon="👁" color="#8b5cf6" />
              <StatCard label="总点击数" value={stats.summary.total_link_clicks} icon="🔗" color="#3b82f6" />
              <StatCard
                label="点击率"
                value={stats.summary.total_page_views > 0
                  ? `${Math.round((stats.summary.total_link_clicks / stats.summary.total_page_views) * 100)}%`
                  : '—'}
                icon="📈" color="#22c55e" />
            </div>

            {/* Area chart — daily views */}
            <Section title="过去 7 天访问趋势">
              {stats.daily_views_7d.length === 0 ? (
                <Empty text="暂无访问数据，分享你的主页链接来获取访客！" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={fillDays(stats.daily_views_7d)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#888' }} itemStyle={{ color: '#a78bfa' }} />
                    <Area type="monotone" dataKey="count" name="访问量" stroke="#8b5cf6" strokeWidth={2} fill="url(#grad)" dot={{ fill: '#8b5cf6', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Section>

            {/* Bar chart — clicks per link */}
            <Section title="链接点击排行（近 30 天）" style={{ marginTop: 28 }}>
              {stats.clicks_per_link.length === 0 ? (
                <Empty text="还没有添加任何链接" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(160, stats.clicks_per_link.length * 44)}>
                    <BarChart data={stats.clicks_per_link} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fill: '#444', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="label" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip
                        contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: '#888' }} itemStyle={{ color: '#60a5fa' }} />
                      <Bar dataKey="clicks" name="点击数" radius={[0, 6, 6, 0]}>
                        {stats.clicks_per_link.map((_, i) => (
                          <Cell key={i} fill={`hsl(${250 - i * 18}, 70%, ${60 - i * 4}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Table */}
                  <div style={{ marginTop: 20, borderTop: '1px solid #161616', paddingTop: 16 }}>
                    {stats.clicks_per_link.map((link, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #111' }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#ddd', marginBottom: 2 }}>{link.label}</div>
                          <div style={{ fontSize: 11, color: '#444', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6', fontFamily: "'DM Serif Display',serif", minWidth: 40, textAlign: 'right' }}>
                          {link.clicks}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: '24px 20px' }}>
      <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color, fontFamily: "'DM Serif Display',serif", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#555' }}>{label}</div>
    </div>
  )
}

function Section({ title, children, style }) {
  return (
    <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: '24px', ...style }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 11 }}>{title}</div>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#333' }}>{text}</div>
}
