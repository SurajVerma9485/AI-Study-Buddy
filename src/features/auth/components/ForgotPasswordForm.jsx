import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { authService } from '../authService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setFieldError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Please enter a valid email address.');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Failed to process request.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }} className="animate-fade-in">
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          Password Reset Email Sent
        </h3>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '380px' }}>
          We've sent recovery instructions to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Please check your inbox.
        </p>

        <Link to="/login" style={{ marginTop: '12px' }}>
          <Button variant="secondary" size="md" icon={ArrowLeft}>
            Return to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
      {apiError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          className="animate-fade-in"
        >
          <AlertCircle size={18} />
          <span>{apiError}</span>
        </div>
      )}

      <Input
        label="Student Email Address"
        type="email"
        placeholder="alex.vance@university.edu"
        icon={Mail}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldError) setFieldError('');
        }}
        error={fieldError}
        helperText="We will send a secure password reset link to this email address."
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        icon={Send}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        style={{ marginTop: '8px' }}
      >
        Send Recovery Instructions
      </Button>

      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </form>
  );
}
