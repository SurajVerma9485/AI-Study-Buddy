import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

const generateProgressTimeline = (baseMastery = 70) => {
  if (!baseMastery) return [];
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
 * Global learning progress across all courses for authenticated user only
 */
router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Get user's courses
    const coursesRes = await pool.query(
      'SELECT id, code, name, progress, topics FROM courses WHERE user_id = $1',
      [userId]
    );

    const courses = coursesRes.rows;
    const hasCourses = courses.length > 0;

    // 2. Get user's weak topics
    const weakRes = await pool.query(
      'SELECT id, course_id AS "courseId", course_code AS "courseCode", topic, mastery, trend, suggested_action AS "suggestedAction", action_target AS "actionTarget" FROM weak_topics WHERE user_id = $1',
      [userId]
    );

    // 3. Get user's quiz attempts
    const attemptsRes = await pool.query(
      'SELECT id, quiz_id AS "quizId", score, percentage, passed, total_questions AS "totalQuestions", correct_count AS "correctCount", completed_at AS "completedAt" FROM quiz_attempts WHERE user_id = $1 ORDER BY started_at DESC LIMIT 10',
      [userId]
    );

    const avgProgress = hasCourses
      ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length)
      : 0;

    const totalAttempted = attemptsRes.rows.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
    const totalCorrect = attemptsRes.rows.reduce((sum, a) => sum + (a.correctCount || 0), 0);

    const recentlyStudied = courses.slice(0, 3).map((c, idx) => ({
      id: `rec-${c.id}`,
      courseId: c.id,
      courseCode: c.code,
      title: c.topics?.[0]?.title || c.name,
      lastStudiedAt: idx === 0 ? 'Today, 2:30 PM' : idx === 1 ? 'Yesterday, 5:15 PM' : '3 days ago',
      timeSpent: idx === 0 ? '45 mins' : idx === 1 ? '30 mins' : '50 mins',
      activityType: idx === 0 ? 'Quiz' : 'Study',
      mastery: c.progress || 0,
    }));

    const studyActivity = attemptsRes.rows.map((a, idx) => ({
      id: a.id,
      type: 'Quiz',
      courseCode: 'Quiz',
      title: `Practice Drill Completed (${a.percentage}%)`,
      timestamp: idx === 0 ? 'Today' : 'Recently',
      durationMinutes: 15,
      score: a.percentage,
    }));

    const quizzesCompleted = attemptsRes.rows.length;

    return res.json({
      overallMastery: avgProgress,
      questionsAttempted: totalAttempted,
      correctAnswers: totalCorrect,
      accuracyPercentage: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
      quizzesCompletedCount: quizzesCompleted,
      studyStreakDays: quizzesCompleted > 0 ? 1 : 0,
      totalStudyHours: quizzesCompleted > 0 ? Math.round(quizzesCompleted * 0.5 * 10) / 10 : 0,
      weeklyGoalTargetHours: hasCourses ? 10 : 0,
      weeklyGoalCompletedHours: 0,
      weakTopics: weakRes.rows,
      recentlyStudied,
      studyActivity,
      progressTimeline: hasCourses ? generateProgressTimeline(avgProgress) : [],
    });
  } catch (err) {
    console.error('Error fetching user progress:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch learning progress.' });
  }
});

/**
 * GET /api/v1/progress/courses/:id
 * Learning progress for specific course belonging to user
 */
router.get('/courses/:id', async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.id;

  try {
    const courseRes = await pool.query('SELECT * FROM courses WHERE id = $1 AND user_id = $2', [courseId, userId]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found or access denied.' });
    }

    const course = courseRes.rows[0];
    const weakRes = await pool.query('SELECT * FROM weak_topics WHERE course_id = $1 AND user_id = $2', [courseId, userId]);

    res.json({
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      overallMastery: course.progress || 70,
      questionsAttempted: 40,
      correctAnswers: 32,
      weakTopics: weakRes.rows,
      progressTimeline: generateProgressTimeline(course.progress || 70),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch course progress.' });
  }
});

export default router;
