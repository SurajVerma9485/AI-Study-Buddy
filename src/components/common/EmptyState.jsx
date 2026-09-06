import React from 'react';
import { BookOpen } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Reusable EmptyState component for courses, documents, quizzes, plans.
 */
export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'No items found',
  description = 'Get started by creating your first course or uploading course documents.',
  actionLabel = '',
  actionIcon = null,
  onAction = null,
  secondaryAction = null,
}) {
  return (
    <div
      style={{
        padding: '56px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--border-medium)',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        width: '100%',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)',
        }}
      >
        <Icon size={32} />
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
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
          maxWidth: '480px',
          marginBottom: (actionLabel && onAction) || secondaryAction ? '24px' : '0',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="md"
            icon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
