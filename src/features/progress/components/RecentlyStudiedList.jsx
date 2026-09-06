import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

export default function RecentlyStudiedList({ items = [], courseId = null }) {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  const getMasteryBadgeColor = (mastery) => {
    if (mastery >= 80) return '#10b981';
    if (mastery >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card glass>
      <CardHeader style={{ padding: '20px 24px 14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--primary)" />
          <CardTitle>Recently Studied Topics</CardTitle>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '0 24px 20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => {
            const targetCourseId = item.courseId || courseId;
            const badgeColor = getMasteryBadgeColor(item.mastery || 50);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (targetCourseId) {
                    navigate(`/courses/${targetCourseId}/tutor`);
                  }
                }}
                className="card-hover-scale"
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: targetCourseId ? 'pointer' : 'default',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    {item.courseCode && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--primary)',
                        }}
                      >
                        {item.courseCode}
                      </span>
                    )}
                    <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Studied {item.lastStudiedAt} • {item.timeSpent} ({item.activityType || 'Review'})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.mastery !== undefined && (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: badgeColor,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: `${badgeColor}18`,
                        border: `1px solid ${badgeColor}30`,
                      }}
                    >
                      {item.mastery}% Mastery
                    </span>
                  )}
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
