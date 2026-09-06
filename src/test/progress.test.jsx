import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import OverallMasteryCard from '../features/progress/components/OverallMasteryCard';
import WeakTopicCard from '../features/progress/components/WeakTopicCard';
import TopicMasteryCard from '../features/progress/components/TopicMasteryCard';

describe('Progress & Mastery Analytics Tests (Item 13)', () => {
  it('13. OverallMasteryCard renders mastery percentage, questions attempted and correct answers', () => {
    render(
      <OverallMasteryCard
        overallMastery={78}
        questionsAttempted={240}
        correctAnswers={192}
        quizAccuracy={80}
        studyStreakDays={14}
        totalStudyHours={46.2}
      />
    );

    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('240')).toBeInTheDocument();
    expect(screen.getByText('192')).toBeInTheDocument();
    expect(screen.getByText(/80% Quiz Accuracy/i)).toBeInTheDocument();
    expect(screen.getByText(/46\.2 total hours logged/i)).toBeInTheDocument();
  });

  it('13. WeakTopicCard renders diagnostic gap details and remediation action', () => {
    const mockWeak = {
      id: 'weak-1',
      courseCode: 'CS 420',
      topic: 'Deadlock Detection & Concurrency',
      mastery: 35,
      trend: '-5% last week',
      suggestedAction: 'Take 5-min Hint Mode Quiz',
    };

    render(
      <BrowserRouter>
        <WeakTopicCard item={mockWeak} />
      </BrowserRouter>
    );

    expect(screen.getByText('CS 420')).toBeInTheDocument();
    expect(screen.getByText('Deadlock Detection & Concurrency')).toBeInTheDocument();
    expect(screen.getByText('35%')).toBeInTheDocument();
    expect(screen.getByText(/-5% last week/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ask AI Tutor/i })).toBeInTheDocument();
  });

  it('13. TopicMasteryCard renders individual module retention percentage', () => {
    const mockTopic = {
      id: 'top-1',
      courseCode: 'CS 301',
      title: 'CAP Theorem & PACELC Trade-offs',
      mastery: 92,
      status: 'mastered',
      questionsAttempted: 20,
      correctAnswers: 18,
    };

    render(
      <BrowserRouter>
        <TopicMasteryCard topic={mockTopic} courseId="course-cs301" />
      </BrowserRouter>
    );

    expect(screen.getByText('CAP Theorem & PACELC Trade-offs')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText(/Mastered/i)).toBeInTheDocument();
  });
});
