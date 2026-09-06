import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  BookOpen,
  PlusCircle,
  Flame,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LlmSettingsModal from '../common/LlmSettingsModal';
import { groqService } from '../../services/groqService';

export default function Navbar({ onToggleMobileSidebar }) {
  const { user, logout, loginAsDemoStudent } = useAuth();
  const { courses, selectedCourse, setSelectedCourseId } = useCourses();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [llmModalOpen, setLlmModalOpen] = useState(false);
  const [isGroqActive, setIsGroqActive] = useState(groqService.isConfigured());
  const [activeModel, setActiveModel] = useState(groqService.getModel());

  useEffect(() => {
    setIsGroqActive(groqService.isConfigured());
    setActiveModel(groqService.getModel());
  }, [llmModalOpen]);

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Left side: Mobile Hamburger + Course Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleMobileSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="mobile-only-btn"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Course Context Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
            }}
          >
            <BookOpen size={16} color="var(--primary)" />
            <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedCourse ? selectedCourse.code : 'Select Course'}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {/* Dropdown Menu */}
          {courseDropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                onClick={() => setCourseDropdownOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '260px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  padding: '8px',
                  zIndex: 101,
                  animation: 'fadeIn 0.15s ease-out forwards',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase' }}>
                  Current Enrolled Courses
                </div>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setCourseDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: selectedCourse?.id === course.id ? 'var(--primary-light)' : 'transparent',
                      border: 'none',
                      color: selectedCourse?.id === course.id ? 'var(--primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{course.code}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {course.name}
                    </div>
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                  <button
                    onClick={() => {
                      setCourseDropdownOpen(false);
                      navigate('/courses');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <PlusCircle size={14} />
                    Manage All Courses
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side: Streak Badge, AI Mode Indicator, Theme Toggle, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Study Streak Badge */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f59e0b',
              fontSize: '0.825rem',
              fontWeight: 700,
            }}
            title="14-day continuous learning streak!"
            className="desktop-only"
          >
            <Flame size={16} fill="#f59e0b" />
            <span>{user.studyStreakDays || 14} Day Streak</span>
          </div>
        )}

        {/* AI Tutor Quick Shortcut */}
        <Button
          variant="ghost"
          size="sm"
          icon={Sparkles}
          onClick={() => navigate('/tutor')}
          className="desktop-only"
          style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
        >
          Ask AI Tutor
        </Button>

        {/* Groq LLM Engine Status Button */}
        <button
          onClick={() => setLlmModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: isGroqActive ? 'rgba(99, 102, 241, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${isGroqActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: isGroqActive ? 'var(--primary)' : '#ef4444',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
          }}
          title="Groq LLM Engine Status & Settings"
          className="desktop-only"
        >
          <Zap size={14} fill={isGroqActive ? 'var(--primary)' : 'none'} />
          <span>{isGroqActive ? `Groq: ${activeModel.split('/')[1] || activeModel}` : 'Groq: Offline'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile Avatar / User Dropdown */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--primary)',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="desktop-only">
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Student
                </span>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" className="desktop-only" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '240px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    padding: '8px',
                    zIndex: 101,
                    animation: 'fadeIn 0.15s ease-out forwards',
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      marginTop: '4px',
                    }}
                  >
                    <User size={16} color="var(--primary)" />
                    Profile & Preferences
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--danger)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button variant="primary" size="sm" onClick={() => loginAsDemoStudent()}>
              Demo Student
            </Button>
          </div>
        )}
      </div>

      {/* LLM Engine Configuration Modal */}
      <LlmSettingsModal isOpen={llmModalOpen} onClose={() => setLlmModalOpen(false)} />
    </header>
  );
}
