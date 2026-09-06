import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Sparkles } from 'lucide-react';
import Button from '../../../components/ui/Button';

/**
 * ChatInput Component
 * Supports multiline inputs, Enter-to-send, and active mode preview
 */
export default function ChatInput({ onSendMessage, disabled = false, activeMode = 'normal' }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-expand up to 160px
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-md)',
          transition: 'var(--transition-smooth)',
        }}
        className="chat-input-wrapper"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={`Ask anything about this course (Answering in ${activeMode.toUpperCase()} mode)...`}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.925rem',
            lineHeight: 1.5,
            resize: 'none',
            maxHeight: '160px',
            fontFamily: 'inherit',
          }}
        />

        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={Send}
          disabled={!text.trim() || disabled}
          onClick={handleSubmit}
          aria-label="Send message"
          style={{
            borderRadius: 'var(--radius-full)',
            padding: '10px',
            minWidth: '40px',
            minHeight: '40px',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
        <span>Answers are strictly grounded in your course materials & syllabus</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CornerDownLeft size={10} /> Enter to send • Shift + Enter for newline
        </span>
      </div>
    </div>
  );
}
