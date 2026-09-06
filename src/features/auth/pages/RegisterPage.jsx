import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import RegisterForm from '../components/RegisterForm';
import Card, { CardContent } from '../../../components/ui/Card';

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(168, 85, 247, 0.15), transparent 45%)',
      }}
      className="animate-fade-in"
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header Branding */}
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
              color: '#ffffff',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-lg), 0 0 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={24} />
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Create Student Account
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Start your personalized, RAG-grounded learning experience
          </p>
        </div>

        {/* Form Container */}
        <Card glass style={{ border: '1px solid var(--border-medium)' }}>
          <CardContent style={{ padding: '28px' }}>
            <RegisterForm />

            <p
              style={{
                marginTop: '24px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
