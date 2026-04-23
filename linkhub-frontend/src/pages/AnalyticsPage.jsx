import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';
import { AppShell, AppTopbar } from '../components/AppShell';

function fillDays(data) {
  const map = {};
  data.forEach(item => {
    map[item.date] = item.count;
  });

  const result = [];
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    result.push({ date: key.slice(5), count: map[key] || 0 });
  }
  return result;
}

function Stat({ label, value, note }) {
  return (
    <div className="mono-stat">
      <div className="mono-kicker">{label}</div>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAnalytics()
      .then(setStats)
      .catch(err => setError(err.message || '获取分析数据失败'));
  }, []);

  const views = stats?.summary?.total_page_views || 0;
  const clicks = stats?.summary?.total_link_clicks || 0;
  const ctr = views > 0 ? `${Math.round((clicks / views) * 100)}%` : '0%';
  const dailyViews = useMemo(() => fillDays(stats?.daily_views_7d || []), [stats]);

  return (
    <AppShell>
      <AppTopbar
        title="Analytics"
        subtitle={`@${user?.username || 'user'} 的触达表现`}
        actions={
          <>
            <button className="mono-btn-ghost" onClick={() => navigate('/dashboard')}>
              返回总览
            </button>
            <button className="mono-btn-muted" onClick={() => navigate('/editor')}>
              编辑主页
            </button>
          </>
        }
      />

      <main className="mono-main">
        <section className="mono-panel" style={{ marginBottom: 20 }}>
          <div className="mono-kicker">Performance Overview</div>
          <h1 style={{ margin: '14px 0 12px', fontSize: '2.8rem', letterSpacing: '-0.06em' }}>
            页面访问、链接点击和转化，应该在一页里讲清楚。
          </h1>
        </section>

        {error && (
          <div className="mono-alert is-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {!stats && !error && (
          <div className="mono-panel" style={{ textAlign: 'center' }}>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="mono-note" style={{ marginTop: 12 }}>
              正在读取你的分析数据...
            </div>
          </div>
        )}

        {stats && (
          <>
            <section className="mono-grid-3" style={{ marginBottom: 20 }}>
              <Stat label="Page Views" value={views} note="公开页总访问" />
              <Stat label="Link Clicks" value={clicks} note="用户主动点击" />
              <Stat label="CTR" value={ctr} note="访问到点击的转化率" />
            </section>

            <section className="mono-grid-2">
              <div className="mono-panel">
                <div className="mono-panel-header">
                  <div>
                    <div className="mono-kicker">7 Day Trend</div>
                    <h2>最近 7 天访问趋势</h2>
                  </div>
                  <span className="mono-badge">Views</span>
                </div>

                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyViews}
                      margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="analyticsArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#111111" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="#111111" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(17,17,17,0.06)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#7c7c84', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: '#7c7c84', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 18,
                          border: '1px solid rgba(17,17,17,0.08)',
                          background: 'rgba(255,255,255,0.95)',
                          boxShadow: '0 18px 36px rgba(17,17,17,0.08)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#111111"
                        strokeWidth={2}
                        fill="url(#analyticsArea)"
                        dot={{ fill: '#111111', r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mono-panel">
                <div className="mono-panel-header">
                  <div>
                    <div className="mono-kicker">Link Ranking</div>
                    <h2>近 30 天点击排行</h2>
                  </div>
                  <span className="mono-badge">Clicks</span>
                </div>

                {stats.clicks_per_link.length === 0 ? (
                  <div className="mono-note">还没有链接点击数据，先把主页分发出去试一轮。</div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: Math.max(220, stats.clicks_per_link.length * 52),
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.clicks_per_link}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid stroke="rgba(17,17,17,0.06)" horizontal={false} />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fill: '#7c7c84', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={120}
                          tick={{ fill: '#4f4f53', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 18,
                            border: '1px solid rgba(17,17,17,0.08)',
                            background: 'rgba(255,255,255,0.95)',
                            boxShadow: '0 18px 36px rgba(17,17,17,0.08)',
                          }}
                        />
                        <Bar dataKey="clicks" radius={[0, 10, 10, 0]}>
                          {stats.clicks_per_link.map((item, index) => (
                            <Cell
                              key={`${item.label}-${index}`}
                              fill={
                                index === 0 ? '#111111' : `rgba(17,17,17,${0.78 - index * 0.12})`
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}
