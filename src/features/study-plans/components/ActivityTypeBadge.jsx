import React from 'react';
import { BookOpen, RefreshCw, Target, HelpCircle, Flame } from 'lucide-react';

export const ACTIVITY_CONFIGS = {
  Study: {
    label: 'Study',
    icon: BookOpen,
    color: '#3b82f6', // blue
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
    description: 'Read primary lecture materials, slides, and annotated summaries.',
  },
  Revision: {
    label: 'Revision',
    icon: RefreshCw,
    color: '#10b981', // emerald
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    description: 'Spaced repetition, flashcard recall, and formula consolidation.',
  },
  Practice: {
    label: 'Practice',
    icon: Target,
    color: '#8b5cf6', // purple
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.3)',
    description: 'Applied scenario exercises, code trace drills, and problem sets.',
  },
  Quiz: {
    label: 'Quiz',
    icon: HelpCircle,
    color: '#f59e0b', // amber
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    description: 'Timed self-assessment questions evaluating current retention.',
  },
  'Weak-topic review': {
    label: 'Weak-Topic Review',
    icon: Flame,
    color: '#ec4899', // pink/rose
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.3)',
    description: 'Targeted AI Tutor session diagnosing and overcoming specific knowledge gaps.',
  },
};

export default function ActivityTypeBadge({ type = 'Study', size = 'sm' }) {
  const config = ACTIVITY_CONFIGS[type] || ACTIVITY_CONFIGS['Study'];
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? '5px' : '8px',
        padding: isSm ? '3px 8px' : '5px 12px',
        borderRadius: 'var(--radius-sm, 6px)',
        fontSize: isSm ? '0.75rem' : '0.825rem',
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={isSm ? 13 : 16} />
      <span>{config.label}</span>
    </span>
  );
}
