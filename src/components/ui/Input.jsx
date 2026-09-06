import React from 'react';

/**
 * Reusable Input component with label, error states, and optional leading/trailing icons.
 */
export function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  icon: Icon = null,
  rightElement = null,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          >
            <Icon size={18} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: Icon ? '10px 14px 10px 38px' : rightElement ? '10px 42px 10px 14px' : '10px 14px',
            background: 'var(--bg-elevated)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-medium)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.925rem',
            outline: 'none',
            transition: 'var(--transition-smooth)',
            opacity: disabled ? 0.6 : 1,
          }}
          className={`input-focus ${className}`}
          {...props}
        />

        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{helperText}</span>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  error,
  helperText,
  id,
  rows = 4,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <textarea
        id={inputId}
        rows={rows}
        disabled={disabled}
        required={required}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-medium)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.925rem',
          outline: 'none',
          resize: 'vertical',
          transition: 'var(--transition-smooth)',
          opacity: disabled ? 0.6 : 1,
        }}
        {...props}
      />

      {error ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
}

export default Input;
