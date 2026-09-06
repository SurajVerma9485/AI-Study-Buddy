import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { quizService } from '../services/quizService';
import QuizQuestionView from '../components/QuizQuestionView';
import QuizTimer from '../components/QuizTimer';
import SubmitConfirmModal from '../components/SubmitConfirmModal';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ProgressBar from '../../../components/ui/ProgressBar';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';

export default function QuizAttemptPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [attemptId, setAttemptId] = useState(location.state?.attemptId || `att-${Date.now()}`);
  const [loading, setLoading] = useState(!quiz);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch quiz if not passed via route state
  useEffect(() => {
    if (!quiz && quizId) {
      const fetchQuiz = async () => {
        setLoading(true);
        try {
          const data = await quizService.getQuizById(quizId);
          setQuiz(data);
        } catch (err) {
          setError('Failed to load quiz attempt.');
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [quiz, quizId]);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length;

  const handleSelectAnswer = (answerValue) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerValue,
    }));
    // Save to service asynchronously
    quizService.saveAnswer(attemptId, {
      questionId: currentQuestion.id,
      answer: answerValue,
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    try {
      const backendEvaluation = await quizService.completeAttempt(attemptId, answers, quiz);
      setConfirmModalOpen(false);
      navigate(`/quizzes/${quizId}/result`, {
        state: { evaluation: backendEvaluation, quiz },
      });
    } catch (err) {
      setError(err.message || 'Failed to submit quiz to backend grading.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    // Automatically submit when time expires
    handleSubmitFinal();
  };

  if (loading) {
    return <Loading message="Initializing quiz attempt and questions..." fullPage size="lg" />;
  }

  if (error && !quiz) {
    return (
      <ErrorState
        title="Could Not Start Quiz"
        message={error}
        onRetry={() => navigate(`/quizzes/${quizId}`)}
        retryLabel="Back to Overview"
      />
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
      {/* Top Bar: Quiz Title, Timer & Submit Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {quiz?.title || 'Practice Test'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Attempt ID: {attemptId}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Countdown Timer */}
          <QuizTimer initialMinutes={quiz?.timeLimitMinutes || 10} onTimeUp={handleTimeUp} />

          <Button
            variant="primary"
            size="sm"
            onClick={() => setConfirmModalOpen(true)}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Progress Bar (Questions answered indicator) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span>{answeredCount} of {totalQuestions} Answered</span>
        </div>
        <ProgressBar
          value={((currentIndex + 1) / totalQuestions) * 100}
          max={100}
          showValue={false}
          size="sm"
          variant="primary"
        />
      </div>

      {/* Main Question Card */}
      <Card glass style={{ border: '1px solid var(--border-glow)' }}>
        <CardContent style={{ padding: '32px' }}>
          <QuizQuestionView
            question={currentQuestion}
            currentIndex={currentIndex}
            totalCount={totalQuestions}
            selectedAnswer={currentQuestion ? answers[currentQuestion.id] : null}
            onSelectAnswer={handleSelectAnswer}
          />

          {/* Navigation Controls: Previous, Next, Submit */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '36px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Button
              variant="secondary"
              size="md"
              icon={ChevronLeft}
              disabled={currentIndex === 0}
              onClick={handlePrev}
            >
              Previous
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="primary"
                size="md"
                icon={ChevronRight}
                iconPosition="right"
                onClick={handleNext}
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="success"
                size="md"
                icon={CheckCircle2}
                onClick={() => setConfirmModalOpen(true)}
              >
                Complete & Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmitFinal}
        answeredCount={answeredCount}
        totalCount={totalQuestions}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
