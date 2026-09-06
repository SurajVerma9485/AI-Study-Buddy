import React from 'react';
import { Loader2, CheckCircle2, XCircle, UploadCloud } from 'lucide-react';
import Badge from '../../../components/ui/Badge';

/**
 * ProcessingStatus Component
 * Displays indicator and badge for:
 * - 'uploading'
 * - 'processing'
 * - 'completed'
 * - 'failed'
 */
export default function ProcessingStatus({ status = 'uploading', className = '' }) {
  switch (status.toLowerCase()) {
    case 'uploading':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.775rem',
            fontWeight: 600,
            color: '#60a5fa',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}
          className={className}
        >
          <UploadCloud size={14} className="animate-pulse" />
          Uploading to Server...
        </span>
      );

    case 'processing':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.775rem',
            fontWeight: 600,
            color: '#fbbf24',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
          className={className}
        >
          <Loader2 size={14} className="animate-spin" />
          Processing & Embedding...
        </span>
      );

    case 'completed':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.775rem',
            fontWeight: 600,
            color: '#34d399',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
          className={className}
        >
          <CheckCircle2 size={14} />
          Ready for AI Tutor
        </span>
      );

    case 'failed':
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.775rem',
            fontWeight: 600,
            color: '#f87171',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
          className={className}
        >
          <XCircle size={14} />
          Ingestion Failed
        </span>
      );

    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
