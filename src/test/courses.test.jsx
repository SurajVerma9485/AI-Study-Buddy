import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { CourseProvider } from '../context/CourseContext';
import Courses from '../pages/Courses';

describe('Courses & Curriculum Tests (Items 4, 5)', () => {
  it('5. Course listing renders enrolled courses and syllabus badges', async () => {
    render(
      <BrowserRouter>
        <CourseProvider>
          <Courses />
        </CourseProvider>
      </BrowserRouter>
    );

    // Wait for courses to finish loading from API
    await waitFor(() => {
      expect(screen.getByText(/Courses & Curriculum Management/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Filter courses by name or subject code/i)).toBeInTheDocument();
    expect(screen.getByText(/CS 301/i)).toBeInTheDocument();
  });

  it('4. Course creation modal opens and renders required input fields', async () => {
    render(
      <BrowserRouter>
        <CourseProvider>
          <Courses />
        </CourseProvider>
      </BrowserRouter>
    );

    // Wait for courses to finish loading and click Create Course button
    const createCourseBtn = await waitFor(() =>
      screen.getByRole('button', { name: /Create Course/i })
    );

    fireEvent.click(createCourseBtn);

    // Check modal contents
    await waitFor(() => {
      expect(screen.getByText(/Fill in syllabus details to create a new curriculum/i)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/e\.g\. Operating Systems & Kernel Internals/i)).toBeInTheDocument();
  });
});
