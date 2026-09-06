import React from 'react';
import Badge from '../../../components/ui/Badge';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

export default function TopicPriorityBadge({ priority = 'Medium' }) {
  const norm = String(priority).toLowerCase();

  if (norm === 'critical') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.725rem',
          fontWeight: 700,
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        <AlertTriangle size={12} />
        Critical
      </span>
    );
  }

  if (norm === 'high') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.725rem',
          fontWeight: 700,
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        <ArrowUp size={12} />
        High
      </span>
    );
  }

  if (norm === 'low') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.725rem',
          fontWeight: 700,
          background: 'rgba(100, 116, 139, 0.15)',
          color: '#94a3b8',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        <ArrowDown size={12} />
        Low
      </span>
    );
  }

  // Default Medium
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.725rem',
        fontWeight: 700,
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#3b82f6',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      <AlertCircle size={12} />
      Medium
    </span>
  );
}
