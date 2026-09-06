import express from 'express';
import { COURSES } from './courses.js';

const router = express.Router();

const generateProgressTimeline = (baseMastery = 70) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, idx) => ({
    day,
    date: `2026-08-${25 + idx}`,
    mastery: Math.min(100, Math.max(30, baseMastery - 12 + idx * 3 + (idx % 2 === 0 ? 4 : -2))),
    quizScore: Math.min(100, Math.max(40, baseMastery - 8 + idx * 4 - (idx % 3 === 0 ? 5 : 0))),
    studyMinutes: [45, 60, 30, 90, 45, 120, 60][idx],
  }));
};

/**
 * GET /api/v1/progress
 * Global learning progress across all courses
 */
router.get('/', (req, res) => {
  const coursesList = Array.isArray(COURSES) ? COURSES : [];

  const allTopics = coursesList.flatMap((c) =>
    (c.topics || []).map((t) => ({ ...t, courseId: c.id, courseCode: c.code, courseName: c.name }))
  );

  const weakTopics = allTopics
    .filter((t) => t.status === 'weak' || (t.mastery && t.mastery < 60))
    .map((t) => ({
      id: t.id,
      courseId: t.courseId,
      courseCode: t.courseCode,
      topic: t.title,
      mastery: t.mastery || 42,
      trend: '-3% recently',
      suggestedAction: 'Take 5-minute targeted AI drill',
      actionTarget: `/courses/${t.courseId}/quizzes`,
    }));

  const recentlyStudied = [
    {
      id: 'rec-1',
      courseId: 'course-cs301',
      courseCode: 'CS 301',
      title: 'Consensus & Raft Invariants',
      lastStudiedAt: 'Today, 2:30 PM',
      timeSpent: '45 mins',
      activityType: 'Quiz',
      mastery: 65,
    },
    {
      id: 'rec-2',
      courseId: 'course-cs420',
      courseCode: 'CS 420',
      title: 'Banker’s Algorithm & Deadlock',
      lastStudiedAt: 'Yesterday, 5:15 PM',
      timeSpent: '30 mins',
      activityType: 'AI Tutor',
      mastery: 35,
    },
    {
      id: 'rec-3',
      courseId: 'course-ai502',
      courseCode: 'AI 502',
      title: 'Self-Attention & Multi-Head Projections',
      lastStudiedAt: '3 days ago',
      timeSpent: '50 mins',
      activityType: 'Study',
      mastery: 92,
    },
  ];

  const studyActivity = [
    {
      id: 'act-g1',
      type: 'Quiz',
      courseCode: 'CS 301',
      title: 'Raft Consensus Practice Quiz completed',
      timestamp: 'Today, 2:30 PM',
      durationMinutes: 20,
      score: 80,
    },
    {
      id: 'act-g2',
      type: 'AI Tutor',
      courseCode: 'CS 420',
      title: 'ELI10 session on Deadlock conditions',
      timestamp: 'Yesterday, 5:15 PM',
      durationMinutes: 35,
      score: null,
    },
    {
      id: 'act-g3',
      type: 'Quiz',
      courseCode: 'CS 420',
      title: 'Deadlock Detection Quiz attempted',
      timestamp: '2 days ago',
      durationMinutes: 18,
      score: 45,
    },
    {
      id: 'act-g4',
      type: 'Study Plan',
      courseCode: 'AI 502',
      title: 'Completed Diffusion Model notes review',
      timestamp: '4 days ago',
      durationMinutes: 45,
      score: null,
    },
  ];

  const avgMastery = coursesList.length
    ? Math.round(coursesList.reduce((acc, c) => acc + (c.progress || 0), 0) / coursesList.length)
    : 78;

  res.json({
    overallMastery: avgMastery,
    questionsAttempted: 240,
    correctAnswers: 192,
    quizAccuracyPercentage: 80,
    quizzesCompletedCount: 28,
    studyStreakDays: 14,
    totalStudyHours: 46.2,
    topicsMastery: allTopics,
    weakTopics,
    recentlyStudiedTopics: recentlyStudied,
    studyActivity,
    progressOverTime: generateProgressTimeline(avgMastery),
    quizHistory: [
      {
        id: 'quiz-01',
        title: 'CS 301: Raft Consensus Practice',
        score: 80,
        questionsCount: 5,
        difficulty: 'Medium',
        completedAt: 'Yesterday',
      },
      {
        id: 'quiz-02',
        title: 'CS 420: Deadlock Detection Quiz',
        score: 45,
        questionsCount: 4,
        difficulty: 'Hard',
        completedAt: '2 days ago',
      },
      {
        id: 'quiz-03',
        title: 'AI 502: Self-Attention Check',
        score: 92,
        questionsCount: 3,
        difficulty: 'Medium',
        completedAt: '4 days ago',
      },
    ],
  });
});

export default router;
