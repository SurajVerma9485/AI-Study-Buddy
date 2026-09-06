import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import ProgressBar from '../../../components/ui/ProgressBar';
import Button from '../../../components/ui/Button';

/**
 * TopicPerformanceBreakdown Component
 * Displays topic-level retention metrics, diagnosed weak topics, and recommended next activities.
 */
export default function TopicPerformanceBreakdown({
  topicPerformance = [],
  weakTopics = [],
  recommendedActivity = null,
  courseId = null,
}) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* 1. Topic Performance List */}
      <Card glass>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" />
            <CardTitle style={{ fontSize: '1.1rem' }}>Syllabus Topic Breakdown</CardTitle>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Calculated by backend evaluation engine
          </span>
        </CardHeader>
        <CardContent style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {topicPerformance.map((topic, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                  {topic.topicName}
                </span>
                <Badge
                  variant={(topic.score ?? topic.percentage ?? 0) >= 75 ? 'success' : (topic.score ?? topic.percentage ?? 0) >= 50 ? 'warning' : 'danger'}
                  size="sm"
                >
                  {topic.status || ((topic.score ?? topic.percentage ?? 0) >= 75 ? 'Mastered' : 'Needs Focus')}
                </Badge>
              </div>

              <div style={{ width: '140px' }}>
                <ProgressBar
                  value={topic.score ?? topic.percentage ?? 0}
                  size="sm"
                  variant="auto"
                  showValue={true}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. Diagnosed Weak Topics Alert (if any) */}
      {weakTopics && weakTopics.length > 0 && (
        <Card glass style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#ef4444" />
              <CardTitle style={{ fontSize: '1.05rem', color: '#f87171' }}>
                Diagnosed Concept Weak Areas
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '0 20px 20px 20px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              The evaluation engine identified incorrect concepts in these topics. We recommend asking the AI Tutor to explain these in ELI10 mode.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {weakTopics.map((wt, i) => (
                <Badge key={i} variant="danger" size="md">
                  {wt}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Recommended Next Activity */}
      {recommendedActivity && (
        <Card glass style={{ border: '1px solid var(--border-glow)' }}>
          <CardContent style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Recommended Next Activity
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                  {recommendedActivity.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {recommendedActivity.reason}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate(recommendedActivity.route || (courseId ? `/courses/${courseId}/tutor` : '/tutor'))}
            >
              Start Activity
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
