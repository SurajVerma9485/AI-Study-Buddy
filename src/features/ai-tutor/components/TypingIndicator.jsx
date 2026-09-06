import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

/**
 * TypingIndicator Component
 * Displays animated glowing dots while AI Tutor is retrieving chunks and synthesizing an answer
 */
export default function TypingIndicator({ mode = 'normal' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-glass)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        alignSelf: 'flex-start',
        maxWidth: '85%',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Sparkles size={16} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Retrieving course document chunks in <strong>{mode.toUpperCase()}</strong> mode
        </span>

        {/* Animated Three Dots */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulseGlow 1.2s infinite ease-in-out',
            }}
          />
          <span
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulseGlow 1.2s infinite ease-in-out 0.2s',
            }}
          />
          <span
            style={{
              width: '5px',
              height: '5px',
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pulseGlow 1.2s infinite ease-in-out 0.4s',
            }}
          />
        </div>
      </div>
    </div>
  );
}
