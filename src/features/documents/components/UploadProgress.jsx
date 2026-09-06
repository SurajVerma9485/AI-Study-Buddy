import React from 'react';
import { FileText, Loader2, CheckCircle2 } from 'lucide-react';
import ProgressBar from '../../../components/ui/ProgressBar';

/**
 * UploadProgress Component
 * Displays real-time upload percentage and visual indicator
 */
export default function UploadProgress({ fileName, progress = 0, size = null }) {
  const isComplete = progress >= 100;

  return (
    <div
      style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <FileText size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {fileName}
            </span>
            {size && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                ({size})
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isComplete ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Uploaded
            </span>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Loader2 size={14} className="animate-spin" /> {progress}%
            </span>
          )}
        </div>
      </div>

      <ProgressBar
        value={progress}
        max={100}
        showValue={false}
        size="sm"
        variant={isComplete ? 'success' : 'primary'}
      />
    </div>
  );
}
