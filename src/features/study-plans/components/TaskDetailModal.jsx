import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal, { ModalBody, ModalFooter } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import TopicPriorityBadge from './TopicPriorityBadge';
import ActivityTypeBadge, { ACTIVITY_CONFIGS } from './ActivityTypeBadge';
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Calendar,
  ExternalLink,
  Bot,
  HelpCircle,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function TaskDetailModal({ isOpen, onClose, task, onToggleStatus }) {
  const navigate = useNavigate();

  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const actConfig = ACTIVITY_CONFIGS[task.activityType] || ACTIVITY_CONFIGS['Study'];

  const handleActionClick = () => {
    if (task.actionTarget) {
      onClose();
      navigate(task.actionTarget);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Study Plan Task Details" size="md">
      <ModalBody style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Status and Title Header */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: isCompleted ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
            border: isCompleted ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
          }}
        >
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
              marginTop: '3px',
              transition: 'transform 0.15s ease',
            }}
            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          >
            {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <ActivityTypeBadge type={task.activityType} />
              <TopicPriorityBadge priority={task.topicPriority} />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isCompleted ? '#10b981' : 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {isCompleted ? 'Completed' : 'Pending Action'}
              </span>
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 700,
                color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                lineHeight: 1.4,
              }}
            >
              {task.title}
            </h3>
          </div>
        </div>

        {/* Task Properties Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} />
              <span>Duration</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
              {task.duration || `${task.durationMinutes} mins`}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} />
              <span>Scheduled For</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
              {task.scheduledFor || 'Upcoming'}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={13} />
              <span>Topic</span>
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                marginTop: '4px',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {task.topic}
            </div>
          </div>
        </div>

        {/* Detailed Objective */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Study Objective & Instructions
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.925rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              background: 'var(--bg-surface)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {task.description ||
              'Follow the guided syllabus progression for this module. Ensure foundational definitions are noted before advancing to applied problem drills.'}
          </p>
        </div>

        {/* Activity Guidance */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <Sparkles size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Personalized AI Tip: </strong>
            {actConfig.description}
          </div>
        </div>
      </ModalBody>

      <ModalFooter style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Button
          variant={isCompleted ? 'secondary' : 'outline'}
          size="sm"
          icon={isCompleted ? Circle : CheckCircle2}
          onClick={() => onToggleStatus(task.id)}
        >
          {isCompleted ? 'Mark Pending' : 'Mark as Complete'}
        </Button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {task.actionTarget && (
            <Button
              variant="primary"
              size="sm"
              icon={
                task.actionType === 'tutor'
                  ? Bot
                  : task.actionType === 'quiz'
                  ? HelpCircle
                  : FileText
              }
              onClick={handleActionClick}
            >
              {task.actionLabel || 'Proceed to Activity'}
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
