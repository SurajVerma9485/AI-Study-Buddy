import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import TopicPerformanceBreakdown from '../components/TopicPerformanceBreakdown';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';

export default function QuizResultPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(() => {
    if (location.state?.evaluation) return location.state.evaluation;
    // Check cached session result
    const stored = sessionStorage.getItem(`quiz_result_${quizId}`);
    return stored ? JSON.parse(stored) : null;
  });

  const quiz = location.state?.quiz || null;

  if (!result) {
    return (
      <ErrorState
        title="No Result Found"
        message="Could not locate backend grading data for this quiz attempt. Please start a practice attempt first."
        onRetry={() => navigate(`/quizzes/${quizId}`)}
        retryLabel="Go to Quiz"
      />
    );
  }

  const isPassing = result.percentage >= 60;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* 1. Score Summary Banner */}
      <Card
        glass
        style={{
          padding: '36px 28px',
          textAlign: 'center',
          border: `1px solid ${isPassing ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          background: isPassing
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, var(--bg-card) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, var(--bg-card) 100%)',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: isPassing ? 'var(--success-light)' : 'var(--danger-light)',
            color: isPassing ? 'var(--success)' : 'var(--danger)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)',
          }}
        >
          {isPassing ? <Award size={36} /> : <XCircle size={36} />}
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          {isPassing ? 'Great Effort!' : 'Needs Revision'}
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0 0 28px 0' }}>
          {result.quizTitle || 'Practice Evaluation Completed'}
        </p>

        {/* 4 Score Metrics (Score, Correct, Incorrect, Percentage) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            maxWidth: '680px',
            margin: '0 auto 28px auto',
          }}
        >
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {result.score} / {result.totalQuestions}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Percentage</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isPassing ? 'var(--success)' : '#ef4444' }}>
              {result.percentage}%
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
              {result.correctCount}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incorrect</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: result.incorrectCount > 0 ? '#ef4444' : 'var(--text-muted)' }}>
              {result.incorrectCount}
            </div>
          </div>
        </div>

        {/* Top Buttons: Retake Quiz, Ask Tutor */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            icon={RotateCcw}
            onClick={() => navigate(`/quizzes/${quizId}`)}
          >
            Retake Quiz
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => navigate('/tutor')}
          >
            Discuss in AI Tutor
          </Button>
        </div>
      </Card>

      {/* 2. Topic Performance Breakdown & Recommended Next Steps */}
      <TopicPerformanceBreakdown
        topicPerformance={result.topicPerformance}
        weakTopics={result.weakTopics}
        recommendedActivity={result.recommendedActivity}
        courseId={quiz?.courseId}
      />

      {/* 3. Detailed Answer Explanations */}
      {result.explanations && result.explanations.length > 0 && (
        <Card glass>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} color="var(--primary)" />
              <CardTitle>Detailed Answer Explanations</CardTitle>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Grounded in your course syllabus
            </span>
          </CardHeader>
          <CardContent style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.explanations.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: `1px solid ${item.isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>
                      Q{idx + 1}.
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {item.question}
                    </span>
                  </div>

                  <Badge variant={item.isCorrect ? 'success' : 'danger'} size="sm">
                    {item.isCorrect ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Your Answer: </strong>
                    <span style={{ color: item.isCorrect ? 'var(--success)' : '#ef4444' }}>
                      {item.userAnswer}
                    </span>
                  </div>

                  {!item.isCorrect && (
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Correct Answer: </strong>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {item.correctAnswer}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: 'var(--primary)' }}>Explanation: </strong>
                  {item.explanation}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Footer Back link */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="ghost" size="md" onClick={() => navigate('/quizzes')}>
          Back to All Practice Quizzes
        </Button>
      </div>
    </div>
  );
}
