import React, { useState } from 'react';
import { Sparkles, Copy, Check, RotateCcw, User } from 'lucide-react';
import SourceReference from './SourceReference';
import Badge from '../../../components/ui/Badge';

/**
 * MessageBubble Component
 * Renders user and AI assistant messages with mode badges, copy functionality, retry button, and verified course sources.
 */
export default function MessageBubble({ message, isLast = false, onRetry = null }) {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text', err);
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'eli10':
        return "Explain Like I'm 10";
      case 'detailed':
        return 'Deep Technical';
      case 'exam':
        return 'Exam Marking';
      case 'hint':
        return 'Socratic Hint';
      default:
        return 'Balanced Tutor';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        alignSelf: isAssistant ? 'flex-start' : 'flex-end',
        maxWidth: isAssistant ? '88%' : '75%',
      }}
      className="animate-fade-in"
    >
      {/* Avatar Icon */}
      {isAssistant ? (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Sparkles size={18} />
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {/* Assistant Header: Mode Tag & Time */}
        {isAssistant && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Study Buddy
            </span>
            {message.mode && (
              <Badge variant="primary" size="sm">
                {getModeLabel(message.mode)}
              </Badge>
            )}
            {message.createdAt && (
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {message.createdAt}
              </span>
            )}
          </div>
        )}

        {/* Bubble Content Body */}
        <div
          style={{
            padding: isAssistant ? '18px 22px' : '12px 18px',
            borderRadius: isAssistant
              ? '4px 18px 18px 18px'
              : '18px 4px 18px 18px',
            backgroundColor: isAssistant ? 'var(--bg-glass)' : 'var(--primary)',
            color: isAssistant ? 'var(--text-primary)' : '#ffffff',
            border: isAssistant ? '1px solid var(--border-subtle)' : 'none',
            backdropFilter: isAssistant ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: isAssistant ? 'blur(16px)' : 'none',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '0.925rem',
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </div>

          {/* Source References (Ground Truth from Course Material) */}
          {isAssistant && message.sources && message.sources.length > 0 && (
            <SourceReference sources={message.sources} />
          )}

          {/* Action Toolbar for Assistant */}
          {isAssistant && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '12px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? 'var(--success)' : 'var(--text-muted)',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'var(--transition-smooth)',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied to clipboard' : 'Copy answer'}
              </button>

              {isLast && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  <RotateCcw size={13} />
                  Retry response
                </button>
              )}
            </div>
          )}
        </div>

        {/* User timestamp */}
        {!isAssistant && message.createdAt && (
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', alignSelf: 'flex-end', marginTop: '2px' }}>
            {message.createdAt}
          </span>
        )}
      </div>
    </div>
  );
}
