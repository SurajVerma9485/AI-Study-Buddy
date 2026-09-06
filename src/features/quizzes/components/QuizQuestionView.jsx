import React from 'react';
import { HelpCircle, Check, BookOpen } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import { TextArea } from '../../../components/ui/Input';

/**
 * QuizQuestionView Component
 * Renders a single quiz question with options according to question type:
 * - MCQ
 * - True/False
 * - Short Answer
 */
export default function QuizQuestionView({
  question,
  currentIndex = 0,
  totalCount = 1,
  selectedAnswer,
  onSelectAnswer,
}) {
  if (!question) return null;

  const rawType = (question.type || '').trim().toLowerCase();
  const isTrueFalse =
    rawType === 'true/false' ||
    rawType === 'tf' ||
    rawType === 't/f' ||
    rawType === 'true-false' ||
    rawType === 'boolean' ||
    (Array.isArray(question.options) &&
      question.options.length === 2 &&
      question.options.some((o) => typeof o === 'string' && o.toLowerCase() === 'true') &&
      question.options.some((o) => typeof o === 'string' && o.toLowerCase() === 'false'));

  const isShortAnswer = rawType === 'short answer';
  const isMCQ = !isTrueFalse && !isShortAnswer;

  // Guaranteed options list (fallback to ['True', 'False'] for True/False questions)
  const options =
    Array.isArray(question.options) && question.options.length > 0
      ? question.options
      : isTrueFalse
      ? ['True', 'False']
      : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Question Header: Number, Topic & Type Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: '0.85rem',
              color: 'var(--primary)',
              backgroundColor: 'var(--primary-light)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Question {currentIndex + 1} of {totalCount}
          </span>
          {question.topicName && (
            <Badge variant="outline" size="sm">
              <BookOpen size={12} style={{ marginRight: '4px' }} />
              {question.topicName}
            </Badge>
          )}
        </div>

        <Badge variant={isTrueFalse ? 'warning' : 'secondary'} size="sm">
          {isTrueFalse ? 'True / False' : (question.type || 'MCQ')}
        </Badge>
      </div>

      {/* Question Body */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)', margin: '4px 0' }}>
        {question.question}
      </h3>

      {/* Render Options according to Question Type */}
      {/* 1. MCQ or True/False with options list */}
      {(isMCQ || isTrueFalse) && options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((optionText, idx) => {
            const isSelected = selectedAnswer === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectAnswer(idx)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-elevated)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  lineHeight: 1.4,
                  transition: 'var(--transition-smooth)',
                  boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none',
                }}
                className="quiz-option-button"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border-medium)',
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                    }}
                  >
                    {isSelected ? <Check size={14} /> : String.fromCharCode(65 + idx)}
                  </div>
                  <span>{optionText}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Short Answer Input */}
      {isShortAnswer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <TextArea
            label="Your Answer"
            placeholder="Type your explanation or answer here..."
            rows={4}
            value={selectedAnswer || ''}
            onChange={(e) => onSelectAnswer(e.target.value)}
            helperText="Write your concise concept explanation for evaluation."
          />
        </div>
      )}
    </div>
  );
}
