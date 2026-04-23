import { useNavigate } from 'react-router-dom';
import { AppShell, AppTopbar } from '../components/AppShell';

const principles = [
  '单色为主，避免颜色噪音，让结构和文字层级自己说话。',
  '背景不平，但也不花：用轻网格和雾感玻璃做空间层次。',
  '卡片圆角更大，信息更少，边界更克制，营造高级作品集感。',
  '按钮和交互反馈保持收敛，强调精密而不是炫耀。',
  '移动端和桌面端使用同一套秩序，而不是两套完全不同的样式。',
  '公开页、后台、编辑器用同一语言，避免像拼接站点。',
];

export default function FrontendShowcasePage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <AppTopbar
        title="Design Direction"
        subtitle="Monochrome, minimal, premium"
        actions={
          <>
            <button className="mono-btn-ghost" onClick={() => navigate('/login')}>
              登录
            </button>
            <button className="mono-btn-muted" onClick={() => navigate('/dashboard')}>
              查看总览
            </button>
          </>
        }
      />

      <main className="mono-main">
        <section className="mono-panel" style={{ marginBottom: 20 }}>
          <div className="mono-kicker">Front-end System</div>
          <h1 className="mono-title" style={{ maxWidth: 820 }}>
            黑白，不是保守。
          </h1>
          <p className="mono-copy">
            它可以更前沿，只是前沿不一定要靠五颜六色来表达。这个项目的新方向是把高级感建立在留白、秩序、层次和精确交互上。
          </p>
        </section>

        <section className="mono-grid-2">
          <div className="mono-panel">
            <div className="mono-panel-header">
              <div>
                <div className="mono-kicker">What Changed</div>
                <h2>这次统一风格的核心</h2>
              </div>
            </div>
            <ul className="mono-showcase-list" style={{ padding: 0, margin: 0 }}>
              {principles.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mono-panel">
            <div className="mono-panel-header">
              <div>
                <div className="mono-kicker">Product Intent</div>
                <h2>这个产品应该给人的感觉</h2>
              </div>
            </div>
            <div className="mono-stack">
              <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                <strong>Professional</strong>
                <div className="mono-note" style={{ marginTop: 6 }}>
                  看上去像一个成熟系统，而不是 demo 页面集合。
                </div>
              </div>
              <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                <strong>Quiet Confidence</strong>
                <div className="mono-note" style={{ marginTop: 6 }}>
                  不靠炫目的视觉噱头，也能让人感受到价值和品质。
                </div>
              </div>
              <div className="mono-surface" style={{ padding: 18, borderRadius: 20 }}>
                <strong>Operational</strong>
                <div className="mono-note" style={{ marginTop: 6 }}>
                  每个页面都应该服务于真实使用场景，而不是为了展示而展示。
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
