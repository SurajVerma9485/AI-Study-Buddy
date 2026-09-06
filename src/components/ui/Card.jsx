import React from 'react';

/**
 * Reusable Card component with Header, Title, Description, Content, and Footer.
 */
export default function Card({
  children,
  className = '',
  hoverable = false,
  glass = true,
  onClick,
  style = {},
  ...props
}) {
  const cardStyle = {
    background: glass ? 'var(--bg-card)' : 'var(--bg-elevated)',
    backdropFilter: glass ? 'blur(16px)' : 'none',
    WebkitBackdropFilter: glass ? 'blur(16px)' : 'none',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'var(--transition-smooth)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      className={`card-base ${hoverable ? 'card-hoverable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {}, action = null }) {
  return (
    <div
      style={{
        padding: '18px 20px 12px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        ...style,
      }}
      className={className}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {children}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '', style = {} }) {
  return (
    <h3
      style={{
        fontSize: '1.15rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
        lineHeight: 1.3,
        ...style,
      }}
      className={className}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', style = {} }) {
  return (
    <p
      style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        margin: 0,
        lineHeight: 1.4,
        ...style,
      }}
      className={className}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', style = {} }) {
  return (
    <div
      style={{
        padding: '12px 20px',
        flex: 1,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', style = {} }) {
  return (
    <div
      style={{
        padding: '12px 20px 18px 20px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
