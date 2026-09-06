import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { BookOpen } from 'lucide-react';

describe('Common UI States Tests (Items 14, 15)', () => {
  it('14. EmptyState renders custom title, description, and action button', () => {
    const handleAction = vi.fn();

    render(
      <EmptyState
        icon={BookOpen}
        title="No Subjects Enrolled"
        description="Enroll in a course curriculum to start studying."
        actionLabel="Create Course"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No Subjects Enrolled')).toBeInTheDocument();
    expect(screen.getByText('Enroll in a course curriculum to start studying.')).toBeInTheDocument();

    const actionBtn = screen.getByRole('button', { name: /Create Course/i });
    expect(actionBtn).toBeInTheDocument();

    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalled();
  });

  it('15. ErrorState renders error message and triggers retry handler', () => {
    const handleRetry = vi.fn();

    render(
      <ErrorState
        title="Network Connection Failed"
        message="Unable to reach the AI Study Buddy backend server."
        onRetry={handleRetry}
        retryLabel="Try Again"
      />
    );

    expect(screen.getByText('Network Connection Failed')).toBeInTheDocument();
    expect(screen.getByText('Unable to reach the AI Study Buddy backend server.')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalled();
  });
});
