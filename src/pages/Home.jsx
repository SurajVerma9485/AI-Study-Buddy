import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  CalendarCheck,
  TrendingUp,
  FileCheck,
  ArrowRight,
  GraduationCap,
  Brain,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Home() {
  const navigate = useNavigate();
  const { user, loginAsDemoStudent } = useAuth();

  const features = [
    {
      icon: Sparkles,
      color: '#8b5cf6',
      title: 'AI Tutor & RAG Citations',
      desc: 'Ground every explanation directly into your uploaded syllabus and lecture notes with exact citations.',
      badge: '5 Tutor Modes',
    },
    {
      icon: Brain,
      color: '#06b6d4',
      title: 'Explain Like I’m 10',
      desc: 'Break down notoriously complex distributed systems, kernel logic, and neural nets into simple analogies.',
      badge: 'ELI10 Mode',
    },
    {
      icon: HelpCircle,
      color: '#10b981',
      title: 'Adaptive Practice Quizzes',
      desc: 'Auto-generate MCQs, True/False, and short-answer evaluations with instant explanations and topic tagging.',
      badge: 'Self Evaluation',
    },
    {
      icon: CalendarCheck,
      color: '#f59e0b',
      title: 'Personalized Revision Planner',
      desc: 'Reverse-engineer study timelines from your exam date, focusing heavily on proven weak topics.',
      badge: 'Gap Targeting',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }} className="animate-fade-in">
      {/* Hero Section */}
      <div
        style={{
          position: 'relative',
          padding: '48px 36px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(17, 24, 39, 0.7) 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <Badge variant="primary" size="md" dot style={{ marginBottom: '16px' }}>
            Personalized Learning Agent • RAG-Powered
          </Badge>

          <h1
            style={{
              fontSize: '2.75rem',
              lineHeight: 1.15,
              marginBottom: '16px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
            }}
          >
            Master your syllabus with an{' '}
            <span className="gradient-text">intelligent AI companion</span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            Upload course notes, ask questions with grounded citations, practice AI-generated quizzes, and follow continuous adaptive revision plans tailored to your exam schedule.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>

            <Button
              variant="secondary"
              size="lg"
              icon={Sparkles}
              onClick={() => navigate('/tutor')}
            >
              Launch AI Tutor
            </Button>

            {!user && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => loginAsDemoStudent()}
              >
                Try Demo Student
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Core Feedback Loop Showcase */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
            The Continuous Learning Feedback Loop
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Engineered as a closed-loop mastery platform, not just a generic chatbot.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} hoverable>
                <CardContent style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: `${feat.color}20`,
                        color: feat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <Badge variant="secondary" size="sm">
                      {feat.badge}
                    </Badge>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {feat.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
