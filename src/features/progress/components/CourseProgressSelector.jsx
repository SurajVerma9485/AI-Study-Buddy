import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../../context/CourseContext';
import { Layers } from 'lucide-react';

export default function CourseProgressSelector({ activeCourseId = null }) {
  const navigate = useNavigate();
  const { courses } = useCourses();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}
    >
      <button
        onClick={() => navigate('/progress')}
        style={{
          padding: '7px 16px',
          borderRadius: '9999px',
          fontSize: '0.825rem',
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          background: activeCourseId === null ? 'var(--primary)' : 'var(--bg-card)',
          color: activeCourseId === null ? '#ffffff' : 'var(--text-secondary)',
          border: activeCourseId === null ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Layers size={14} />
        All Courses
      </button>

      {courses.map((course) => {
        const isActive = activeCourseId === course.id;
        return (
          <button
            key={course.id}
            onClick={() => navigate(`/courses/${course.id}/progress`)}
            style={{
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: isActive ? 'var(--primary)' : 'var(--bg-card)',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
              transition: 'all 0.15s ease',
            }}
          >
            {course.code}
          </button>
        );
      })}
    </div>
  );
}
