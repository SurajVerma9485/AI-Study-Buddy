import React from 'react';
import { Sparkles, Brain, Layers, GraduationCap, Lightbulb } from 'lucide-react';

export const TUTOR_MODES = [
  {
    id: 'normal',
    name: 'Normal',
    icon: Sparkles,
    badgeColor: '#6366f1',
    description: 'Balanced, foundational explanations with clear definitions and core examples.',
  },
  {
    id: 'eli10',
    name: "Explain Like I'm 10",
    icon: Brain,
    badgeColor: '#06b6d4',
    description: 'Simple real-world analogies that deconstruct complex concepts intuitively.',
  },
  {
    id: 'detailed',
    name: 'Detailed',
    icon: Layers,
    badgeColor: '#a855f7',
    description: 'Deep technical rigor with mathematical formulas, architecture invariants, and edge cases.',
  },
  {
    id: 'exam',
    name: 'Exam Style',
    icon: GraduationCap,
    badgeColor: '#10b981',
    description: 'Structured high-yield answers tailored to academic marks distribution.',
  },
  {
    id: 'hint',
    name: 'Socratic Hint',
    icon: Lightbulb,
    badgeColor: '#f59e0b',
    description: 'Guided prompts and progressive clues that help you solve problems independently.',
  },
];

/**
 * ModeSelector Component
 * Allows switching between Normal, ELI10, Detailed, Exam, and Hint tutor styles
 */
export default function ModeSelector({ currentMode = 'normal', onSelectMode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      {TUTOR_MODES.map((m) => {
        const Icon = m.icon;
        const isSelected = currentMode === m.id;

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectMode(m.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: isSelected ? `1px solid ${m.badgeColor}` : '1px solid var(--border-medium)',
              backgroundColor: isSelected ? `${m.badgeColor}20` : 'var(--bg-elevated)',
              color: isSelected ? m.badgeColor : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: isSelected ? 700 : 500,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              userSelect: 'none',
            }}
            title={m.description}
          >
            <Icon size={14} />
            <span>{m.name}</span>
          </button>
        );
      })}
    </div>
  );
}
