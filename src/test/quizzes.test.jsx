import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import QuizQuestionView from '../features/quizzes/components/QuizQuestionView';
import TopicPerformanceBreakdown from '../features/quizzes/components/TopicPerformanceBreakdown';

describe('Quiz Runner & Results Tests (Items 9, 10, 11)', () => {
  const mockMcqQuestion = {
    id: 'q-1',
    topicName: 'Consensus & Raft',
    type: 'MCQ',
    question: 'What triggers an election in Raft?',
    options: ['Heartbeat timeout', 'Client write', 'Disk failure', 'Network split'],
  };

  const mockTfQuestion = {
    id: 'q-2',
    topicName: 'Operating Systems',
    type: 'True/False',
    question: 'A deadlock can occur without mutual exclusion.',
    options: ['True', 'False'],
  };

  it('10. Quiz answer selection works for Multiple Choice questions', () => {
    const handleSelect = vi.fn();

    render(
      <QuizQuestionView
        question={mockMcqQuestion}
        selectedAnswer={null}
        onSelectAnswer={handleSelect}
      />
    );

    expect(screen.getByText('What triggers an election in Raft?')).toBeInTheDocument();
    expect(screen.getByText('Heartbeat timeout')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Heartbeat timeout'));
    expect(handleSelect).toHaveBeenCalledWith(0);
  });

  it('10. Quiz answer selection works for True/False questions', () => {
    const handleSelect = vi.fn();

    render(
      <QuizQuestionView
        question={mockTfQuestion}
        selectedAnswer={null}
        onSelectAnswer={handleSelect}
      />
    );

    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();

    fireEvent.click(screen.getByText('False'));
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it('11. Quiz results renders topic performance breakdown and mastery metrics', () => {
    const mockTopics = [
      {
        topicId: 'top-1',
        topicName: 'Raft Consensus',
        totalQuestions: 5,
        correctAnswers: 4,
        percentage: 80,
      },
      {
        topicId: 'top-2',
        topicName: 'Vector Clocks',
        totalQuestions: 5,
        correctAnswers: 2,
        percentage: 40,
      },
    ];

    render(
      <MemoryRouter>
        <TopicPerformanceBreakdown topicPerformance={mockTopics} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Syllabus Topic Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('Raft Consensus')).toBeInTheDocument();
    expect(screen.getByText('Vector Clocks')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});
