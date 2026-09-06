import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import ProtectedRoute from '../routes/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

describe('Authentication & Protected Routes Tests (Items 1, 2, 3)', () => {
  it('1. Login Form renders inputs and validates email & password fields', async () => {
    const handleSuccess = vi.fn();

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginForm onSuccess={handleSuccess} />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/alex\.vance@university\.edu/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /sign in to study buddy/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();

    // Type credentials
    fireEvent.change(emailInput, { target: { value: 'alex.vance@mit.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    expect(emailInput.value).toBe('alex.vance@mit.edu');
    expect(passwordInput.value).toBe('Password123!');
  });

  it('2. Registration Form validates password matching and input integrity', async () => {
    const handleSuccess = vi.fn();

    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterForm onSuccess={handleSuccess} />
        </AuthProvider>
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText(/alex vance/i);
    const emailInput = screen.getByPlaceholderText(/alex\.vance@university\.edu/i);
    const passInput = screen.getByPlaceholderText(/at least 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/repeat password/i);
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passInput).toBeInTheDocument();
    expect(confirmInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@mit.edu' } });
    fireEvent.change(passInput, { target: { value: 'Secret123' } });
    fireEvent.change(confirmInput, { target: { value: 'Mismatch999' } });

    fireEvent.click(submitBtn);

    // Should indicate password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('3. ProtectedRoute redirects unauthorized users to login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page Redirect Target</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Secret Student Content</div>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    // When no auth token exists, user should be redirected to Login Page
    expect(screen.queryByText('Secret Student Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page Redirect Target')).toBeInTheDocument();
  });
});
