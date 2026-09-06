import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../../components/ui/ProgressBar';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { CheckCircle2, AlertTriangle, ArrowUpRight, HelpCircle, Bot } from 'lucide-react';

export default function TopicMasteryCard({ topic, courseId }) {
  const navigate = useNavigate();

  if (!topic) return null;

  const getStatusBadge = (status, mastery) => {
    const norm = String(status || '').toLowerCase();
    if (norm === 'mastered' || mastery >= 80) {
      return (
        <span
          style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <CheckCircle2 size={12} />
          Mastered
        </span>
      );
    }

    if (norm === 'weak' || mastery < 55) {
      return (
        <span
          style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertTriangle size={12} />
          Needs Practice
        </span>
      );
    }

    return (
      <span
        style={{
          fontSize: '0.725rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '9999px',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        In Progress
      </span>
    );
  };

  const getProgressVariant = (mastery) => {
    if (mastery >= 80) return 'success';
    if (mastery >= 55) return 'warning';
    return 'danger';
  };

  const effectiveCourseId = topic.courseId || courseId;

  return (
    <div
      className="card-hover-scale"
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            {topic.courseCode && (
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {topic.courseCode}
              </span>
            )}
            {getStatusBadge(topic.status, topic.mastery)}
          </div>

          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {topic.title}
          </h4>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: topic.mastery >= 80 ? '#10b981' : topic.mastery >= 55 ? '#f59e0b' : '#ef4444',
            }}
          >
            {topic.mastery}%
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mastery</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <ProgressBar
          value={topic.mastery}
          size="sm"
          variant={getProgressVariant(topic.mastery)}
          showValue={false}
        />
      </div>

      {/* Subtopics or question stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.775rem',
          color: 'var(--text-muted)',
          paddingTop: '6px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span>
          {topic.questionsAttempted
            ? `${topic.correctAnswers || 0} / ${topic.questionsAttempted} drill questions correct`
            : topic.subtopics?.length > 0
            ? `${topic.subtopics.length} subtopics covered`
            : 'Continuous learning tracking'}
        </span>

        {effectiveCourseId && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => navigate(`/courses/${effectiveCourseId}/tutor`)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
              }}
            >
              <Bot size={13} />
              AI Tutor
            </button>

            <button
              onClick={() => navigate(`/courses/${effectiveCourseId}/quizzes`)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
              }}
            >
              <HelpCircle size={13} />
              Practice Drill
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
