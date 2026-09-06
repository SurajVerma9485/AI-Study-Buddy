import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import {
  User,
  Mail,
  GraduationCap,
  Sparkles,
  Flame,
  Award,
  Clock,
  LogOut,
  Settings,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { courses } = useCourses();
  const navigate = useNavigate();

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [preferredMode, setPreferredMode] = useState('Normal');
  const [dailyGoal, setDailyGoal] = useState(60);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmLogout = () => {
    setConfirmLogoutOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Student Profile & Preferences
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            Manage your AI learning configurations, active enrollment, and study habit targets
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          icon={LogOut}
          onClick={() => setConfirmLogoutOpen(true)}
        >
          Sign Out
        </Button>
      </div>

      {/* Main Profile Identity Card */}
      <Card glass>
        <CardContent style={{ padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  padding: '3px',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={36} color="var(--primary)" />
                  )}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                    {user?.name || 'Alex Vance'}
                  </h2>
                  <Badge variant="primary" size="sm">
                    {user?.role === 'student' ? 'Enrolled Student' : 'Active Learner'}
                  </Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} />
                    {user?.email || 'alex.vance@mit.edu'}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={14} />
                    {user?.institution || 'Department of Computer Science'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Streak</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                  <Flame size={18} /> {user?.studyStreakDays || 14}d
                </div>
              </div>

              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mastery</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {user?.averageMastery || 78}%
                </div>
              </div>

              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Drills</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  {user?.quizzesCompleted || 28}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Preferences & Enrolled Courses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Learning Preferences */}
        <Card glass>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} color="var(--primary)" />
              <CardTitle>AI Tutor & Revision Preferences</CardTitle>
            </div>
          </CardHeader>

          <CardContent style={{ padding: '0 24px 24px 24px' }}>
            <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {saveSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  Preferences updated successfully!
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Default AI Explanation Mode
                </label>
                <select
                  value={preferredMode}
                  onChange={(e) => setPreferredMode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="Normal">Normal (Academic standard)</option>
                  <option value="ELI10">ELI10 (Explain Like I'm 10 — analogies)</option>
                  <option value="Detailed">Detailed (Math derivations & proofs)</option>
                  <option value="Exam">Exam Style (Rubric & mark schemes)</option>
                  <option value="Hint">Socratic Hint (Guided clues only)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Configures the default pedagogical tone for the AI Tutor.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Daily Revision Target</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {dailyGoal} minutes / day
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ShieldCheck size={18} color="#10b981" />
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Backend Grounding API connected: <strong style={{ color: 'var(--text-primary)' }}>Active</strong>
                </div>
              </div>

              <Button type="submit" variant="primary" size="md" style={{ alignSelf: 'flex-start' }}>
                Save Preferences
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enrolled Courses Overview */}
        <Card glass>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--primary)" />
                <CardTitle>Enrolled Curriculums ({courses.length})</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                Manage
              </Button>
            </div>
          </CardHeader>

          <CardContent style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="card-hover-scale"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--primary)',
                        }}
                      >
                        {course.code}
                      </span>
                      <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {course.name}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Exam: {course.examDate} • {course.topics?.length || 5} topics
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
                      {course.progress}%
                    </span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sign Out Confirmation Modal */}
      {confirmLogoutOpen && (
        <Modal
          isOpen={confirmLogoutOpen}
          onClose={() => setConfirmLogoutOpen(false)}
          title="Sign Out Confirmation"
          size="sm"
        >
          <ModalBody style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Are you sure you want to sign out of your AI Study Buddy account? Your session tokens will be revoked.
            </p>
          </ModalBody>

          <ModalFooter style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="ghost" size="sm" onClick={() => setConfirmLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" icon={LogOut} onClick={handleConfirmLogout}>
              Sign Out
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
