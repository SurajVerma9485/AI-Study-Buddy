import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingDown, Bot, HelpCircle, ArrowRight } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function WeakTopicCard({ item }) {
  const navigate = useNavigate();

  if (!item) return null;

  return (
    <div
      className="card-hover-scale"
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elevated)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ flex: 1, minWidth: '240px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {item.courseCode && (
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              {item.courseCode}
            </span>
          )}

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            <AlertTriangle size={11} />
            Diagnostic Gap
          </span>

          {item.trend && (
            <span style={{ fontSize: '0.725rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <TrendingDown size={12} />
              {item.trend}
            </span>
          )}
        </div>

        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {item.topic}
        </h4>

        <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          {item.suggestedAction || 'Review foundational definitions and retake targeted diagnostic drill.'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>
            {item.mastery}%
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mastery Index</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={Bot}
            onClick={() => navigate(item.actionTarget || `/courses/${item.courseId}/tutor`)}
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            Ask AI Tutor
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={HelpCircle}
            onClick={() => navigate(`/courses/${item.courseId}/quizzes`)}
            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
          >
            5-min Drill
          </Button>
        </div>
      </div>
    </div>
  );
}
