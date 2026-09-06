import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Activity, Clock, Bot, HelpCircle, FileText, CalendarCheck } from 'lucide-react';

export default function StudyActivityTimeline({ activity = [] }) {
  if (!activity || activity.length === 0) {
    return (
      <Card glass>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#10b981" />
            <CardTitle>Study Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '0 24px 24px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px dashed var(--border-medium)',
              fontSize: '0.85rem',
            }}
          >
            No study activity logged yet. Start an AI chat, open a document, or take a quiz to begin tracking your study habit.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Quiz':
        return HelpCircle;
      case 'AI Tutor':
        return Bot;
      case 'Document Study':
        return FileText;
      case 'Study Plan':
        return CalendarCheck;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'Quiz':
        return '#f59e0b';
      case 'AI Tutor':
        return '#6366f1';
      case 'Document Study':
        return '#3b82f6';
      case 'Study Plan':
        return '#10b981';
      default:
        return 'var(--primary)';
    }
  };

  return (
    <Card glass>
      <CardHeader style={{ padding: '20px 24px 14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#10b981" />
          <CardTitle>Study Activity Log</CardTitle>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '0 24px 20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          {/* Subtle vertical spine line */}
          <div
            style={{
              position: 'absolute',
              left: '19px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              background: 'var(--border-subtle)',
              zIndex: 0,
            }}
          />

          {activity.map((act) => {
            const Icon = getActivityIcon(act.type);
            const color = getActivityColor(act.type);

            return (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Icon bubble */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <Icon size={18} color={color} />
                </div>

                {/* Content card */}
                <div
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: color,
                        }}
                      >
                        {act.type}
                      </span>
                      {act.courseCode && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {act.courseCode}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {act.title}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {act.score !== null && act.score !== undefined && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: act.score >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: act.score >= 70 ? '#10b981' : '#ef4444',
                        }}
                      >
                        {act.score}%
                      </span>
                    )}

                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <div style={{ fontWeight: 600 }}>{act.timestamp}</div>
                      {act.durationMinutes && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end', marginTop: '1px' }}>
                          <Clock size={11} /> {act.durationMinutes}m
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
