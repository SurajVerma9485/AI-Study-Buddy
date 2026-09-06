import React from 'react';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import Button from '../../../components/ui/Button';

/**
 * ConversationList Component
 * Sidebar drawer showing historical discussions and "New Conversation" trigger
 */
export default function ConversationList({
  conversations = [],
  activeId,
  onSelectConversation,
  onNewConversation,
  onClearActive,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        width: '280px',
        flexShrink: 0,
      }}
      className="conversation-list-container"
    >
      {/* Header: Title & New Conversation Button */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Threads
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => onNewConversation('Discussion Topic')}
          title="Start new conversation"
        >
          New
        </Button>
      </div>

      {/* Threads List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {conversations.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            No previous discussions. Start a new session!
          </div>
        ) : (
          conversations.map((thread) => {
            const isActive = thread.id === activeId;

            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectConversation(thread.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  width: '100%',
                }}
              >
                <MessageSquare size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {thread.title || 'Discussion'}
                  </div>
                  {thread.createdAt && (
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {thread.createdAt}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Footer: Clear Active Thread */}
      {onClearActive && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            fullWidth
            onClick={onClearActive}
            style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
          >
            Clear Current Messages
          </Button>
        </div>
      )}
    </div>
  );
}
