import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import studyPlanService, { calculateDaysRemaining } from '../services/studyPlanService';
import PlanSummaryHeader from '../components/PlanSummaryHeader';
import DayByDayPlanCard from '../components/DayByDayPlanCard';
import TaskCard from '../components/TaskCard';
import CreatePlanModal from '../components/CreatePlanModal';
import Loading from '../../../components/common/Loading';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ProgressBar from '../../../components/ui/ProgressBar';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  Plus,
} from 'lucide-react';

export default function StudyPlansPage() {
  const navigate = useNavigate();
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

  const handleToggleTaskStatus = async (planId, taskId) => {
    try {
      setPlans((prevPlans) =>
        prevPlans.map((plan) => {
          if (plan.id !== planId) return plan;
          const updatedTasks = plan.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
              : t
          );
          const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
          return {
            ...plan,
            tasks: updatedTasks,
            overallProgress: Math.round((completedCount / updatedTasks.length) * 100),
          };
        })
      );

      await studyPlanService.toggleTaskStatus(planId, taskId);
    } catch (err) {
      console.error('Failed to update task status', err);
      loadPlans();
    }
  };

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

  // Aggregate today's tasks across all active plans
  const allTodayTasks = plans.flatMap((p) =>
    (p.tasks || [])
      .filter((t) => t.scheduledFor === 'Today')
      .map((t) => ({ ...t, planId: p.id, courseCode: p.courseCode }))
  );

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
        <>
          {/* Featured Grok AI Study Plan Roadmap */}
          {plans[0] && (
            <div>
              <DayByDayPlanCard plan={plans[0]} />
            </div>
          )}

          {/* Today's Tasks Cross-Course Section */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 8px var(--primary)',
                  }}
                />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Today’s High-Priority Tasks
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--primary)',
                  }}
                >
                  {allTodayTasks.filter((t) => t.status === 'completed').length}/{allTodayTasks.length} Done
                </span>
              </div>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Targeting critical gaps & upcoming milestones
              </span>
            </div>

            {allTodayTasks.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '14px',
                }}
              >
                {allTodayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={(tId) => handleToggleTaskStatus(task.planId, tId)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  All tasks completed for today. Relax or review upcoming modules ahead of schedule!
                </CardContent>
              </Card>
            )}
          </div>

          {/* Active Study Plans Grid */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Course Study Plans ({plans.length})
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px',
              }}
            >
              {plans.map((plan) => {
                const daysRemaining = calculateDaysRemaining(plan.examDate);
                const totalTasks = plan.tasks?.length || 0;
                const completedTasks = plan.tasks?.filter((t) => t.status === 'completed').length || 0;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <Card key={plan.id} glass className="card-hover-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                    <CardHeader style={{ padding: '20px 24px 14px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.725rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(99, 102, 241, 0.15)',
                                color: 'var(--primary)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                              }}
                            >
                              {plan.courseCode}
                            </span>
                            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                              {plan.courseName}
                            </span>
                          </div>

                          <CardTitle style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                            {plan.title || `${plan.courseCode} Plan`}
                          </CardTitle>
                        </div>

                        {/* Exam countdown badge */}
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: daysRemaining < 14 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: daysRemaining < 14 ? '#ef4444' : '#f59e0b',
                            border: daysRemaining < 14 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Calendar size={13} />
                          <span>{daysRemaining}d left</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent style={{ padding: '0 24px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                      {/* Meta Pills */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={14} color="var(--primary)" />
                          <span>{plan.dailyStudyMinutes || 60}m / day</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <BookOpen size={14} color="#10b981" />
                          <span>{plan.preferredDays?.length || 5} days / wk</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={14} color="#8b5cf6" />
                          <span>{completedTasks}/{totalTasks} tasks</span>
                        </div>
                      </div>

                      {/* Weak topics target focus */}
                      {plan.weakTopics && plan.weakTopics.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {plan.weakTopics.slice(0, 2).map((wt, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                              }}
                            >
                              {wt}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span>Plan Progress</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{progress}%</span>
                        </div>
                        <ProgressBar progress={progress} height="6px" variant={progress > 70 ? 'success' : 'primary'} />
                      </div>

                      {/* Action Button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => navigate(`/study-plans/${plan.id}`)}
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          View Schedule & Tasks
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
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
