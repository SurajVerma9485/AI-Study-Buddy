import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

/**
 * SubmitConfirmModal Component
 * Confirmation prompt before submitting quiz answers to backend grading.
 */
export default function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  answeredCount = 0,
  totalCount = 0,
  isSubmitting = false,
}) {
  const hasUnanswered = answeredCount < totalCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Submit Practice Test?"
      description="Your answers will be sent to the backend evaluation engine for authoritative scoring."
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Review Answers
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit for Grading
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: hasUnanswered ? 'var(--warning-light)' : 'var(--success-light)',
              color: hasUnanswered ? '#f59e0b' : 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {hasUnanswered ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {answeredCount} of {totalCount} Questions Answered
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {hasUnanswered
                ? `${totalCount - answeredCount} question(s) remain unanswered.`
                : 'All questions have been completed!'}
            </span>
          </div>
        </div>

        {hasUnanswered && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#fbbf24',
              fontSize: '0.825rem',
            }}
          >
            Unanswered questions will be scored as 0 by the evaluation engine.
          </div>
        )}
      </div>
    </Modal>
  );
}
