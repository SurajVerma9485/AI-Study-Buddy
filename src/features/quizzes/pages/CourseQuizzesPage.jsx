import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  HelpCircle,
  Plus,
  Play,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useCourses } from '../../../context/CourseContext';
import { quizService } from '../services/quizService';
import QuizGeneratorModal from '../components/QuizGeneratorModal';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';

export default function CourseQuizzesPage() {
  const { courseId: routeCourseId } = useParams();
  const navigate = useNavigate();
  const { courses, selectedCourse, setSelectedCourseId } = useCourses();

  const effectiveCourseId = routeCourseId || selectedCourse?.id || courses[0]?.id;
  const course = courses.find((c) => c.id === effectiveCourseId) || selectedCourse || courses[0];

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);

  useEffect(() => {
    if (effectiveCourseId) {
      setSelectedCourseId(effectiveCourseId);
    }
  }, [effectiveCourseId, setSelectedCourseId]);

  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getQuizzes(effectiveCourseId);
      setQuizzes(data);
    } catch (err) {
      setError(err.message || 'Failed to load practice tests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [effectiveCourseId]);

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.difficulty && q.difficulty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && quizzes.length === 0) {
    return <Loading message="Loading practice tests from server..." fullPage size="lg" />;
  }

  if (error && quizzes.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Quizzes"
        message={error}
        onRetry={loadQuizzes}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Header */}
      <div>
        {routeCourseId && (
          <button
            onClick={() => navigate(`/courses/${effectiveCourseId}`)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0,
              marginBottom: '12px',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to {course?.code || 'Course'}
          </button>
        )}

        <div
          style={{
            padding: '28px 32px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(17, 24, 39, 0.85) 100%)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="primary" size="md">
                {course?.code || 'PRACTICE'}
              </Badge>
              <Badge variant="outline" size="md">
                Self-Evaluation Engine
              </Badge>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              Adaptive Practice Quizzes
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Formulate AI drills to evaluate topic retention and automatically diagnose concept gaps
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => setGeneratorModalOpen(true)}
          >
            Generate AI Quiz
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <Input
            placeholder="Search quizzes by title or difficulty..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={loadQuizzes}
        >
          Refresh
        </Button>
      </div>

      {/* Quiz Catalog Grid */}
      {filteredQuizzes.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No Practice Quizzes Found"
          description="Generate your first AI-formulated practice test to evaluate your syllabus understanding."
          actionLabel="Generate First Quiz"
          actionIcon={Sparkles}
          onAction={() => setGeneratorModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} glass hoverable>
              <CardContent style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header: Course Code & Difficulty */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Badge variant="primary" size="sm">
                    {quiz.courseCode || course?.code}
                  </Badge>

                  <Badge
                    variant={quiz.difficulty === 'Hard' ? 'danger' : quiz.difficulty === 'Medium' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {quiz.difficulty || 'Medium'}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {quiz.title}
                </h3>

                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
                  {((quiz.type || '').toLowerCase().includes('true') || quiz.type === 'TF') ? 'True / False' : (quiz.type || 'MCQ')} • {quiz.questionsCount || 5} Questions
                </span>

                {/* Previous score or time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Previous Evaluation</span>
                  <span style={{ fontWeight: 800, color: quiz.score ? 'var(--success)' : 'var(--text-muted)' }}>
                    {quiz.score ? `${quiz.score}%` : 'Not attempted'}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  icon={Play}
                  fullWidth
                  onClick={() => navigate(`/quizzes/${quiz.id}`)}
                >
                  Start Practice Test
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Generator Modal */}
      <QuizGeneratorModal
        isOpen={generatorModalOpen}
        onClose={() => setGeneratorModalOpen(false)}
        defaultCourseId={effectiveCourseId}
        onQuizGenerated={(newQuiz) => setQuizzes((prev) => [newQuiz, ...prev])}
      />
    </div>
  );
}
