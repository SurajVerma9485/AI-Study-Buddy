import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_WEAK_TOPICS } from '../services/mockData';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';

export default function Progress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses } = useCourses();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>Learning Progress & Mastery</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
          Evaluate topic-level retention, diagnose weak areas, and monitor exam readiness
        </p>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <Card glass>
          <CardContent style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Syllabus Retention</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '8px 0' }}>
              74%
            </div>
            <ProgressBar value={74} size="sm" variant="success" showValue={false} />
          </CardContent>
        </Card>

        <Card glass>
          <CardContent style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Study Streak</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={24} /> {user?.studyStreakDays || 14} Days
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consistent learning habit</span>
          </CardContent>
        </Card>

        <Card glass>
          <CardContent style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quizzes Mastered</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0' }}>
              28 / 32
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>87.5% completion rate</span>
          </CardContent>
        </Card>
      </div>

      {/* Weak Topics Analysis Table */}
      <Card glass>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <CardTitle>Identified Weak Topics & Knowledge Gaps</CardTitle>
          </div>
        </CardHeader>
        <CardContent style={{ padding: '0 24px 24px 24px' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Topics where quiz evaluation scores or tutor hint usage indicate incomplete concept retention.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MOCK_WEAK_TOPICS.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant="primary" size="sm">
                      {item.courseCode}
                    </Badge>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {item.topic}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Trend: {item.trend}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '120px' }}>
                    <ProgressBar value={item.mastery} size="sm" variant="danger" showValue={true} />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => navigate('/tutor')}
                  >
                    Resolve Gap
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Breakdown */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '16px' }}>
          Subject-Level Mastery
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {courses.map((c) => (
            <Card key={c.id} glass>
              <CardContent style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ minWidth: '240px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {c.code}: {c.name}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Exam on {c.examDate} • {c.topics?.length || 0} Modules
                  </span>
                </div>

                <div style={{ flex: 1, maxWidth: '360px', minWidth: '200px' }}>
                  <ProgressBar value={c.progress} size="md" variant="auto" />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate(`/courses/${c.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
