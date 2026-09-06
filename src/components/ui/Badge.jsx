import React from 'react';

/**
 * Reusable Badge component for topic mastery, difficulty tags, statuses, etc.
 */
export default function Badge({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size = 'md', // 'sm' | 'md'
  dot = false,
  className = '',
  style = {},
  ...props
}) {
  const variantStyles = {
    primary: {
      background: 'var(--primary-light)',
      color: '#818cf8',
      border: '1px solid rgba(99, 102, 241, 0.3)',
    },
    secondary: {
      background: 'var(--bg-elevated)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
    },
    success: {
      background: 'var(--success-light)',
      color: '#34d399',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    },
    warning: {
      background: 'var(--warning-light)',
      color: '#fbbf24',
      border: '1px solid rgba(245, 158, 11, 0.3)',
    },
    danger: {
      background: 'var(--danger-light)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    info: {
      background: 'var(--info-light)',
      color: '#22d3ee',
      border: '1px solid rgba(6, 182, 212, 0.3)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-medium)',
    },
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.725rem' },
    md: { padding: '4px 10px', fontSize: '0.8rem' },
  };

  const dotColors = {
    primary: '#6366f1',
    secondary: '#9ca3af',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    outline: '#9ca3af',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      className={className}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[variant] || 'currentColor',
          }}
        />
      )}
      {children}
    </span>
  );
}
