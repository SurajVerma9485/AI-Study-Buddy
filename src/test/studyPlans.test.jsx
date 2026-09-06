import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PlanSummaryHeader from '../features/study-plans/components/PlanSummaryHeader';
import TaskCard from '../features/study-plans/components/TaskCard';

describe('Study Plans Tests (Item 12)', () => {
  const mockPlan = {
    id: 'plan-cs301',
    courseCode: 'CS 301',
    courseName: 'Distributed Systems',
    examDate: '2026-10-15',
    dailyStudyMinutes: 60,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday'],
    weakTopics: ['Consensus & Raft Invariants'],
    tasks: [
      { id: 't-1', title: 'Master Vector Clocks', status: 'completed' },
      { id: 't-2', title: 'Raft State Transition Drill', status: 'pending' },
    ],
  };

  const mockTask = {
    id: 'task-101',
    title: 'Master Vector Clocks & Partial Ordering',
    topic: 'Logical Time & Vector Clocks',
    topicPriority: 'High',
    activityType: 'Weak-topic review',
    duration: '40 mins',
    status: 'pending',
    scheduledFor: 'Today',
    actionType: 'tutor',
    actionLabel: 'Consult AI Tutor',
    actionTarget: '/courses/course-cs301/tutor',
  };

  it('12. Study plan header displays exam countdown, daily study time, and preferred days', () => {
    render(
      <PlanSummaryHeader plan={mockPlan} onOpenCreateModal={vi.fn()} />
    );

    expect(screen.getByText(/Exam Countdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily Study Time/i)).toBeInTheDocument();
    expect(screen.getByText(/60 Mins/i)).toBeInTheDocument();
    expect(screen.getByText(/Preferred Days/i)).toBeInTheDocument();
  });

  it('12. TaskCard renders activity badge, priority, duration, and completion toggle', () => {
    const handleToggle = vi.fn();

    render(
      <BrowserRouter>
        <TaskCard task={mockTask} onToggleStatus={handleToggle} />
      </BrowserRouter>
    );

    expect(screen.getByText('Master Vector Clocks & Partial Ordering')).toBeInTheDocument();
    expect(screen.getByText(/Weak-Topic Review/i)).toBeInTheDocument();
    expect(screen.getByText(/High/i)).toBeInTheDocument();
    expect(screen.getByText('40 mins')).toBeInTheDocument();

    // Click completion circle button
    const toggleBtn = screen.getByTitle(/Mark complete/i);
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledWith('task-101');
  });

  it('13. CreatePlanModal renders Caveman Step 1 (Class, Subject, Chapter, Days) and transitions to Step 2', async () => {
    const { default: CreatePlanModal } = await import('../features/study-plans/components/CreatePlanModal');
    const handleClose = vi.fn();
    const handlePlanCreated = vi.fn();

    render(
      <CreatePlanModal isOpen={true} onClose={handleClose} onPlanCreated={handlePlanCreated} />
    );

    // Step 1 assertions
    expect(screen.getByText(/1\. Select Class/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Select Subject/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Select Lesson \/ Chapter/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Select Number of Days/i)).toBeInTheDocument();

    // Verify Chapter 1 & Chapter 2 from notes
    expect(screen.getByRole('option', { name: /Chapter 1 - Real Numbers/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Chapter 2 - Polynomials/i })).toBeInTheDocument();

    // Advance to Step 2
    const nextBtn = screen.getByRole('button', { name: /Continue: Set Daily Study Time/i });
    fireEvent.click(nextBtn);

    // Step 2 assertions
    expect(screen.getByText(/How much time can you study per day\?/i)).toBeInTheDocument();
    expect(screen.getByText(/2 hours \/ day/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EXECUTE/i })).toBeInTheDocument();
  });

  it('14. DayByDayPlanCard renders Day-by-Day schedule with bullets and study goal', async () => {
    const { default: DayByDayPlanCard } = await import('../features/study-plans/components/DayByDayPlanCard');

    const samplePlan = {
      classLevel: 'Class 10',
      subject: 'Mathematics',
      chapter: 'Chapter 1 - Real Numbers',
      days: 5,
      dailyStudyTime: '2 hours/day',
      daySchedule: [
        {
          dayNumber: 1,
          dayLabel: 'Day 1',
          bulletPoints: ['Learn Chapter 1 concepts', 'Read notes', 'Practice basic questions'],
        },
        {
          dayNumber: 2,
          dayLabel: 'Day 2',
          bulletPoints: ['Continue Chapter 1', 'Practice examples'],
        },
      ],
    };

    render(<DayByDayPlanCard plan={samplePlan} />);

    expect(screen.getByText('Chapter 1 - Real Numbers')).toBeInTheDocument();
    expect(screen.getByText(/5 Days Total/i)).toBeInTheDocument();
    expect(screen.getByText('Day 1:')).toBeInTheDocument();
    expect(screen.getByText('Learn Chapter 1 concepts')).toBeInTheDocument();
    expect(screen.getByText('Read notes')).toBeInTheDocument();
    expect(screen.getByText('Day 2:')).toBeInTheDocument();
    expect(screen.getByText('Continue Chapter 1')).toBeInTheDocument();
  });
});
