import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication on all study plan routes
router.use(authenticateToken);

// Fallback in-memory store isolated per userId
const inMemoryPlansByUser = new Map();

/**
 * Helper to fetch study plans for user
 */
async function getUserStudyPlans(userId) {
  try {
    const res = await pool.query(
      `SELECT id, user_id AS "userId", course_id AS "courseId", course_code AS "courseCode",
              course_name AS "courseName", exam_date AS "examDate", daily_study_minutes AS "dailyStudyMinutes",
              daily_study_minutes AS "dailyMinutes", preferred_days AS "preferredDays", weak_topics AS "weakTopics",
              title, overall_progress AS "overallProgress", tasks, day_schedule AS "daySchedule",
              class_level AS "classLevel", subject, chapter, days, daily_study_time AS "dailyStudyTime",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM study_plans WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  } catch (err) {
    console.warn(`Study plans DB query error for user ${userId}:`, err.message);
    return inMemoryPlansByUser.get(userId) || [];
  }
}

/**
 * GET /api/v1/study-plans
 * Returns only the authenticated user's study plans
 */
router.get('/', async (req, res) => {
  try {
    const plans = await getUserStudyPlans(req.user.id);
    res.json(plans);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch study plans.' });
  }
});

/**
 * GET /api/v1/study-plans/:id
 * Returns single study plan belonging to authenticated user
 */
router.get('/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const resPlan = await pool.query(
      `SELECT id, user_id AS "userId", course_id AS "courseId", course_code AS "courseCode",
              course_name AS "courseName", exam_date AS "examDate", daily_study_minutes AS "dailyStudyMinutes",
              daily_study_minutes AS "dailyMinutes", preferred_days AS "preferredDays", weak_topics AS "weakTopics",
              title, overall_progress AS "overallProgress", tasks, day_schedule AS "daySchedule",
              class_level AS "classLevel", subject, chapter, days, daily_study_time AS "dailyStudyTime",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM study_plans WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );

    if (resPlan.rows.length > 0) {
      return res.json(resPlan.rows[0]);
    }

    const memList = inMemoryPlansByUser.get(userId) || [];
    const found = memList.find((p) => p.id === req.params.id);
    if (found) return res.json(found);

    return res.status(404).json({ success: false, message: 'Study plan not found or access denied.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch study plan.' });
  }
});

/**
 * POST /api/v1/study-plans
 * Creates study plan for authenticated user
 */
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const {
    id,
    courseId,
    courseCode,
    courseName,
    examDate,
    dailyStudyMinutes,
    dailyMinutes,
    preferredDays,
    weakTopics,
    title,
    tasks,
    daySchedule,
    classLevel,
    subject,
    chapter,
    days,
    dailyStudyTime,
    overallProgress,
  } = req.body;

  const planId = id || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const finalTasks = Array.isArray(tasks) ? tasks : [];
  const finalDaySchedule = Array.isArray(daySchedule) ? daySchedule : [];
  const finalDays = days ? parseInt(days, 10) : 5;
  const finalMinutes = dailyStudyMinutes || dailyMinutes || 120;
  const finalClassLevel = classLevel || 'Class 10';
  const finalSubject = subject || 'Mathematics';
  const finalChapter = chapter || 'Chapter 1 - Real Numbers';
  const finalStudyTime = dailyStudyTime || `${Math.round(finalMinutes / 60)} hours/day`;
  const finalTitle = title || `${finalClassLevel} ${finalSubject}: ${finalChapter} (${finalDays} Days)`;

  try {
    const result = await pool.query(
      `INSERT INTO study_plans (
        id, user_id, course_id, course_code, course_name, exam_date,
        daily_study_minutes, preferred_days, weak_topics, title, overall_progress, tasks,
        day_schedule, class_level, subject, chapter, days, daily_study_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        tasks = EXCLUDED.tasks,
        day_schedule = EXCLUDED.day_schedule,
        class_level = EXCLUDED.class_level,
        subject = EXCLUDED.subject,
        chapter = EXCLUDED.chapter,
        days = EXCLUDED.days,
        daily_study_time = EXCLUDED.daily_study_time,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id AS "userId", course_id AS "courseId", course_code AS "courseCode",
                course_name AS "courseName", exam_date AS "examDate", daily_study_minutes AS "dailyStudyMinutes",
                daily_study_minutes AS "dailyMinutes", preferred_days AS "preferredDays", weak_topics AS "weakTopics",
                title, overall_progress AS "overallProgress", tasks, day_schedule AS "daySchedule",
                class_level AS "classLevel", subject, chapter, days, daily_study_time AS "dailyStudyTime",
                created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        planId,
        userId,
        courseId || 'general',
        courseCode || 'GEN',
        courseName || `${finalClassLevel} ${finalSubject}`,
        examDate || new Date(Date.now() + finalDays * 86400000).toISOString().split('T')[0],
        finalMinutes,
        JSON.stringify(preferredDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        JSON.stringify(weakTopics || []),
        finalTitle,
        overallProgress || 0,
        JSON.stringify(finalTasks),
        JSON.stringify(finalDaySchedule),
        finalClassLevel,
        finalSubject,
        finalChapter,
        finalDays,
        finalStudyTime,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.warn('DB study plan insert fallback to memory:', err.message);
    const newPlan = {
      id: planId,
      userId,
      courseId: courseId || 'general',
      courseCode: courseCode || 'GEN',
      courseName: courseName || `${finalClassLevel} ${finalSubject}`,
      examDate: examDate || new Date(Date.now() + finalDays * 86400000).toISOString().split('T')[0],
      dailyStudyMinutes: finalMinutes,
      dailyMinutes: finalMinutes,
      preferredDays: preferredDays || [],
      weakTopics: weakTopics || [],
      title: finalTitle,
      overallProgress: overallProgress || 0,
      tasks: finalTasks,
      daySchedule: finalDaySchedule,
      classLevel: finalClassLevel,
      subject: finalSubject,
      chapter: finalChapter,
      days: finalDays,
      dailyStudyTime: finalStudyTime,
      createdAt: new Date().toISOString(),
    };
    const list = inMemoryPlansByUser.get(userId) || [];
    inMemoryPlansByUser.set(userId, [newPlan, ...list]);
    return res.status(201).json(newPlan);
  }
});

/**
 * PATCH /api/v1/study-plans/:planId/tasks/:taskId
 * Toggle task status for authenticated user
 */
router.patch('/:planId/tasks/:taskId', async (req, res) => {
  const userId = req.user.id;
  const { planId, taskId } = req.params;

  try {
    const planRes = await pool.query(
      'SELECT id, tasks FROM study_plans WHERE id = $1 AND user_id = $2',
      [planId, userId]
    );

    if (planRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Study plan not found or access denied.' });
    }

    const tasks = planRes.rows[0].tasks || [];
    const taskIdx = tasks.findIndex((t) => t.id === taskId);
    if (taskIdx === -1) {
      return res.status(404).json({ success: false, message: 'Task not found in plan.' });
    }

    const currentStatus = tasks[taskIdx].status;
    tasks[taskIdx].status = currentStatus === 'completed' ? 'pending' : 'completed';

    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    const updated = await pool.query(
      `UPDATE study_plans SET tasks = $1, overall_progress = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id AS "userId", course_id AS "courseId", course_code AS "courseCode",
                 course_name AS "courseName", exam_date AS "examDate", daily_study_minutes AS "dailyStudyMinutes",
                 daily_study_minutes AS "dailyMinutes", preferred_days AS "preferredDays", weak_topics AS "weakTopics",
                 title, overall_progress AS "overallProgress", tasks, day_schedule AS "daySchedule",
                 class_level AS "classLevel", subject, chapter, days, daily_study_time AS "dailyStudyTime",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
      [JSON.stringify(tasks), progress, planId, userId]
    );

    return res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
});

/**
 * DELETE /api/v1/study-plans/:id
 */
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query('DELETE FROM study_plans WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Study plan not found or access denied.' });
    }
    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete study plan.' });
  }
});

export default router;
