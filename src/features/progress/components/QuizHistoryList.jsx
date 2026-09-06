import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { HelpCircle, Clock, Award, ArrowRight } from 'lucide-react';

export default function QuizHistoryList({ quizHistory = [], courseId = null }) {
  const navigate = useNavigate();

  if (!quizHistory || quizHistory.length === 0) {
    return (
      <Card glass>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--primary)" />
            <CardTitle>Recent Quiz Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '0 24px 24px 24px', textAlign: 'center' }}>
          <div
            style={{
              padding: '28px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No quiz history recorded yet.
            <div style={{ marginTop: '12px' }}>
              <Button
                variant="primary"
                size="sm"
                icon={HelpCircle}
                onClick={() => navigate(courseId ? `/courses/${courseId}/quizzes` : '/quizzes')}
              >
                Take Your First Quiz Drill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card glass>
      <CardHeader style={{ padding: '20px 24px 14px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--primary)" />
            <CardTitle>Recent Quiz Performance</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(courseId ? `/courses/${courseId}/quizzes` : '/quizzes')}
            style={{ fontSize: '0.75rem' }}
          >
            All Quizzes
          </Button>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '0 24px 20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {quizHistory.slice(0, 5).map((q) => {
            const scoreColor = getScoreColor(q.score);
            return (
              <div
                key={q.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    {q.courseCode && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--primary)',
                        }}
                      >
                        {q.courseCode}
                      </span>
                    )}
                    <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {q.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{q.questionsCount} questions</span>
                    <span>•</span>
                    <span>{q.difficulty || 'Medium'}</span>
                    <span>•</span>
                    <span>{q.completedAt}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: scoreColor }}>
                      {q.score !== null ? `${q.score}%` : 'In Progress'}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => navigate(`/quizzes/${q.id}`)}
                    style={{ padding: '6px 8px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
