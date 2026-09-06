import React from 'react';
import { FileText, Database, Trash2, Calendar, HardDrive } from 'lucide-react';
import Card, { CardContent } from '../../../components/ui/Card';
import ProcessingStatus from './ProcessingStatus';
import Badge from '../../../components/ui/Badge';

/**
 * DocumentCard Component
 * Displays a single course material document with file type, upload date, and processing status.
 */
export default function DocumentCard({ document, onDelete }) {
  const getFileBadgeVariant = (type) => {
    switch (type?.toUpperCase()) {
      case 'PDF':
        return 'danger';
      case 'DOCX':
        return 'primary';
      case 'TXT':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <Card glass hoverable>
      <CardContent style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Left: Icon, File Name, Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={22} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                {document.fileName}
              </h4>
              <Badge variant={getFileBadgeVariant(document.fileType)} size="sm">
                {document.fileType || 'DOC'}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {document.size && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HardDrive size={12} /> {document.size}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Uploaded {document.uploadedAt}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Processing Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Chunks Indicator if processed */}
          {document.chunksCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <Database size={15} color="var(--primary)" />
              <span><strong>{document.chunksCount}</strong> Chunks</span>
            </div>
          )}

          {/* Status Indicator: uploading | processing | completed | failed */}
          <ProcessingStatus status={document.status} />

          {/* Delete Action */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(document.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)',
              }}
              title="Delete document"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
