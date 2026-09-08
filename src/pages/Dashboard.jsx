import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  CalendarCheck,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
  Flame,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Circle,
  Calendar,
  Compass,
  RefreshCw,
  Bot,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { studyPlanService } from '../features/study-plans';
import { progressService } from '../features/progress';
import { quizService } from '../features/quizzes';
import { weakTopicsManager } from '../services/weakTopicsManager';
import {
  MOCK_STUDY_PLAN_TASKS,
  MOCK_WEAK_TOPICS,
  MOCK_RECENT_QUIZZES,
} from '../services/mockData';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Loading from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError, fetchCourses, addCourse, setSelectedCourseId } = useCourses();

  // Active course filter for dynamic weak topics and quiz diagnostics
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Create Course Modal state
  const [createCourseModalOpen, setCreateCourseModalOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [examDate, setExamDate] = useState('2026-11-15');
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Live Hub Data state loaded from real backend services
  const [hubData, setHubData] = useState({
    weakTopics: [],
    todayTasks: [],
    recentQuizzes: [],
    overallMastery: 74,
    questionsAttempted: 85,
    correctAnswers: 68,
    loading: true,
  });

  const loadHubData = async () => {
    try {
      const [progressRes, plansRes, quizzesRes] = await Promise.allSettled([
        progressService.getGlobalProgress(),
        studyPlanService.getStudyPlans(),
        quizService.getQuizzes(),
      ]);

      const globalProg = progressRes.status === 'fulfilled' ? progressRes.value : null;
      const plans = plansRes.status === 'fulfilled' ? plansRes.value : [];
      const quizzes = quizzesRes.status === 'fulfilled' ? quizzesRes.value : [];

      // Extract today's study plan tasks across active plans
      const todayTasks = plans.flatMap((p) =>
        (p.tasks || [])
          .filter((t) => t.scheduledFor === 'Today')
          .map((t) => ({ ...t, planId: p.id, courseCode: p.courseCode }))
      );

      const dynamicWeak = weakTopicsManager.getWeakTopics(selectedCourseFilter);
      const dynamicQuizzes = weakTopicsManager.getQuizHistory(selectedCourseFilter);

      setHubData({
        weakTopics: dynamicWeak,
        todayTasks: todayTasks.length > 0 ? todayTasks : MOCK_STUDY_PLAN_TASKS,
        recentQuizzes: dynamicQuizzes.length > 0 ? dynamicQuizzes.slice(0, 3) : (quizzes.length > 0 ? quizzes.slice(0, 3) : (globalProg?.quizHistory?.slice(0, 3) || MOCK_RECENT_QUIZZES)),
        overallMastery: globalProg?.overallMastery || 74,
        questionsAttempted: globalProg?.questionsAttempted || 85,
        correctAnswers: globalProg?.correctAnswers || 68,
        loading: false,
      });
    } catch (err) {
      console.error('Error loading hub data in Dashboard', err);
      setHubData((prev) => ({
        ...prev,
        weakTopics: weakTopicsManager.getWeakTopics(selectedCourseFilter),
        todayTasks: MOCK_STUDY_PLAN_TASKS,
        recentQuizzes: weakTopicsManager.getQuizHistory(selectedCourseFilter).slice(0, 3),
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadHubData();
  }, []);

  // Re-sync weak topics and quizzes whenever selected course changes
  useEffect(() => {
    setHubData((prev) => ({
      ...prev,
      weakTopics: weakTopicsManager.getWeakTopics(selectedCourseFilter),
      recentQuizzes: weakTopicsManager.getQuizHistory(selectedCourseFilter).slice(0, 3),
    }));
  }, [selectedCourseFilter]);

  // Subscribe to real-time quiz completions across the app
  useEffect(() => {
    const unsubscribe = weakTopicsManager.subscribe(() => {
      setHubData((prev) => ({
        ...prev,
        weakTopics: weakTopicsManager.getWeakTopics(selectedCourseFilter),
        recentQuizzes: weakTopicsManager.getQuizHistory(selectedCourseFilter).slice(0, 3),
      }));
    });
    return unsubscribe;
  }, [selectedCourseFilter]);

  const handleToggleTask = async (planId, taskId) => {
    setHubData((prev) => ({
      ...prev,
      todayTasks: prev.todayTasks.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      ),
    }));

    if (planId) {
      await studyPlanService.toggleTaskStatus(planId, taskId);
    }
  };

  // Recommended Activities dynamically suggested from weak topics and closest exam
  const sortedCourses = [...courses].sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  const nextExamCourse = sortedCourses[0] || null;
  const daysUntilExam = nextExamCourse
    ? Math.max(0, Math.ceil((new Date(nextExamCourse.examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 30;

  const recommendedActivities = [
    {
      id: 'rec-1',
      title: hubData.weakTopics[0]?.topic
        ? `Overcome Gap: ${hubData.weakTopics[0].topic}`
        : 'Review Raft Consensus Key Invariants',
      type: 'AI Tutor Session',
      reason: hubData.weakTopics[0]
        ? `Low mastery index (${hubData.weakTopics[0].mastery}%) detected in recent drills`
        : 'Low retention score in recent quiz',
      actionText: 'Launch ELI10 Tutor',
      actionRoute: hubData.weakTopics[0]?.courseId
        ? `/courses/${hubData.weakTopics[0].courseId}/tutor`
        : '/tutor',
    },
    {
      id: 'rec-2',
      title: `Practice 5-min Diagnostic Drill (${nextExamCourse ? nextExamCourse.code : 'CS 301'})`,
      type: 'Practice Quiz',
      reason: `Exam in ${daysUntilExam} days`,
      actionText: 'Start Drill',
      actionRoute: nextExamCourse ? `/courses/${nextExamCourse.id}/quizzes` : '/quizzes',
    },
    {
      id: 'rec-3',
      title: 'Upload Latest Lecture Slides or Syllabus Notes',
      type: 'Document Ingestion',
      reason: 'Enhance RAG context grounding',
      actionText: 'Upload Document',
      actionRoute: nextExamCourse ? `/courses/${nextExamCourse.id}/documents` : '/documents',
    },
  ];

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    setSubmittingCourse(true);
    try {
      await addCourse({
        name: courseName,
        description: courseDescription,
        examDate,
      });
      setCourseName('');
      setCourseDescription('');
      setCreateCourseModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingCourse(false);
    }
  };

  if (coursesLoading && courses.length === 0) {
    return <Loading message="Synchronizing student learning hub..." fullPage size="lg" />;
  }

  if (coursesError && courses.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Dashboard"
        message={coursesError}
        onRetry={fetchCourses}
        retryLabel="Reload Dashboard"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
      {/* 1. Welcome Section */}
      <div
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.12) 50%, var(--bg-card) 100%)',
          border: '1px solid var(--border-glow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Badge variant="primary" size="sm" dot>
              AI Agent Active
            </Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Continuous Syllabus Diagnostics & Retrieval
            </span>
          </div>

          <h1 style={{ fontSize: '2.1rem', margin: 0, fontWeight: 800 }}>
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>

          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem', maxWidth: '640px', lineHeight: 1.5 }}>
            Here is your daily learning briefing. You have{' '}
            <strong style={{ color: 'var(--danger)' }}>{hubData.weakTopics.length} weak topics</strong> prioritized for revision{selectedCourseFilter !== 'all' ? ` in ${courses.find((c) => c.id === selectedCourseFilter)?.code || 'this course'}` : ' across courses'} and your closest target exam is in{' '}
            <strong style={{ color: '#f59e0b' }}>{daysUntilExam} days</strong> ({nextExamCourse?.code || 'CS 301'}).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={() => {
              fetchCourses();
              loadHubData();
            }}
            title="Sync Hub"
          >
            Sync
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => navigate('/tutor')}
          >
            Ask AI Tutor
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <Card glass style={{ border: '1px solid var(--border-medium)' }}>
        <CardContent style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--primary)" /> Quick Actions
            </span>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setCreateCourseModalOpen(true)}
              >
                Create Course
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={UploadCloud}
                onClick={() => navigate('/documents')}
              >
                Upload Document
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={Bot}
                onClick={() => navigate('/tutor')}
              >
                Ask AI Tutor
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={HelpCircle}
                onClick={() => navigate('/quizzes')}
              >
                Start Quiz
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={CalendarCheck}
                onClick={() => navigate('/study-plans')}
              >
                View Study Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Metrics Grid (Total courses, Overall progress, Upcoming exam, Study Streak) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Total Courses */}
        <Card glass hoverable onClick={() => navigate('/courses')}>
          <CardContent style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Courses</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {courses.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Active syllabus curriculums
            </span>
          </CardContent>
        </Card>

        {/* Overall Learning Progress */}
        <Card glass hoverable onClick={() => navigate('/progress')}>
          <CardContent style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Overall Progress</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {hubData.overallMastery}%
            </div>
            <ProgressBar value={hubData.overallMastery} size="sm" variant="auto" showValue={false} />
            <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '8px', display: 'inline-block' }}>
              Syllabus retention index
            </span>
          </CardContent>
        </Card>

        {/* Upcoming Exam */}
        <Card glass hoverable onClick={() => navigate('/study-plans')}>
          <CardContent style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Upcoming Exam</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--warning-light)', color: '#f59e0b' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
              {daysUntilExam} Days Left
            </div>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              {nextExamCourse ? `${nextExamCourse.code} (${nextExamCourse.examDate})` : 'Target Exam Scheduled'}
            </span>
          </CardContent>
        </Card>

        {/* Study Habit / Questions Attempted */}
        <Card glass hoverable onClick={() => navigate('/profile')}>
          <CardContent style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Daily Habit</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Flame size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
              {user?.studyStreakDays || 14} Days
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {hubData.questionsAttempted} drill questions attempted
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* Left Column: Current Courses & Today's Study Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Current Courses */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Current Courses</h3>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/courses')}
              >
                Manage All
              </Button>
            </div>

            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Courses Enrolled"
                description="Create your first subject to start uploading documents and generating personalized quizzes."
                actionLabel="Create Course"
                actionIcon={Plus}
                onAction={() => setCreateCourseModalOpen(true)}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {courses.slice(0, 3).map((course) => {
                  const isFiltered = selectedCourseFilter === course.id;
                  return (
                    <Card
                      key={course.id}
                      hoverable
                      onClick={() => {
                        setSelectedCourseFilter(isFiltered ? 'all' : course.id);
                        setSelectedCourseId(course.id);
                      }}
                      style={{
                        border: isFiltered ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        boxShadow: isFiltered ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <CardContent style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: course.color || 'var(--primary)' }}>
                                {course.code}
                              </span>
                              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                {course.name}
                              </h3>
                              {isFiltered && (
                                <Badge variant="primary" size="sm">
                                  Active Filter
                                </Badge>
                              )}
                            </div>
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '480px' }}>
                              {course.description}
                            </p>
                          </div>

                          <Badge variant="outline" size="sm">
                            Exam: {course.examDate}
                          </Badge>
                        </div>

                        <div style={{ marginTop: '14px' }}>
                          <ProgressBar
                            value={course.progress}
                            label="Mastery"
                            size="sm"
                            variant="auto"
                          />
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '14px',
                            paddingTop: '10px',
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span>{course.topics?.length || 0} Topics • {course.documentsCount || 0} Documents</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourseId(course.id);
                              navigate(`/courses/${course.id}`);
                            }}
                            style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                          >
                            View Syllabus <ArrowUpRight size={14} />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Study Plan Tasks */}
          <Card glass>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="var(--primary)" />
                <CardTitle style={{ fontSize: '1.2rem' }}>Today's Study Plan</CardTitle>
              </div>
              <Badge variant="primary" size="sm">
                AI Prioritized
              </Badge>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hubData.todayTasks.slice(0, 4).map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-elevated)',
                      border: isCompleted ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      opacity: isCompleted ? 0.75 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => handleToggleTask(task.planId, task.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: isCompleted ? '#10b981' : 'var(--text-muted)',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {task.courseCode}
                          </span>
                          <h4
                            style={{
                              fontSize: '0.925rem',
                              fontWeight: 600,
                              margin: 0,
                              textDecoration: isCompleted ? 'line-through' : 'none',
                            }}
                          >
                            {task.title || task.topic}
                          </h4>
                        </div>
                        <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                          {task.activity || task.activityType} • <span style={{ color: '#f59e0b' }}>{task.reason || task.duration}</span>
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {task.duration || `${task.durationMinutes}m`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/study-plans')}
                        style={{ fontSize: '0.775rem' }}
                      >
                        Details →
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/study-plans')}
                >
                  View Full Study Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Weak Topics, Recent Quiz Results, AI Tutor Shortcut & Recommended Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AI Tutor Dedicated Shortcut Card */}
          <Card glass style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)', border: '1px solid var(--border-glow)' }}>
            <CardContent style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'var(--primary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <Bot size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>AI Study Buddy Tutor</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Ask conceptual questions grounded in your course documents
                  </p>
                </div>
              </div>

              <Button variant="primary" size="sm" icon={Sparkles} onClick={() => navigate('/tutor')}>
                Launch Tutor
              </Button>
            </CardContent>
          </Card>

          {/* Weak Topics Diagnostic */}
          <Card glass>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#ef4444" />
                  <div>
                    <CardTitle style={{ fontSize: '1.1rem', margin: 0 }}>Weak Topics & Concept Gaps</CardTitle>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Updated live from quiz results
                    </span>
                  </div>
                </div>

                {/* Course Selection Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label htmlFor="dashboard-course-filter" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Course:
                  </label>
                  <select
                    id="dashboard-course-filter"
                    value={selectedCourseFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCourseFilter(val);
                      if (val !== 'all') setSelectedCourseId(val);
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="all">All Courses ({courses.length})</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hubData.weakTopics.length > 0 ? (
                hubData.weakTopics.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {item.courseCode}
                      </span>
                      <Badge variant="danger" size="sm">
                        {item.mastery}% Retention
                      </Badge>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {item.topic}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      From Quiz: <em>{item.sourceQuizTitle || 'Diagnostic Drill'}</em> • {item.trend || 'Needs revision'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        onClick={() => navigate(item.actionTarget || (item.courseId ? `/courses/${item.courseId}/tutor` : '/tutor'))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#60a5fa',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {item.suggestedAction || 'Review with AI Tutor in ELI10 Mode'} →
                      </button>

                      <button
                        onClick={() => navigate(item.courseId ? `/courses/${item.courseId}/quizzes` : '/quizzes')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Retake Drill ↺
                      </button>
                    </div>
                  </div>
                ))
              ) : hubData.recentQuizzes.length > 0 ? (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🎉</div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.925rem', marginBottom: '4px' }}>
                    No Weak Topics Diagnosed!
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Quiz scores for {selectedCourseFilter !== 'all' ? (courses.find((c) => c.id === selectedCourseFilter)?.code || 'this course') : 'your courses'} show solid retention (≥75%).
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-medium)',
                  }}
                >
                  <HelpCircle size={26} color="var(--primary)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    No Quiz Diagnostic Yet
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                    Take a practice quiz in {selectedCourseFilter !== 'all' ? (courses.find((c) => c.id === selectedCourseFilter)?.name || 'this course') : 'your courses'} to diagnose concept gaps.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => navigate(selectedCourseFilter !== 'all' ? `/courses/${selectedCourseFilter}/quizzes` : '/quizzes')}
                  >
                    Start Practice Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Quiz Results */}
          <Card glass>
            <CardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#10b981" />
                  <CardTitle style={{ fontSize: '1.1rem' }}>
                    Recent Quiz Results {selectedCourseFilter !== 'all' ? `(${courses.find((c) => c.id === selectedCourseFilter)?.code || ''})` : ''}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(selectedCourseFilter !== 'all' ? `/courses/${selectedCourseFilter}/quizzes` : '/quizzes')}
                  style={{ fontSize: '0.75rem' }}
                >
                  All Quizzes
                </Button>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hubData.recentQuizzes.length > 0 ? (
                hubData.recentQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => navigate(`/quizzes/${quiz.id}`)}
                    className="card-hover-scale"
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {quiz.courseCode}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {quiz.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {quiz.questionsCount} questions • {quiz.difficulty || 'Medium'} • {quiz.completedAt || 'Recent'}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: quiz.score >= 80 ? '#10b981' : quiz.score >= 60 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {quiz.score !== null ? `${quiz.score}%` : 'Pending'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No quiz attempts found for this course.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Learning Activities */}
          <Card glass>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="var(--primary)" />
                <CardTitle style={{ fontSize: '1.1rem' }}>Recommended Learning Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendedActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {act.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                      {act.reason}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '4px 0 8px 0', color: 'var(--text-primary)' }}>
                    {act.title}
                  </h4>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(act.actionRoute)}
                    style={{ fontSize: '0.775rem' }}
                  >
                    {act.actionText} →
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Course Modal */}
      {createCourseModalOpen && (
        <Modal
          isOpen={createCourseModalOpen}
          onClose={() => setCreateCourseModalOpen(false)}
          title="Create New Subject Curriculum"
          size="md"
        >
          <form onSubmit={handleCreateCourseSubmit}>
            <ModalBody style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Course Code & Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <Input
                  placeholder="e.g. CS 450: Computer Networks"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Curriculum Description
                </label>
                <Input
                  placeholder="e.g. TCP/IP stack, BGP routing, congestion control, and SDN"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Exam Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '0.925rem',
                    outline: 'none',
                  }}
                />
              </div>
            </ModalBody>

            <ModalFooter style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateCourseModalOpen(false)}
                disabled={submittingCourse}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submittingCourse}
                disabled={submittingCourse || !courseName.trim()}
              >
                Save Course
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </div>
  );
}
