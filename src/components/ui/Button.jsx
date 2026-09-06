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
    gap: '8px',
    lineHeight: 1,
    userSelect: 'none',
    position: 'relative',
    outline: 'none',
  };

  const sizeStyles = {
    sm: { padding: '8px 14px', fontSize: '0.85rem' },
    md: { padding: '10px 18px', fontSize: '0.925rem' },
    lg: { padding: '14px 24px', fontSize: '1.05rem' },
  };

  const variantStyles = {
    primary: {
      background: 'var(--primary-gradient)',
      color: '#ffffff',
      boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
      border: 'none',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-medium)',
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
    },
    success: {
      background: 'var(--success)',
      color: '#ffffff',
      border: 'none',
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
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
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : 18} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : 18} />}
        </>
      )}
    </button>
  );
}
