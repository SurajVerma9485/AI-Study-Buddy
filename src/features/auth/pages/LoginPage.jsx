import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import Card, { CardContent } from '../../../components/ui/Card';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle at 50% 25%, rgba(99, 102, 241, 0.18), transparent 50%)',
      }}
      className="animate-fade-in"
    >
      <div style={{ width: '100%', maxWidth: '450px' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'var(--primary-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4), var(--shadow-lg)',
            }}
          >
            <Sparkles size={26} />
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Welcome to <span className="gradient-text">StudyBuddy</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: 0 }}>
            Sign in to access your personalized learning agent
          </p>
        </div>

        {/* Form Container */}
        <Card
          glass
          style={{
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45), 0 0 25px rgba(99, 102, 241, 0.12)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <CardContent style={{ padding: '32px 30px' }}>
            <LoginForm />

            <p
              style={{
                marginTop: '26px',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              Don't have an account?{' '}
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
