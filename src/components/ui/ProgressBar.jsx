import React from 'react';

/**
 * Reusable ProgressBar component for topic mastery, quiz completion, course progress.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  showValue = true,
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'auto', // 'auto' | 'primary' | 'success' | 'warning' | 'danger' | 'gradient'
  className = '',
  animated = false,
}) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  // Auto-pick color based on student mastery percentage if variant is 'auto'
  let fillColor = 'var(--primary-gradient)';
  if (variant === 'auto') {
    if (percentage >= 80) fillColor = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
    else if (percentage >= 50) fillColor = 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)';
    else if (percentage >= 30) fillColor = 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
    else fillColor = 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)';
  } else if (variant === 'success') {
    fillColor = 'var(--success)';
  } else if (variant === 'warning') {
    fillColor = 'var(--warning)';
  } else if (variant === 'danger') {
    fillColor = 'var(--danger)';
  } else if (variant === 'primary') {
    fillColor = 'var(--primary)';
  } else if (variant === 'gradient') {
    fillColor = 'var(--primary-gradient)';
  }

  const heightStyles = {
    sm: '6px',
    md: '10px',
    lg: '16px',
  };

  return (
    <div style={{ width: '100%' }} className={className}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '0.825rem',
          }}
        >
          {label && (
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: heightStyles[size] || '10px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: fillColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: percentage > 0 ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
