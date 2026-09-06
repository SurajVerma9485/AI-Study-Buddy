import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../authContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, isLoading, error: contextError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Target destination after login
  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setApiError('');

    if (!validateForm()) return;

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      await loginAsDemo();
      navigate(from, { replace: true });
    } catch (err) {
      setApiError('Failed to sign in as demo student.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
      {/* API Error Notification */}
      {(apiError || contextError) && (
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
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{apiError || contextError}</span>
        </div>
      )}

      {/* Email Input */}
      <Input
        label="Student Email Address"
        type="email"
        placeholder="alex.vance@university.edu"
        icon={Mail}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
        }}
        error={fieldErrors.email}
        required
      />

      {/* Password Input */}
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
          }}
          error={fieldErrors.password}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        icon={LogIn}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        style={{ marginTop: '6px' }}
      >
        Sign In to Study Buddy
      </Button>

      <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quick Demo</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
      </div>

      {/* Instant Demo Student Button */}
      <Button
        type="button"
        variant="secondary"
        size="md"
        icon={CheckCircle2}
        onClick={handleDemoLogin}
        disabled={isLoading}
        fullWidth
      >
        Sign In as Demo Student (1-Click)
      </Button>
    </form>
  );
}
