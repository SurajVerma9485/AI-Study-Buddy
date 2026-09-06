import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { useAuth } from '../authContext';
import Button from '../../../components/ui/Button';
import Card, { CardContent } from '../../../components/ui/Card';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login');
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
      <Card glass style={{ maxWidth: '480px', width: '100%', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <CardContent style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            Access Denied
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '24px' }}>
            You do not have permission to view this resource. Current role:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{user?.role || 'Guest'}</strong>.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="md"
              icon={Home}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={LogOut}
              onClick={handleSwitchAccount}
            >
              Switch Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
