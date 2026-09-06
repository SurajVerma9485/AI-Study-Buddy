import React from 'react';
import Card, { CardContent } from '../../../components/ui/Card';
import ProgressBar from '../../../components/ui/ProgressBar';
import { calculateDaysRemaining } from '../services/studyPlanService';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Flame,
  BookOpen,
} from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function PlanSummaryHeader({ plan, onOpenCreateModal, isRegenerating = false }) {
  if (!plan) return null;

  const daysRemaining = calculateDaysRemaining(plan.examDate);
  const totalTasks = plan.tasks?.length || 0;
  const completedTasks = plan.tasks?.filter((t) => t.status === 'completed').length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card glass style={{ overflow: 'hidden' }}>
      <CardContent style={{ padding: '24px 28px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          {/* Course & Title Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                {plan.courseCode}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {plan.courseName}
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {plan.title || `${plan.courseCode} Personalized Study Plan`}
            </h2>

            {plan.weakTopics && plan.weakTopics.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={12} color="#ef4444" />
                  Target Focus:
                </span>
                {plan.weakTopics.map((wt, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    {wt}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={onOpenCreateModal}
            >
              Re-tune / New Plan
            </Button>
          </div>
        </div>

        {/* 4 Core Metric Callouts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {/* 1. Exam Countdown */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: daysRemaining < 14 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-elevated)',
              border: daysRemaining < 14 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: daysRemaining < 14 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={22} color={daysRemaining < 14 ? '#ef4444' : '#f59e0b'} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Exam Countdown
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: daysRemaining < 14 ? '#ef4444' : 'var(--text-primary)', marginTop: '2px' }}>
                {daysRemaining} Days
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Target: {plan.examDate || 'Scheduled'}
              </span>
            </div>
          </div>

          {/* 2. Daily Study Time */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={22} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Daily Study Time
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {plan.dailyStudyMinutes || 60} Mins
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Commitment per session
              </span>
            </div>
          </div>

          {/* 3. Study Days Schedule */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen size={22} color="#10b981" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Preferred Days
              </span>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {plan.preferredDays?.length || 5} Days / Week
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {plan.preferredDays ? plan.preferredDays.map((d) => d.slice(0, 3)).join(', ') : 'Weekdays'}
              </span>
            </div>
          </div>

          {/* 4. Task Mastery Progress */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={22} color="#8b5cf6" />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Plan Completion
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {progressPercent}%
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {completedTasks} of {totalTasks} tasks done
              </span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span>Milestone Completion</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{progressPercent}%</span>
          </div>
          <ProgressBar progress={progressPercent} variant={progressPercent > 70 ? 'success' : 'primary'} height="8px" />
        </div>
      </CardContent>
    </Card>
  );
}
