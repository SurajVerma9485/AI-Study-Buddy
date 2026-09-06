import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { MOCK_STUDY_PLAN_TASKS } from '../services/mockData';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

export default function StudyPlans() {
  const { courses } = useCourses();
  const [tasks, setTasks] = useState(MOCK_STUDY_PLAN_TASKS);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleToggleComplete = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsRegenerating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>Personalized Revision Planner</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            Adaptive study calendar synthesized by the Revision Agent from your exam dates & weak topics
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Sparkles}
          loading={isRegenerating}
          onClick={handleRegenerate}
        >
          Regenerate AI Schedule
        </Button>
      </div>

      {/* Inputs Banner: Daily Study Time & Exam Horizon */}
      <Card glass>
        <CardContent style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Study Time</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <input
                    type="number"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    min={15}
                    max={240}
                    style={{
                      width: '64px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Minutes / Day</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={20} color="#f59e0b" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Exam Horizon</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  CS 301 (October 15, 2026)
                </div>
              </div>
            </div>
          </div>

          <Badge variant="primary" size="md">
            Weak-Topic Priority Algorithm Active
          </Badge>
        </CardContent>
      </Card>

      {/* Task Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Priority Daily Tasks</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => {
            const isDone = task.status === 'completed';

            return (
              <Card key={task.id} glass>
                <CardContent style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isDone ? 'var(--success)' : 'var(--text-muted)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CheckCircle2 size={24} />
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>
                          {task.courseCode}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', margin: 0 }}>
                          {task.topic}
                        </h3>
                        <Badge variant={task.priority === 'high' ? 'danger' : 'warning'} size="sm">
                          {task.priority} priority
                        </Badge>
                      </div>

                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {task.activity} • <span style={{ color: '#f59e0b' }}>{task.reason}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Clock size={16} />
                      <span>{task.duration}</span>
                    </div>

                    <Badge variant="outline" size="sm">
                      {task.scheduledFor}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
