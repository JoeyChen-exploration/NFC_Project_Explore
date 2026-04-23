export function AppShell({ children }) {
  return <div className="mono-app">{children}</div>;
}

export function AppTopbar({ title, subtitle, actions, badge = 'L' }) {
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
        {actions && <div className="mono-toolbar">{actions}</div>}
      </div>
    </div>
  );
}
