import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Layers } from 'lucide-react';
import { documentService } from '../../../services/documentService';
import DocumentCard from './DocumentCard';
import DocumentEmptyState from './DocumentEmptyState';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

/**
 * DocumentList Component
 * Coordinates list rendering, local search filtering, and automatic polling
 * for documents in 'uploading' or 'processing' states via GET /api/v1/documents/:id/status
 */
export default function DocumentList({
  documents = [],
  onDeleteDocument,
  onRefresh,
  onUploadClick,
  onUpdateDocumentStatus,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Check if any document is currently pending (uploading or processing)
  const pendingDocs = documents.filter(
    (d) => d.status === 'uploading' || d.status === 'processing'
  );

  // Poll status every 3 seconds for pending documents
  useEffect(() => {
    if (pendingDocs.length === 0) return;

    const intervalId = setInterval(async () => {
      for (const doc of pendingDocs) {
        try {
          const statusRes = await documentService.getDocumentStatus(doc.id);
          if (statusRes && statusRes.status !== doc.status) {
            if (onUpdateDocumentStatus) {
              onUpdateDocumentStatus(doc.id, statusRes.status, statusRes.chunksCount);
            }
          }
        } catch (err) {
          console.warn(`Failed to poll status for document ${doc.id}:`, err);
        }
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [pendingDocs, onUpdateDocumentStatus]);

  const filteredDocs = documents.filter((d) =>
    d.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (documents.length === 0) {
    return <DocumentEmptyState onUploadClick={onUploadClick} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search and Polling Indicator Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ maxWidth: '340px', width: '100%' }}>
          <Input
            placeholder="Search documents by filename..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {pendingDocs.length > 0 && (
            <span
              style={{
                fontSize: '0.785rem',
                color: '#f59e0b',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%' }} />
              Auto-syncing {pendingDocs.length} processing document{pendingDocs.length > 1 ? 's' : ''}...
            </span>
          )}

          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={onRefresh}
              title="Refresh document statuses"
            >
              Sync
            </Button>
          )}
        </div>
      </div>

      {/* Filtered Document Cards */}
      {filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
          No documents match your search query "{searchTerm}".
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={onDeleteDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
}
