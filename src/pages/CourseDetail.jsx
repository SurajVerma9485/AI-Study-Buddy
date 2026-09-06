import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  HelpCircle,
  Plus,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  BookOpen,
  CalendarCheck,
  UploadCloud,
  ChevronRight,
  Database,
  Trash2,
  Play,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { MOCK_DOCUMENTS, MOCK_RECENT_QUIZZES } from '../services/mockData';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Input, { TextArea } from '../components/ui/Input';
import Loading from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, loading, addTopic, deleteCourse, setSelectedCourseId } = useCourses();

  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'documents' | 'quizzes'
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [subtopicsText, setSubtopicsText] = useState('');
  const [addingTopic, setAddingTopic] = useState(false);

  // Find target course
  const course = courses.find((c) => c.id === courseId) || null;

  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId, setSelectedCourseId]);

  if (loading && !course) {
    return <Loading message="Loading course curriculum & topics..." fullPage size="lg" />;
  }

  if (!course) {
    return (
      <ErrorState
        title="Course Not Found"
        message="The requested curriculum ID does not exist or has been removed."
        onRetry={() => navigate('/courses')}
        retryLabel="Return to Courses"
      />
    );
  }

  // Filter course-specific documents and quizzes
  const courseDocs = MOCK_DOCUMENTS.filter(
    (d) => d.courseId === course.id || d.courseName.toLowerCase().includes(course.code.toLowerCase().split(' ')[0])
  );

  const courseQuizzes = MOCK_RECENT_QUIZZES.filter(
    (q) => q.courseId === course.id || q.courseCode === course.code
  );

  const handleAddTopicSubmit = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;

    setAddingTopic(true);
    try {
      const subtopics = subtopicsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await addTopic(course.id, {
        title: topicTitle,
        summary: topicSummary,
        subtopics: subtopics.length ? subtopics : ['Key Concept'],
      });

      setTopicTitle('');
      setTopicSummary('');
      setSubtopicsText('');
      setTopicModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTopic(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate('/courses')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
            marginBottom: '16px',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to Courses
        </button>

        {/* Course Information Header */}
        <div
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(17, 24, 39, 0.85) 100%)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Badge variant="primary" size="md">
                {course.code || 'COURSE'}
              </Badge>
              <Badge variant="outline" size="md">
                Exam Date: {course.examDate}
              </Badge>
            </div>

            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
              {course.name}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              {course.description}
            </p>
          </div>

          {/* AI Shortcuts: AI Tutor shortcut & Study Plan shortcut */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              onClick={() => {
                setSelectedCourseId(course.id);
                navigate(`/courses/${course.id}/tutor`);
              }}
            >
              Ask AI Tutor (This Subject)
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={CalendarCheck}
              onClick={() => {
                setSelectedCourseId(course.id);
                navigate('/study-plans');
              }}
            >
              View Revision Schedule
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={HelpCircle}
              onClick={() => {
                setSelectedCourseId(course.id);
                navigate('/quizzes');
              }}
            >
              Practice Quizzes
            </Button>
          </div>
        </div>
      </div>

      {/* Progress & Overview Card */}
      <Card glass>
        <CardContent style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <ProgressBar
                value={course.progress}
                label="Curriculum Topic Mastery"
                size="md"
                variant="auto"
              />
            </div>

            <div style={{ display: 'flex', gap: '24px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Syllabus Topics</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {course.topics?.length || course.topicsCount || 0}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Indexed Docs</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {courseDocs.length || course.documentsCount || 0}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs for Topics / Documents / Quizzes */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '8px' }}>
        {[
          { id: 'topics', label: 'Syllabus Topics', count: course.topics?.length || 0, icon: Layers },
          { id: 'documents', label: 'Course Documents', count: courseDocs.length, icon: FileText },
          { id: 'quizzes', label: 'Practice Quizzes', count: courseQuizzes.length, icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.925rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <Icon size={16} />
              {tab.label}
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-elevated)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Topics Section */}
      {activeTab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Syllabus Modules & Topics</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
                Track concept mastery or target specific topics in AI Tutor
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setTopicModalOpen(true)}
            >
              Add Syllabus Topic
            </Button>
          </div>

          {!course.topics || course.topics.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No Topics Defined"
              description="Break down this course into syllabus modules to enable targeted quizzes and personalized revision."
              actionLabel="Add Topic"
              actionIcon={Plus}
              onAction={() => setTopicModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {course.topics.map((topic, index) => (
                <Card key={topic.id} glass hoverable>
                  <CardContent style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '260px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                              {topic.title}
                            </h3>

                            <Badge
                              variant={
                                topic.status === 'mastered'
                                  ? 'success'
                                  : topic.status === 'improving'
                                  ? 'warning'
                                  : 'danger'
                              }
                              size="sm"
                            >
                              {topic.status === 'mastered'
                                ? 'Mastered'
                                : topic.status === 'improving'
                                ? 'Improving'
                                : 'Needs Focus'}
                            </Badge>
                          </div>

                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '640px' }}>
                            {topic.summary}
                          </p>

                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                              {topic.subtopics.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-secondary)',
                                  }}
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '150px' }}>
                        <div style={{ width: '120px' }}>
                          <ProgressBar value={topic.mastery} size="sm" variant="auto" showValue />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            navigate('/tutor');
                          }}
                          style={{ fontSize: '0.8rem' }}
                        >
                          Explain in ELI10 →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Documents Section */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Associated Learning Documents</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
                Ground truth materials indexed in pgvector for this curriculum
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={UploadCloud}
              onClick={() => navigate(`/courses/${course.id}/documents`)}
            >
              Manage & Upload Documents
            </Button>
          </div>

          {courseDocs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Documents Uploaded Yet"
              description="Upload syllabus PDFs or lecture notes to provide factual context for the AI Tutor."
              actionLabel="Upload First File"
              actionIcon={UploadCloud}
              onAction={() => navigate(`/courses/${course.id}/documents`)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courseDocs.map((doc) => (
                <Card key={doc.id} glass>
                  <CardContent style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{doc.fileName}</h4>
                        <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                          {doc.size} • Uploaded {doc.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        <Database size={14} color="var(--primary)" />
                        <span><strong>{doc.chunksCount}</strong> Chunks indexed</span>
                      </div>

                      <Badge variant="success" size="sm" dot>
                        Vector Ready
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Quizzes Section */}
      {activeTab === 'quizzes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Subject Practice Quizzes</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '2px' }}>
                Self-evaluation drills tailored to this course
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/quizzes')}
            >
              Generate New Quiz
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {courseQuizzes.map((quiz) => (
              <Card key={quiz.id} glass>
                <CardContent style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant="primary" size="sm">
                      {quiz.courseCode}
                    </Badge>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)' }}>
                      {quiz.score}% Best
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{quiz.title}</h3>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {quiz.questionsCount} Questions • {quiz.type}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Play}
                    fullWidth
                    onClick={() => navigate('/quizzes')}
                  >
                    Start Drill
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      <Modal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title="Add Syllabus Topic"
        description={`Add a new module to ${course.code || 'this course'}`}
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setTopicModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddTopicSubmit}
              loading={addingTopic}
              disabled={!topicTitle.trim() || addingTopic}
            >
              Save Topic
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddTopicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Topic Name / Module"
            placeholder="e.g. Distributed Consensus & Raft Invariants"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            required
          />

          <TextArea
            label="Learning Objectives / Summary"
            placeholder="What should the student master after completing this module?"
            rows={3}
            value={topicSummary}
            onChange={(e) => setTopicSummary(e.target.value)}
          />

          <Input
            label="Subtopics (comma-separated)"
            placeholder="e.g. Leader Election, Log Replication, Safety Invariants"
            value={subtopicsText}
            onChange={(e) => setSubtopicsText(e.target.value)}
            helperText="Separate concepts with commas"
          />
        </form>
      </Modal>
    </div>
  );
}
