import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import progressService from '../services/progressService';
import OverallMasteryCard from '../components/OverallMasteryCard';
import TopicMasteryCard from '../components/TopicMasteryCard';
import PerformanceChart from '../components/PerformanceChart';
import WeakTopicCard from '../components/WeakTopicCard';
import QuizHistoryList from '../components/QuizHistoryList';
import StudyActivityTimeline from '../components/StudyActivityTimeline';
import RecentlyStudiedList from '../components/RecentlyStudiedList';
import CourseProgressSelector from '../components/CourseProgressSelector';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import {
  ArrowLeft,
  BookOpen,
  Award,
  AlertTriangle,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function CourseProgressPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await progressService.getCourseProgress(courseId);
      setData(res);
    } catch (err) {
      console.error('Failed to load course progress', err);
      setError('Unable to load progress data for this course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [courseId]);

  if (loading) {
    return <Loading message="Analyzing syllabus retention & test metrics..." />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Learning Progress Unavailable"
        message={error || 'Could not locate retention metrics for this course.'}
        onRetry={loadProgress}
      />
    );
  }

  const hasNoProgress = !data.topicsMastery || data.topicsMastery.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link
              to="/progress"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              className="hover-underline"
            >
              <ArrowLeft size={14} />
              <span>All Courses Progress</span>
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
              {data.courseCode}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            {data.courseCode} — Learning Progress
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            {data.courseName} • Topic-level mastery & performance diagnostics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Course Syllabus
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate(`/courses/${courseId}/tutor`)}
          >
            AI Tutor
          </Button>
        </div>
      </div>

      {/* Course Switcher Selector */}
      <CourseProgressSelector activeCourseId={courseId} />

      {hasNoProgress ? (
        <EmptyState
          icon={Award}
          title="No Progress Data Yet"
          description="Start reading course materials, completing practice quizzes, and consulting the AI Tutor to track mastery."
          actionText="Open Course Materials"
          onAction={() => navigate(`/courses/${courseId}/documents`)}
        />
      ) : (
        <>
          {/* 1. Overall Mastery, 4. Questions Attempted, 5. Correct Answers */}
          <OverallMasteryCard
            overallMastery={data.overallMastery}
            questionsAttempted={data.questionsAttempted}
            correctAnswers={data.correctAnswers}
            quizAccuracy={data.quizAccuracyPercentage}
            studyStreakDays={data.studyStreakDays}
            totalStudyHours={data.totalStudyHours}
            courseCode={data.courseCode}
          />

          {/* 9. Progress Over Time Chart */}
          <PerformanceChart
            data={data.progressOverTime || []}
            title={`${data.courseCode} Progress Over Time`}
          />

          {/* 6. Identified Weak Topics Diagnostic */}
          {data.weakTopics && data.weakTopics.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Identified Weak Topics & Knowledge Gaps ({data.weakTopics.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.weakTopics.map((item) => (
                  <WeakTopicCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* 2. Topic Mastery Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Topic Mastery Breakdown ({data.topicsMastery.length})
                </h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {data.topicsMastery.map((topic) => (
                <TopicMasteryCard key={topic.id} topic={topic} courseId={courseId} />
              ))}
            </div>
          </div>

          {/* 7. Recently Studied Topics & 3. Quiz History */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <RecentlyStudiedList items={data.recentlyStudiedTopics} courseId={courseId} />
            <QuizHistoryList quizHistory={data.quizHistory} courseId={courseId} />
          </div>

          {/* 8. Study Activity Timeline */}
          <StudyActivityTimeline activity={data.studyActivity} />
        </>
      )}
    </div>
  );
}
