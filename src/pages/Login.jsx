import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, LogIn, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardContent } from '../components/ui/Card';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsDemoStudent, loading } = useAuth();

  const [email, setEmail] = useState('alex.vance@mit.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid login credentials.');
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoStudent();
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      className="animate-fade-in"
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to access your courses, AI tutor, and revision plans
          </p>
        </div>

        {/* Login Form Card */}
        <Card glass>
          <CardContent style={{ padding: '28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--danger-light)',
                    color: '#f87171',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {error}
                </div>
              )}

              <Input
                label="Student Email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={LogIn}
                fullWidth
                style={{ marginTop: '10px', fontWeight: 700 }}
              >
                Sign In
              </Button>
            </form>

            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            {/* Quick Demo Access */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={CheckCircle2}
              fullWidth
              onClick={handleDemoLogin}
            >
              Sign In as Demo Student (Instant)
            </Button>

            <p
              style={{
                marginTop: '24px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
