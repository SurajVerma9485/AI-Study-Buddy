import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Reusable ErrorState component with title, message, and retry button.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this resource. Please try again.',
  onRetry = null,
  retryLabel = 'Try Again',
  compact = false,
}) {
  return (
    <div
      style={{
        padding: compact ? '24px' : '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        width: '100%',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <AlertTriangle size={26} />
      </div>

      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.925rem',
          maxWidth: '460px',
          marginBottom: onRetry ? '20px' : '0',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
