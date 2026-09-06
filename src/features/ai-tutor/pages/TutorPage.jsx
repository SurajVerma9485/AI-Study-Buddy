import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, HelpCircle, Database, ShieldCheck } from 'lucide-react';
import { useCourses } from '../../../context/CourseContext';
import { useChat } from '../hooks/useChat';
import ChatWindow from '../components/ChatWindow';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';

export default function TutorPage() {
  const { courseId: routeCourseId } = useParams();
  const navigate = useNavigate();
  const { courses, selectedCourse, setSelectedCourseId, loading: coursesLoading } = useCourses();

  // If no courseId in URL, use active selectedCourse
  const effectiveCourseId = routeCourseId || selectedCourse?.id || courses[0]?.id;
  const course = courses.find((c) => c.id === effectiveCourseId) || selectedCourse || courses[0];

  useEffect(() => {
    if (effectiveCourseId) {
      setSelectedCourseId(effectiveCourseId);
    }
  }, [effectiveCourseId, setSelectedCourseId]);

  const chat = useChat(effectiveCourseId);

  if (coursesLoading && !course) {
    return <Loading message="Connecting to AI Tutor session..." fullPage size="lg" />;
  }

  if (!course) {
    return (
      <ErrorState
        title="Course Not Found"
        message="Please select an enrolled course to start an AI tutoring session."
        onRetry={() => navigate('/courses')}
        retryLabel="Choose Course"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
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
              marginBottom: '8px',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to {course.code}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>

            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                {course.code}: AI Personalized Tutor
              </h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {course.name}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Pill & Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
            title="Every response is derived from your course notes and pgvector chunks"
          >
            <ShieldCheck size={16} />
            <span>Course Material Grounded</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={FileText}
            onClick={() => navigate(`/courses/${effectiveCourseId}/documents`)}
          >
            Course Notes
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={HelpCircle}
            onClick={() => navigate('/quizzes')}
          >
            Practice Quiz
          </Button>
        </div>
      </div>

      {/* Main Chat Interface Window */}
      <ChatWindow course={course} chat={chat} />
    </div>
  );
}
