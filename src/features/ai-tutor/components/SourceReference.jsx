import React, { useState } from 'react';
import { FileCheck, ChevronDown, ChevronUp, BookOpen, Quote } from 'lucide-react';
import Badge from '../../../components/ui/Badge';

/**
 * SourceReference Component
 * Renders verified course citations retrieved via backend RAG.
 * Displays document name, chunk index, page number, relevance, and snippet.
 */
export default function SourceReference({ sources = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!sources || sources.length === 0) return null;

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div
      style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FileCheck size={14} color="var(--success)" />
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
          }}
        >
          Ground Truth Citations (Verified From Your Course Material)
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sources.map((src, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              style={{
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                overflow: 'hidden',
                transition: 'var(--transition-smooth)',
              }}
            >
              <div
                onClick={() => toggleExpand(idx)}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={14} color="var(--primary)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {src.documentName}
                  </span>
                  {(src.chunkIndex || src.chunk) && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      • Chunk {src.chunkIndex || src.chunk}
                    </span>
                  )}
                  {src.pageNumber && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      (Page {src.pageNumber})
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {src.relevanceScore && (
                    <Badge variant="success" size="sm">
                      {src.relevanceScore} match
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {isExpanded && src.snippet && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderTop: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    display: 'flex',
                    gap: '8px',
                  }}
                  className="animate-fade-in"
                >
                  <Quote size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{src.snippet}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
