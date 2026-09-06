import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Info,
  Bot,
  HelpCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import TopicPriorityBadge from './TopicPriorityBadge';
import ActivityTypeBadge from './ActivityTypeBadge';
import TaskDetailModal from './TaskDetailModal';

export default function TaskCard({ task, onToggleStatus }) {
  const navigate = useNavigate();
  const [showDetail, setShowDetail] = useState(false);

  if (!task) return null;

  const isCompleted = task.status === 'completed';

  const handleAction = (e) => {
    e.stopPropagation();
    if (task.actionTarget) {
      navigate(task.actionTarget);
    }
  };

  const getActionIcon = () => {
    switch (task.actionType) {
      case 'tutor':
        return Bot;
      case 'quiz':
        return HelpCircle;
      default:
        return FileText;
    }
  };

  const ActionIcon = getActionIcon();

  return (
    <>
      <div
        className="card-hover-scale"
        style={{
          borderRadius: 'var(--radius-md)',
          background: isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
          border: isCompleted
            ? '1px solid rgba(16, 185, 129, 0.25)'
            : '1px solid var(--border-subtle)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative',
          transition: 'all 0.2s ease',
          opacity: isCompleted ? 0.75 : 1,
        }}
      >
        {/* Top meta row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <ActivityTypeBadge type={task.activityType} size="sm" />
            <TopicPriorityBadge priority={task.topicPriority} />
            {task.courseCode && (
              <span
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {task.courseCode}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              <Clock size={13} />
              <span>{task.duration || `${task.durationMinutes} mins`}</span>
            </div>

            {task.scheduledFor && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: task.scheduledFor === 'Today' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-elevated)',
                  color: task.scheduledFor === 'Today' ? 'var(--primary)' : 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {task.scheduledFor}
              </span>
            )}
          </div>
        </div>

        {/* Middle row: Checkbox, Title & Topic */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <button
            onClick={() => onToggleStatus(task.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isCompleted ? '#10b981' : 'var(--text-muted)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2px',
              transition: 'transform 0.15s ease, color 0.15s ease',
            }}
            title={isCompleted ? 'Mark pending' : 'Mark complete'}
          >
            {isCompleted ? (
              <CheckCircle2 size={22} className="animate-fade-in" />
            ) : (
              <Circle size={22} />
            )}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 700,
                color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                lineHeight: 1.4,
              }}
            >
              {task.title}
            </h4>

            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description || task.topic}
            </p>
          </div>
        </div>

        {/* Bottom action row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '2px',
          }}
        >
          <button
            onClick={() => setShowDetail(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Info size={13} />
            <span>Task Details</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {task.actionTarget && !isCompleted && (
              <Button
                variant="outline"
                size="sm"
                icon={ActionIcon}
                onClick={handleAction}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                {task.actionLabel || 'Start Activity'}
              </Button>
            )}

            <Button
              variant={isCompleted ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => onToggleStatus(task.id)}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {isCompleted ? 'Mark Pending' : 'Done'}
            </Button>
          </div>
        </div>
      </div>

      {showDetail && (
        <TaskDetailModal
          isOpen={showDetail}
          onClose={() => setShowDetail(false)}
          task={task}
          onToggleStatus={onToggleStatus}
        />
      )}
    </>
  );
}
