import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Reusable Loading state component with spinner and glowing accent.
 */
export default function Loading({
  message = 'Loading your study materials...',
  fullPage = false,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const spinnerSizes = {
    sm: 20,
    md: 36,
    lg: 52,
  };

  const containerStyle = fullPage
    ? {
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }
    : {
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2
          size={spinnerSizes[size]}
          color="var(--primary)"
          className="animate-spin"
        />
        <Sparkles
          size={Math.round(spinnerSizes[size] / 2.5)}
          color="#a855f7"
          style={{
            position: 'absolute',
            opacity: 0.75,
            animation: 'pulseGlow 2s ease-in-out infinite',
          }}
        />
      </div>

      {message && (
        <p
          style={{
            marginTop: '16px',
            color: 'var(--text-secondary)',
            fontSize: size === 'sm' ? '0.85rem' : '0.95rem',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
