import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import studyPlanService from '../services/studyPlanService';
import DayByDayPlanCard from '../components/DayByDayPlanCard';
import PlanSummaryHeader from '../components/PlanSummaryHeader';
import ScheduleTimeline from '../components/ScheduleTimeline';
import TaskCard from '../components/TaskCard';
import CreatePlanModal from '../components/CreatePlanModal';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import {
  ArrowLeft,
  CalendarCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export default function StudyPlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch plan
  const loadPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studyPlanService.getStudyPlanById(planId);
      if (!data) {
        throw new Error('Study plan not found');
      }
      setPlan(data);
    } catch (err) {
      console.error('Failed to load study plan', err);
      setError('Unable to load the requested study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [planId]);

  // Handle task status toggle
  const handleToggleTaskStatus = async (taskId) => {
    if (!plan) return;
    try {
      // Optimistic update
      setPlan((prev) => {
        if (!prev) return prev;
        const updatedTasks = prev.tasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
            };
          }
          return t;
        });
        const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
        const progress = Math.round((completedCount / updatedTasks.length) * 100);
        return {
          ...prev,
          tasks: updatedTasks,
          overallProgress: progress,
        };
      });

      // Call service
      await studyPlanService.toggleTaskStatus(plan.id, taskId);
    } catch (err) {
      console.error('Failed to toggle task status', err);
      // Revert if failed
      loadPlan();
    }
  };

  const handlePlanCreated = (newPlan) => {
    navigate(`/study-plans/${newPlan.id}`);
  };

  if (loading) {
    return <Loading message="Synthesizing personalized study timeline..." />;
  }

  if (error || !plan) {
    return (
      <ErrorState
        title="Study Plan Unavailable"
        message={error || 'Could not locate the requested revision plan.'}
        onRetry={loadPlan}
      />
    );
  }

  // Filter today's tasks
  const todayTasks = plan.tasks?.filter((t) => t.scheduledFor === 'Today') || [];
  const upcomingTasks = plan.tasks?.filter((t) => t.scheduledFor !== 'Today') || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Breadcrumb Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          to="/study-plans"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.15s ease',
          }}
          className="hover-underline"
        >
          <ArrowLeft size={16} />
          <span>All Study Plans</span>
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Another Plan
          </Button>
        </div>
      </div>

      {/* 1. & 2. Exam Countdown & Daily Study Time Header */}
      <PlanSummaryHeader
        plan={plan}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Day by Day Plan Roadmap */}
      <DayByDayPlanCard plan={plan} />

      {/* 3. Today's Tasks Section */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Today’s Focus</h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {todayTasks.filter((t) => t.status === 'completed').length}/{todayTasks.length} Completed
            </span>
          </div>

          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Target: {plan.dailyStudyMinutes || 60} mins daily commitment
          </span>
        </div>

        {todayTasks.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {todayTasks.map((task) => (
              <TaskCard key={task.id} task={task} onToggleStatus={handleToggleTaskStatus} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No specific tasks scheduled for today. Great job staying ahead of your syllabus!
            </CardContent>
          </Card>
        )}
      </div>

      {/* 4. Upcoming Tasks & Schedule Timeline */}
      <Card>
        <CardContent style={{ padding: '24px 28px' }}>
          <ScheduleTimeline
            tasks={plan.tasks || []}
            onToggleTaskStatus={handleToggleTaskStatus}
            title="Complete Adaptive Timetable"
          />
        </CardContent>
      </Card>

      {/* Create / Regenerate Modal */}
      {isCreateModalOpen && (
        <CreatePlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPlanCreated={handlePlanCreated}
          initialCourseId={plan.courseId}
        />
      )}
    </div>
  );
}
