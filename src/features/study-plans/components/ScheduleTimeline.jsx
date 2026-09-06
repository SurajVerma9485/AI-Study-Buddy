import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Calendar, Filter, CheckCircle2, Clock, ListOrdered, CalendarDays } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ACTIVITY_FILTERS = [
  'All',
  'Study',
  'Revision',
  'Practice',
  'Quiz',
  'Weak-topic review',
];

export default function ScheduleTimeline({ tasks = [], onToggleTaskStatus, title = 'Upcoming Schedule' }) {
  const [selectedActivity, setSelectedActivity] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Completed'

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesActivity =
      selectedActivity === 'All' || task.activityType === selectedActivity;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && task.status !== 'completed') ||
      (statusFilter === 'Completed' && task.status === 'completed');
    return matchesActivity && matchesStatus;
  });

  // Group filtered tasks by scheduledFor or scheduledDate
  const groupTasksByTimeline = (taskList) => {
    const groups = {
      Today: [],
      Tomorrow: [],
      Upcoming: [],
      Completed: [],
    };

    taskList.forEach((t) => {
      if (t.status === 'completed' && t.scheduledFor === 'Completed') {
        groups.Completed.push(t);
      } else if (t.scheduledFor === 'Today') {
        groups.Today.push(t);
      } else if (t.scheduledFor === 'Tomorrow') {
        groups.Tomorrow.push(t);
      } else {
        groups.Upcoming.push(t);
      }
    });

    return groups;
  };

  const grouped = groupTasksByTimeline(filteredTasks);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Filter Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{title}</h3>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Status toggles */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-elevated)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {['All', 'Pending', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? 'var(--primary)' : 'transparent',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Type Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {ACTIVITY_FILTERS.map((act) => {
          const isSelected = selectedActivity === act;
          return (
            <button
              key={act}
              onClick={() => setSelectedActivity(act)}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '0.775rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                transition: 'all 0.15s ease',
              }}
            >
              {act}
            </button>
          );
        })}
      </div>

      {/* Render Grouped Sections */}
      {filteredTasks.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-medium)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          No tasks found matching the selected filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today */}
          {grouped.Today.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--primary)',
                    background: 'rgba(99, 102, 241, 0.1)',
                    padding: '3px 10px',
                    borderRadius: '4px',
                  }}
                >
                  Today’s Focus
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({grouped.Today.filter((t) => t.status === 'completed').length}/{grouped.Today.length} completed)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {grouped.Today.map((task) => (
                  <TaskCard key={task.id} task={task} onToggleStatus={onToggleTaskStatus} />
                ))}
              </div>
            </div>
          )}

          {/* Tomorrow */}
          {grouped.Tomorrow.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '3px 10px',
                    borderRadius: '4px',
                  }}
                >
                  Tomorrow
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({grouped.Tomorrow.length} tasks scheduled)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {grouped.Tomorrow.map((task) => (
                  <TaskCard key={task.id} task={task} onToggleStatus={onToggleTaskStatus} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {grouped.Upcoming.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-elevated)',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  Upcoming Schedule
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({grouped.Upcoming.length} upcoming items)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {grouped.Upcoming.map((task) => (
                  <TaskCard key={task.id} task={task} onToggleStatus={onToggleTaskStatus} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Archive */}
          {grouped.Completed.length > 0 && statusFilter !== 'Pending' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '3px 10px',
                    borderRadius: '4px',
                  }}
                >
                  Completed Milestones
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({grouped.Completed.length} mastered)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {grouped.Completed.map((task) => (
                  <TaskCard key={task.id} task={task} onToggleStatus={onToggleTaskStatus} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
