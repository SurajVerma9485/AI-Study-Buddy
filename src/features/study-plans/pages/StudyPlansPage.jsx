import React, { useState, useEffect } from 'react';
import studyPlanService from '../services/studyPlanService';
import DayByDayPlanCard from '../components/DayByDayPlanCard';
import CreatePlanModal from '../components/CreatePlanModal';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/ui/Button';
import {
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

export default function StudyPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studyPlanService.getStudyPlans();
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to load study plans', err);
      setError('Unable to load study plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handlePlanCreated = (newPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    // Stay on StudyPlansPage or navigate to detail page
  };

  if (loading) {
    return <Loading message="Loading personalized revision schedules..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Study Plans"
        message={error}
        onRetry={loadPlans}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Personalized Study Plans
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            Adaptive revision timelines synthesized by Grok AI based on your Class, Subject, Chapter & available daily study time
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Sparkles}
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
          }}
        >
          Generate New AI Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Active Study Plans"
          description="Create your first AI-driven study schedule to get personalized daily tasks and exam milestones."
          actionText="Create Study Plan"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        /* Featured Grok AI Study Plan Roadmap */
        plans[0] && (
          <div>
            <DayByDayPlanCard plan={plans[0]} />
          </div>
        )
      )}

      {/* Create Plan Modal */}
      {isCreateModalOpen && (
        <CreatePlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPlanCreated={handlePlanCreated}
        />
      )}
    </div>
  );
}
