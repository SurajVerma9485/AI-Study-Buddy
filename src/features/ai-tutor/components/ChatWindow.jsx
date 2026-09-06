import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Menu, X, AlertCircle, RotateCcw, Zap } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ModeSelector from './ModeSelector';
import TypingIndicator from './TypingIndicator';
import ConversationList from './ConversationList';
import Button from '../../../components/ui/Button';
import { groqService } from '../../../services/groqService';

/**
 * ChatWindow Component
 * Main coordinator for conversational AI tutor with streaming tokens, mode selection, and thread management.
 */
export default function ChatWindow({
  course,
  chat, // object returned from useChat hook
}) {
  const {
    conversations,
    activeConversationId,
    messages,
    mode,
    setMode,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    retryLastMessage,
    startNewConversation,
    switchConversation,
    clearConversation,
  } = chat;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading]);

  const activeThread = conversations.find((t) => t.id === activeConversationId);

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 160px)',
        minHeight: '560px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}
      className="chat-window-container"
    >
      {/* Collapsible Conversation Threads Sidebar */}
      {sidebarOpen && (
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelectConversation={switchConversation}
          onNewConversation={startNewConversation}
          onClearActive={clearConversation}
        />
      )}

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat Toolbar: Thread Toggle, Title & Mode Selector */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title={sidebarOpen ? 'Hide threads' : 'Show threads'}
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {activeThread?.title || 'Course Doubt Clearing'}
                </h3>
                {groqService.isConfigured() && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                    title={`Powered live by Groq: ${groqService.getModel()}`}
                  >
                    <Zap size={11} fill="var(--primary)" /> Groq LLM
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Grounded in {course?.code || 'Course'} syllabus documents
              </span>
            </div>
          </div>

          {/* 11. Mode Switching */}
          <ModeSelector currentMode={mode} onSelectMode={setMode} />
        </div>

        {/* Error State Banner */}
        {error && (
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={retryLastMessage} style={{ color: '#f87171' }}>
              Retry
            </Button>
          </div>
        )}

        {/* Messages Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
          className="chat-messages-scroll"
        >
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              message={msg}
              isLast={index === messages.length - 1}
              onRetry={retryLastMessage}
            />
          ))}

          {/* Real-time Streaming Response Display */}
          {isStreaming && streamingContent && (
            <MessageBubble
              message={{
                id: 'streaming-msg',
                role: 'assistant',
                content: streamingContent,
                mode,
                createdAt: 'Streaming...',
              }}
              isLast={true}
            />
          )}

          {/* 3. Loading / Retrieval Typing State */}
          {isLoading && !streamingContent && (
            <TypingIndicator mode={mode} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
          <ChatInput
            onSendMessage={sendMessage}
            disabled={isLoading || isStreaming}
            activeMode={mode}
          />
        </div>
      </div>
    </div>
  );
}
