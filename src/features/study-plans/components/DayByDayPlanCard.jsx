import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Calendar, CheckCircle2, Clock, Sparkles, BookOpen, Layers } from 'lucide-react';

/**
 * DayByDayPlanCard Component
 * Displays the exact Day 1, Day 2, Day 3... day-by-day study roadmap
 * synthesized by Grok based on Class, Subject, Chapter, Days, and Daily Study Time.
 */
export default function DayByDayPlanCard({ plan }) {
  if (!plan) return null;

  const { classLevel, subject, chapter, days, dailyStudyTime, daySchedule } = plan;

  // If daySchedule is not directly populated, construct it from tasks
  const schedules = daySchedule && daySchedule.length > 0
    ? daySchedule
    : Array.from({ length: days || 5 }, (_, idx) => {
        const dayNum = idx + 1;
        const dayTasks = (plan.tasks || []).filter((t) => t.dayNumber === dayNum || t.scheduledFor === `Day ${dayNum}`);
        return {
          dayNumber: dayNum,
          dayLabel: `Day ${dayNum}`,
          theme: dayTasks[0]?.title || `Chapter Revision Stage ${dayNum}`,
          bulletPoints: dayTasks.map((t) => t.title),
        };
      });

  return (
    <Card glass style={{ border: '1px solid var(--border-medium)', overflow: 'hidden' }}>
      <CardHeader
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '3px 9px',
                  borderRadius: '999px',
                  background: 'var(--primary-gradient)',
                  color: '#ffffff',
                }}
              >
                Grok AI Study Roadmap
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {classLevel || 'Class 10'} • {subject || 'Mathematics'}
              </span>
            </div>

            <CardTitle style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0' }}>
              {chapter || 'Chapter 1 - Real Numbers'}
            </CardTitle>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Goal: Finish this syllabus in <strong>{days || 5} Days</strong> with <strong>{dailyStudyTime || '2 hours/day'}</strong> study time
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              <Calendar size={16} color="var(--primary)" />
              <span>{days || 5} Days Total</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              <Clock size={16} color="var(--primary)" />
              <span>{dailyStudyTime || '2 hours/day'}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {schedules.map((schedule) => (
            <div
              key={schedule.dayNumber || schedule.dayLabel}
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              {/* Day Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    background: 'rgba(99, 102, 241, 0.12)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {schedule.dayLabel}:
                </span>
                {schedule.theme && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {schedule.theme}
                  </span>
                )}
              </div>

              {/* Bullet Points */}
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}
              >
                {schedule.bulletPoints && schedule.bulletPoints.length > 0 ? (
                  schedule.bulletPoints.map((bp, bpIdx) => (
                    <li key={bpIdx} style={{ color: 'var(--text-primary)' }}>
                      {bp}
                    </li>
                  ))
                ) : (
                  <li>Comprehensive syllabus study session</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
