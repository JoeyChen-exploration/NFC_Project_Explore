import { useI18n } from '../hooks/useI18n';

export function AppShell({ children }) {
  return <div className="mono-app">{children}</div>;
}

export function AppTopbar({ title, subtitle, actions, badge = 'L' }) {
  const { isZh, toggleLocale } = useI18n();

  return (
    <div className="mono-topbar">
      <div className="mono-topbar-inner">
        <div className="mono-brand">
          <div className="mono-brand-mark">{badge}</div>
          <div className="mono-brand-copy">
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </div>
        </div>
        <div className="mono-toolbar">
          <button className="mono-btn-ghost" onClick={toggleLocale}>
            {isZh ? 'EN' : '中文'}
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
}
