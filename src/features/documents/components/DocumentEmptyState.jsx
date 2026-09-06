import React from 'react';
import { FileUp, FileText } from 'lucide-react';
import Button from '../../../components/ui/Button';

/**
 * DocumentEmptyState Component
 * Clean empty state for courses without documents yet
 */
export default function DocumentEmptyState({ onUploadClick }) {
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
        border: '2px dashed var(--border-medium)',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        width: '100%',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)',
        }}
      >
        <FileUp size={30} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
        No Course Materials Uploaded
      </h3>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '460px', lineHeight: 1.5, marginBottom: '20px' }}>
        Upload course syllabus, lecture PDFs, DOCX study notes, or TXT summaries. The AI Tutor uses these documents to provide verified, grounded explanations.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['PDF Slides', 'DOCX Notes', 'TXT Summaries'].map((type) => (
          <span
            key={type}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {type}
          </span>
        ))}
      </div>

      {onUploadClick && (
        <Button
          variant="primary"
          size="md"
          icon={FileUp}
          onClick={onUploadClick}
        >
          Upload Course Material
        </Button>
      )}
    </div>
  );
}
