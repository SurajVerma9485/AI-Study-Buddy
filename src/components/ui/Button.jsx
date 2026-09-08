import React from 'react';

/**
 * Reusable Button component with multiple variants, sizes, and loading state.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  fullWidth = false,
  style = {},
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    transition: 'var(--transition-smooth)',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    gap: '10px',
    lineHeight: 1.2,
    userSelect: 'none',
    position: 'relative',
    outline: 'none',
  };

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '0.85rem', minHeight: '36px' },
    md: { padding: '12px 22px', fontSize: '0.95rem', minHeight: '44px' },
    lg: { padding: '15px 28px', fontSize: '1.05rem', minHeight: '52px' },
  };

  const variantStyles = {
    primary: {
      background: 'var(--primary-gradient)',
      color: '#ffffff',
      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-sm)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--primary)',
      border: '1px solid var(--primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--danger)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
    },
    success: {
      background: 'var(--success)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      type={type}
      style={combinedStyle}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn-hover-effect ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="animate-spin"
          style={{
            display: 'inline-block',
            width: size === 'sm' ? 14 : 18,
            height: size === 'sm' ? 14 : 18,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
          }}
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : 18} style={{ flexShrink: 0 }} />}
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : 18} style={{ flexShrink: 0 }} />}
        </>
      )}
    </button>
  );
}
