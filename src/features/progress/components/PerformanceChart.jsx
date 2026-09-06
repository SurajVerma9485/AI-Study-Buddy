import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { TrendingUp, Calendar, Info } from 'lucide-react';

export default function PerformanceChart({ data = [], title = 'Progress Over Time' }) {
  const [metric, setMetric] = useState('mastery'); // 'mastery' | 'quizScore' | 'studyMinutes'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <Card glass>
        <CardContent style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No historical progress data recorded yet. Complete quizzes and study sessions to build your trend line.
        </CardContent>
      </Card>
    );
  }

  // Calculate SVG dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const getMetricValue = (item) => {
    if (metric === 'mastery') return item.mastery || 0;
    if (metric === 'quizScore') return item.quizScore || 0;
    return item.studyMinutes || 0;
  };

  const maxValue = metric === 'studyMinutes'
    ? Math.max(120, ...data.map((d) => d.studyMinutes || 0))
    : 100;

  // Build points for SVG path
  const points = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(1, data.length - 1)) * chartWidth;
    const val = getMetricValue(item);
    const y = paddingY + chartHeight - (val / maxValue) * chartHeight;
    return { x, y, item, val };
  });

  // Construct SVG path string (cubic bezier smoothing)
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${point.y} ${point.x},${point.y}`;
  }, '');

  // Area path closing at the bottom
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${paddingY + chartHeight} L ${points[0].x},${paddingY + chartHeight} Z`
    : '';

  const getMetricColor = () => {
    if (metric === 'mastery') return '#6366f1';
    if (metric === 'quizScore') return '#10b981';
    return '#f59e0b';
  };

  const activeColor = getMetricColor();

  return (
    <Card glass>
      <CardHeader style={{ padding: '20px 24px 12px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color={activeColor} />
            <CardTitle>{title}</CardTitle>
          </div>

          {/* Metric Selector Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-elevated)',
              padding: '3px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setMetric('mastery')}
              style={{
                background: metric === 'mastery' ? 'var(--primary)' : 'transparent',
                color: metric === 'mastery' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Mastery Trend
            </button>
            <button
              onClick={() => setMetric('quizScore')}
              style={{
                background: metric === 'quizScore' ? '#10b981' : 'transparent',
                color: metric === 'quizScore' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Quiz Scores
            </button>
            <button
              onClick={() => setMetric('studyMinutes')}
              style={{
                background: metric === 'studyMinutes' ? '#f59e0b' : 'transparent',
                color: metric === 'studyMinutes' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Study Mins
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '0 24px 20px 24px' }}>
        {/* SVG Container */}
        <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', height: 'auto', minWidth: '420px', display: 'block' }}
          >
            <defs>
              <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeColor} stopOpacity="0.35" />
                <stop offset="100%" stopColor={activeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingY + chartHeight * (1 - ratio);
              const gridLabel = metric === 'studyMinutes'
                ? `${Math.round(maxValue * ratio)}m`
                : `${Math.round(maxValue * ratio)}%`;

              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={paddingX + chartWidth}
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    fontSize="10"
                    fill="var(--text-muted)"
                    textAnchor="end"
                  >
                    {gridLabel}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill={`url(#grad-${metric})`}
              />
            )}

            {/* Smooth Stroke Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={activeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((pt, idx) => (
              <g key={idx}>
                {/* Vertical guideline on hover */}
                {hoveredPoint?.idx === idx && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={paddingY + chartHeight}
                    stroke={activeColor}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.idx === idx ? 6 : 4}
                  fill="var(--bg-secondary)"
                  stroke={activeColor}
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={() => setHoveredPoint({ ...pt, idx })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Date Label on Bottom */}
                <text
                  x={pt.x}
                  y={paddingY + chartHeight + 16}
                  fontSize="10"
                  fontWeight="600"
                  fill={hoveredPoint?.idx === idx ? 'var(--text-primary)' : 'var(--text-muted)'}
                  textAnchor="middle"
                >
                  {pt.item.day || pt.item.date?.slice(5)}
                </text>
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                transform: 'translate(-50%, -120%)',
                background: 'var(--bg-elevated)',
                border: `1px solid ${activeColor}`,
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
                pointerEvents: 'none',
                zIndex: 10,
                whiteSpace: 'nowrap',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              <div>{hoveredPoint.item.day} ({hoveredPoint.item.date})</div>
              <div style={{ color: activeColor, marginTop: '2px' }}>
                {metric === 'studyMinutes' ? `${hoveredPoint.val} mins study` : `${hoveredPoint.val}% ${metric}`}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
