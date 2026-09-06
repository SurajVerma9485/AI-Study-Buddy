import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Button from '../../../components/ui/Button';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function ProgressDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await progressService.getGlobalProgress();
      setData(res);
    } catch (err) {
      console.error('Failed to load global progress', err);
      setError('Unable to load learning progress metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return <Loading message="Evaluating syllabus mastery & retention indices..." />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Learning Progress Unavailable"
        message={error || 'Could not retrieve your learning progress data.'}
        onRetry={loadProgress}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Learning Progress & Mastery
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            Evaluate topic-level retention, diagnose weak areas, and monitor exam readiness across all courses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={HelpCircle}
            onClick={() => navigate('/quizzes')}
          >
            Start Quiz Drill
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/study-plans')}
          >
            Revision Schedule
          </Button>
        </div>
      </div>

      {/* Course Switcher Selector */}
      <CourseProgressSelector activeCourseId={null} />

      {/* 1. Overall Mastery, 4. Questions Attempted, 5. Correct Answers, 3. Quiz Performance */}
      <OverallMasteryCard
        overallMastery={data.overallMastery}
        questionsAttempted={data.questionsAttempted}
        correctAnswers={data.correctAnswers}
        quizAccuracy={data.quizAccuracyPercentage}
        studyStreakDays={data.studyStreakDays}
        totalStudyHours={data.totalStudyHours}
      />

      {/* 9. Progress Over Time Chart */}
      <PerformanceChart
        data={data.progressOverTime || []}
        title="Cross-Curriculum Mastery Over Time"
      />

      {/* 6. Identified Weak Topics */}
      {data.weakTopics && data.weakTopics.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
              Prioritized Knowledge Gaps & Weak Topics ({data.weakTopics.length})
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
      {data.topicsMastery && data.topicsMastery.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Course Topics Mastery ({data.topicsMastery.length})
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {data.topicsMastery.map((topic) => (
              <TopicMasteryCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      )}

      {/* 7. Recently Studied Topics & 3. Quiz History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <RecentlyStudiedList items={data.recentlyStudiedTopics} />
        <QuizHistoryList quizHistory={data.quizHistory} />
      </div>

      {/* 8. Study Activity Timeline */}
      <StudyActivityTimeline activity={data.studyActivity} />
    </div>
  );
}
