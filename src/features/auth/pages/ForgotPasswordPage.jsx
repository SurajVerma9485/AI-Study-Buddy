import React from 'react';
import { KeyRound } from 'lucide-react';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import Card, { CardContent } from '../../../components/ui/Card';

export default function ForgotPasswordPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 45%)',
      }}
      className="animate-fade-in"
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '14px',
            }}
          >
            <KeyRound size={24} />
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            Reset Password
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Enter your registered email address to receive reset instructions
          </p>
        </div>

        <Card glass style={{ border: '1px solid var(--border-medium)' }}>
          <CardContent style={{ padding: '28px' }}>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
