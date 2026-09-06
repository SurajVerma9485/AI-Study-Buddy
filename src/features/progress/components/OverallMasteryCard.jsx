import React from 'react';
import Card, { CardContent } from '../../../components/ui/Card';
import ProgressBar from '../../../components/ui/ProgressBar';
import {
  Award,
  Target,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export default function OverallMasteryCard({
  overallMastery = 0,
  questionsAttempted = 0,
  correctAnswers = 0,
  quizAccuracy = 0,
  studyStreakDays = 0,
  totalStudyHours = 0,
  courseCode = null,
}) {
  const accuracy = questionsAttempted > 0
    ? Math.round((correctAnswers / questionsAttempted) * 100)
    : (quizAccuracy || 0);

  const getMasteryColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const masteryColor = getMasteryColor(overallMastery);

  return (
    <Card glass style={{ overflow: 'hidden' }}>
      <CardContent style={{ padding: '24px 28px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Award size={18} color={masteryColor} />
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                }}
              >
                {courseCode ? `${courseCode} Syllabus Mastery` : 'Curriculum Mastery Overview'}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Learning Proficiency & Retention
            </h2>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: overallMastery >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: overallMastery >= 75 ? '#10b981' : 'var(--primary)',
              border: overallMastery >= 75 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <TrendingUp size={14} />
            <span>{overallMastery >= 80 ? 'Exam Ready' : overallMastery >= 60 ? 'On Track' : 'Needs Practice'}</span>
          </div>
        </div>

        {/* 4-Stat Core Metric Callout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {/* 1. Overall Mastery */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Mastery
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: masteryColor, margin: '4px 0 6px 0' }}>
              {overallMastery}%
            </div>
            <ProgressBar value={overallMastery} size="sm" variant={overallMastery >= 80 ? 'success' : 'primary'} showValue={false} />
          </div>

          {/* 2. Questions Attempted */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Questions Attempted
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
              {questionsAttempted}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total self-test drills
            </span>
          </div>

          {/* 3. Correct Answers */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Correct Answers
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }}>
              {correctAnswers}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {accuracy}% Quiz Accuracy
            </span>
          </div>

          {/* 4. Study Habit & Hours */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} color="#f59e0b" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Study Streak
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
              {studyStreakDays} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Days</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {totalStudyHours} total hours logged
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
