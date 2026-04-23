import { useScreenSize } from '../../hooks/useScreenSize';

// ── Layout Primitives ────────────────────────────────────────────────────

export function Card({ children, style, noHover }) {
  const { isMobile } = useScreenSize();
  return (
    <div
      className={noHover ? '' : 'hover-card'}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,250,250,0.96) 100%)',
        borderRadius: isMobile ? '24px' : '28px',
        border: '1px solid rgba(15, 15, 15, 0.08)',
        padding: isMobile ? '18px 18px' : '24px 24px',
        boxShadow: '0 22px 60px rgba(15, 15, 15, 0.06)',
        backdropFilter: 'blur(18px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, style }) {
  return (
    <div
      style={{
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--c-text)',
        letterSpacing: '-0.03em',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--c-text-2)',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Form Controls ────────────────────────────────────────────────────────

export const lightInputBase = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.84)',
  border: '1px solid rgba(15, 15, 15, 0.12)',
  borderRadius: '18px',
  padding: '13px 15px',
  color: 'var(--c-text)',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'var(--font-ui)',
  transition: 'border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast)',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
};

export function LightInput({ onBlur, ...props }) {
  const { isMobile } = useScreenSize();
  return (
    <input
      style={{ ...lightInputBase, fontSize: isMobile ? 16 : 14 }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(15, 15, 15, 0.84)';
        e.target.style.boxShadow = '0 0 0 4px rgba(15, 15, 15, 0.06)';
        e.target.style.background = '#fff';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'rgba(15, 15, 15, 0.12)';
        e.target.style.boxShadow = 'none';
        e.target.style.background = 'rgba(255,255,255,0.84)';
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

export function Toggle({ on, onClick }) {
  const { isMobile } = useScreenSize();
  const w = isMobile ? 44 : 36;
  const h = isMobile ? 24 : 20;
  const dot = isMobile ? 18 : 14;
  const pad = 3;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,
        minHeight: 44,
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          borderRadius: h / 2,
          background: on ? 'var(--mono-text)' : 'rgba(15, 15, 15, 0.15)',
          position: 'relative',
          transition: 'background var(--t-fast)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: pad,
            left: on ? w - dot - pad : pad,
            width: dot,
            height: dot,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.18s cubic-bezier(.4,0,.2,1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
          }}
        />
      </div>
    </div>
  );
}

// ── Shared Button Styles ─────────────────────────────────────────────────

export const inlineInput = {
  display: 'block',
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'var(--font-ui)',
  padding: '1px 0',
  color: 'var(--c-text)',
};

export const bluePillBtn = {
  background: 'var(--mono-text)',
  color: '#fff',
  border: '1px solid var(--mono-text)',
  borderRadius: 980,
  padding: '10px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-ui)',
  minHeight: 44,
  minWidth: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background var(--t-fast), transform var(--t-fast), border-color var(--t-fast)',
  letterSpacing: '0.01em',
};

export const navBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'rgba(255,255,255,0.84)',
  border: '1px solid rgba(15, 15, 15, 0.1)',
  borderRadius: '999px',
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--c-text)',
  cursor: 'pointer',
  fontFamily: 'var(--font-ui)',
  minHeight: 40,
  transition: 'background var(--t-fast), border-color var(--t-fast)',
  boxShadow: '0 10px 30px rgba(15, 15, 15, 0.05)',
  letterSpacing: '0.01em',
};

// ── Icons ────────────────────────────────────────────────────────────────

export function PencilIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
    </svg>
  );
}

export function DragIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.35 }}>
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
