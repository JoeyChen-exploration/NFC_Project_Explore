import React from 'react';

/**
 * 极致克制图标组件
 * 用于显示黑白灰风格的线性图标
 */
export function MinimalIcon({ name, size = 64, className = '' }) {
  // 图标映射
  const iconMap = {
    // Bento网格图标
    links: '/src/assets/icons/bento/links.svg',
    theme: '/src/assets/icons/bento/theme.svg',
    social: '/src/assets/icons/bento/social.svg',
    profile: '/src/assets/icons/bento/profile.svg',
    preview: '/src/assets/icons/bento/preview.svg',
    nfc: '/src/assets/icons/bento/nfc.svg',
    settings: '/src/assets/icons/bento/settings.svg',
    analytics: '/src/assets/icons/bento/analytics.svg',
    export: '/src/assets/icons/bento/export.svg',

    // 导航图标
    home: '/src/assets/icons/navigation/home.svg',
    editor: '/src/assets/icons/navigation/editor.svg',
    'analytics-nav': '/src/assets/icons/navigation/analytics.svg',
    'settings-nav': '/src/assets/icons/navigation/settings.svg',
    help: '/src/assets/icons/navigation/help.svg',

    // 按钮图标
    plus: '/src/assets/icons/buttons/plus.svg',
    pencil: '/src/assets/icons/buttons/pencil.svg',
    trash: '/src/assets/icons/buttons/trash.svg',
    check: '/src/assets/icons/buttons/check.svg',
  };

  const iconPath = iconMap[name];

  if (!iconPath) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: 'var(--gray-100)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gray-400)',
          fontSize: '12px',
        }}
        className={className}
      >
        {name}
      </div>
    );
  }

  return (
    <img
      src={iconPath}
      alt={name}
      style={{
        width: size,
        height: size,
      }}
      className={className}
    />
  );
}

/**
 * Bento网格单元格组件
 */
export function BentoCell({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '32px 24px',
        backgroundColor: 'var(--white)',
        border: '1px solid var(--gray-200)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--gray-300)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--gray-200)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1) translateY(-2px)';
      }}
    >
      <MinimalIcon name={icon} size={64} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--black)',
          }}
        >
          {title}
        </div>

        {description && (
          <div
            style={{
              fontSize: '14px',
              color: 'var(--gray-600)',
              textAlign: 'center',
              maxWidth: '200px',
            }}
          >
            {description}
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * 极致克制按钮组件
 */
export function MinimalButton({ children, icon, onClick, disabled = false, variant = 'primary' }) {
  const variants = {
    primary: {
      backgroundColor: 'var(--black)',
      color: 'var(--white)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'var(--white)',
      color: 'var(--black)',
      border: '1px solid var(--gray-300)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--black)',
      border: 'none',
    },
  };

  const style = variants[variant] || variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '500',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = 'var(--gray-800)';
          } else if (variant === 'secondary') {
            e.currentTarget.style.borderColor = 'var(--black)';
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = 'var(--gray-100)';
          }
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = style.backgroundColor;
          } else if (variant === 'secondary') {
            e.currentTarget.style.borderColor = style.border;
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = style.backgroundColor;
          }
        }
      }}
      onMouseDown={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(0.98)';
        }
      }}
      onMouseUp={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {icon && <MinimalIcon name={icon} size={20} />}
      {children}
    </button>
  );
}
