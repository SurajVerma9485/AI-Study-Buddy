import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * QuizTimer Component
 * Countdown timer with minute/second display and warning state when time is low.
 */
export default function QuizTimer({ initialMinutes = 10, onTimeUp }) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onTimeUp]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 120; // less than 2 minutes

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-elevated)',
        border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-medium)'}`,
        color: isUrgent ? '#f87171' : 'var(--text-primary)',
        fontWeight: 700,
        fontSize: '0.875rem',
        fontVariantNumeric: 'tabular-nums',
        transition: 'var(--transition-smooth)',
      }}
      title="Remaining time for this practice test"
    >
      {isUrgent ? <AlertTriangle size={16} /> : <Clock size={16} color="var(--primary)" />}
      <span>{formattedTime}</span>
    </div>
  );
}
