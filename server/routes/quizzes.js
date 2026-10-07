import express from 'express';
import dotenv from 'dotenv';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

// Apply authentication middleware to all quiz routes
router.use(authenticateToken);

// In-memory fallback stores isolated per userId
const inMemoryQuizzesByUser = new Map();
const inMemoryAttemptsByUser = new Map();

function stripReasoning(text) {
  return (text || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

function extractJson(text) {
  const cleaned = stripReasoning(text);
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (m) { try { return JSON.parse(m[1]); } catch {} }
  const f = cleaned.indexOf('{'), l = cleaned.lastIndexOf('}');
  if (f !== -1 && l > f) { try { return JSON.parse(cleaned.slice(f, l + 1)); } catch {} }
  return null;
}

function buildFallbackQuiz({ courseId, topicId, difficulty, questionCount, type, courseName, topicName }) {
  const n = Math.max(1, Math.min(Number(questionCount) || 5, 20));
  const isTf = type === 'True/False' || type === 'TF' || type === 'true/false';

  const sampleQuestions = [
    {
      id: 'q-1',
      topicId: topicId || 'top-1',
      topicName: topicName || 'Core Concepts',
      type: isTf ? 'True/False' : 'MCQ',
      question: `Which fundamental principle is central to ${topicName || 'this topic'} in ${courseName || 'the course'}?`,
      options: isTf
        ? ['True', 'False']
        : [
            'Safety invariants and correctness guarantees',
            'Ad-hoc heuristic execution',
            'Unbounded asynchronous drift',
            'Ignoring consensus thresholds',
          ],
      correctAnswerIndex: 0,
      explanation: `Safety invariants and correctness guarantees are core to ${topicName || 'this module'}.`,
    },
    {
      id: 'q-2',
      topicId: topicId || 'top-1',
      topicName: topicName || 'Core Concepts',
      type: isTf ? 'True/False' : 'MCQ',
      question: `True or False: In ${courseName || 'this subject'}, system states can be verified using formal properties?`,
      options: ['True', 'False'],
      correctAnswerIndex: 0,
      explanation: 'System properties can be mathematically or experimentally proven.',
    },
  ];

  return {
    id: `quiz-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courseId,
    courseCode: 'CS 301',
    courseName: courseName || 'Computer Science',
    topicId,
    topicName: topicName || 'Core Concepts',
    title: `${topicName || 'Practice'} Mastery Drill`,
    difficulty: difficulty || 'Medium',
    type: isTf ? 'True/False' : type || 'MCQ',
    questionsCount: sampleQuestions.length,
    timeLimitMinutes: 10,
    score: null,
    completedAt: null,
    createdAt: new Date().toLocaleDateString(),
    questions: sampleQuestions,
  };
}

async function getUserQuizzes(userId, courseId = null) {
  try {
    let query = `
      SELECT id, user_id AS "userId", course_id AS "courseId", course_code AS "courseCode",
             course_name AS "courseName", topic_id AS "topicId", topic_name AS "topicName",
             title, difficulty, type, questions_count AS "questionsCount",
             time_limit_minutes AS "timeLimitMinutes", score, completed_at AS "completedAt",
             questions, created_at AS "createdAt"
      FROM quizzes WHERE user_id = $1
    `;
    const params = [userId];
    if (courseId) {
      query += ' AND course_id = $2';
      params.push(courseId);
    }
    query += ' ORDER BY created_at DESC';

    const res = await pool.query(query, params);
    return res.rows;
  } catch (err) {
    console.warn(`Quizzes DB query error for user ${userId}:`, err.message);
    const list = inMemoryQuizzesByUser.get(userId) || [];
    if (courseId) return list.filter((q) => q.courseId === courseId);
    return list;
  }
}

/**
 * GET /api/v1/quizzes
 * Get all quizzes belonging to authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const list = await getUserQuizzes(req.user.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes.' });
  }
});

/**
 * GET /api/v1/courses/:courseId/quizzes
 */
router.get('/courses/:courseId/quizzes', async (req, res) => {
  try {
    const list = await getUserQuizzes(req.user.id, req.params.courseId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch course quizzes.' });
  }
});

/**
 * GET /api/v1/quizzes/:id
 */
router.get('/:id', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, user_id AS "userId", course_id AS "courseId", course_code AS "courseCode",
              course_name AS "courseName", topic_id AS "topicId", topic_name AS "topicName",
              title, difficulty, type, questions_count AS "questionsCount",
              time_limit_minutes AS "timeLimitMinutes", score, completed_at AS "completedAt",
              questions, created_at AS "createdAt"
       FROM quizzes WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    const memList = inMemoryQuizzesByUser.get(userId) || [];
    const found = memList.find((q) => q.id === req.params.id);
    if (found) return res.json(found);

    return res.status(404).json({ success: false, message: 'Quiz not found or access denied.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz.' });
  }
});

/**
 * POST /api/v1/quizzes
 */
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const quizData = req.body;
  const quizId = quizData.id || `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    const result = await pool.query(
      `INSERT INTO quizzes (
        id, user_id, course_id, course_code, course_name, topic_id, topic_name,
        title, difficulty, type, questions_count, time_limit_minutes, score, questions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, user_id AS "userId", course_id AS "courseId", course_code AS "courseCode",
                course_name AS "courseName", topic_id AS "topicId", topic_name AS "topicName",
                title, difficulty, type, questions_count AS "questionsCount",
                time_limit_minutes AS "timeLimitMinutes", score, completed_at AS "completedAt",
                questions, created_at AS "createdAt"`,
      [
        quizId,
        userId,
        quizData.courseId || 'general',
        quizData.courseCode || 'CS',
        quizData.courseName || 'Course',
        quizData.topicId || 'top-1',
        quizData.topicName || 'Topic',
        quizData.title || 'Practice Quiz',
        quizData.difficulty || 'Medium',
        quizData.type || 'MCQ',
        quizData.questionsCount || (quizData.questions?.length || 5),
        quizData.timeLimitMinutes || 10,
        quizData.score || null,
        JSON.stringify(quizData.questions || []),
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.warn('DB quiz insert fallback to memory:', err.message);
    const newQuiz = { ...quizData, id: quizId, userId };
    const list = inMemoryQuizzesByUser.get(userId) || [];
    inMemoryQuizzesByUser.set(userId, [newQuiz, ...list]);
    return res.status(201).json(newQuiz);
  }
});

/**
 * POST /api/v1/quizzes/:id/attempts
 */
router.post('/:id/attempts', async (req, res) => {
  const userId = req.user.id;
  const quizId = req.params.id;

  try {
    const quizRes = await pool.query('SELECT * FROM quizzes WHERE id = $1 AND user_id = $2', [quizId, userId]);
    let quiz = quizRes.rows[0];

    if (!quiz) {
      const memList = inMemoryQuizzesByUser.get(userId) || [];
      quiz = memList.find((q) => q.id === quizId);
    }

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found or access denied.' });
    }

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await pool.query(
      `INSERT INTO quiz_attempts (id, user_id, quiz_id, quiz_data, started_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [attemptId, userId, quizId, JSON.stringify(quiz)]
    );

    res.status(201).json({
      attemptId,
      quizId,
      startedAt: Date.now(),
      answers: {},
    });
  } catch (err) {
    const attemptId = `att-${Date.now()}`;
    const userAttempts = inMemoryAttemptsByUser.get(userId) || new Map();
    userAttempts.set(attemptId, { quizId, answers: {}, startedAt: Date.now() });
    inMemoryAttemptsByUser.set(userId, userAttempts);

    res.status(201).json({
      attemptId,
      quizId,
      startedAt: Date.now(),
      answers: {},
    });
  }
});

/**
 * POST /api/v1/attempts/:id/answers
 */
router.post(['/:id/answers', '/attempts/:id/answers'], async (req, res) => {
  const userId = req.user.id;
  const attemptId = req.params.id;
  const { questionId, answer } = req.body;

  try {
    const attemptRes = await pool.query('SELECT answers FROM quiz_attempts WHERE id = $1 AND user_id = $2', [attemptId, userId]);
    if (attemptRes.rows.length > 0) {
      const currentAnswers = attemptRes.rows[0].answers || {};
      currentAnswers[questionId] = answer;
      await pool.query('UPDATE quiz_attempts SET answers = $1 WHERE id = $2 AND user_id = $3', [JSON.stringify(currentAnswers), attemptId, userId]);
    }
  } catch (err) {
    const userAttempts = inMemoryAttemptsByUser.get(userId);
    if (userAttempts && userAttempts.has(attemptId)) {
      userAttempts.get(attemptId).answers[questionId] = answer;
    }
  }

  res.json({ success: true });
});

/**
 * POST /api/v1/attempts/:id/complete
 */
router.post(['/:id/complete', '/attempts/:id/complete'], async (req, res) => {
  const userId = req.user.id;
  const attemptId = req.params.id;
  const { answers: submittedAnswers = {}, quiz: clientQuiz = null } = req.body;

  let quiz = clientQuiz;
  let savedAnswers = submittedAnswers;

  try {
    const attemptRes = await pool.query('SELECT * FROM quiz_attempts WHERE id = $1 AND user_id = $2', [attemptId, userId]);
    if (attemptRes.rows.length > 0) {
      savedAnswers = { ...(attemptRes.rows[0].answers || {}), ...submittedAnswers };
      if (!quiz) {
        quiz = attemptRes.rows[0].quiz_data;
      }
    }
  } catch (err) {
    const userAttempts = inMemoryAttemptsByUser.get(userId);
    if (userAttempts && userAttempts.has(attemptId)) {
      savedAnswers = { ...(userAttempts.get(attemptId).answers || {}), ...submittedAnswers };
    }
  }

  const questions = quiz?.questions || [];
  let correctCount = 0;
  const explanations = questions.map((q) => {
    const studentAns = savedAnswers[q.id];
    let isCorrect = false;

    const qType = (q.type || '').trim().toLowerCase();
    if (qType === 'mcq' || qType === 'true/false' || qType === 'tf' || qType === 't/f' || !q.type) {
      isCorrect = Number(studentAns) === Number(q.correctAnswerIndex);
    } else {
      isCorrect = typeof studentAns === 'string' && studentAns.trim().length > 2;
    }
    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      question: q.question,
      topicName: q.topicName || 'General',
      userAnswer: q.options ? (q.options[studentAns] ?? 'Unanswered') : (studentAns ?? 'Unanswered'),
      correctAnswer: q.options ? q.options[q.correctAnswerIndex] : (q.correctAnswerText || '—'),
      isCorrect,
      explanation: q.explanation || 'Refer to your course notes.',
    };
  });

  const total = Math.max(questions.length, 1);
  const percentage = Math.round((correctCount / total) * 100);

  // Update quiz score and attempt record in DB for this user
  try {
    if (quiz?.id) {
      await pool.query(
        `UPDATE quizzes SET score = GREATEST(COALESCE(score, 0), $1), completed_at = 'Just now'
         WHERE id = $2 AND user_id = $3`,
        [percentage, quiz.id, userId]
      );
    }

    await pool.query(
      `UPDATE quiz_attempts SET
        answers = $1, score = $2, percentage = $3, passed = $4,
        total_questions = $5, correct_count = $6, completed_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8`,
      [
        JSON.stringify(savedAnswers),
        correctCount,
        percentage,
        percentage >= 70,
        total,
        correctCount,
        attemptId,
        userId,
      ]
    );

    // If score < 75%, insert or update weak topic for this user
    if (percentage < 75 && quiz?.topicName) {
      await pool.query(
        `INSERT INTO weak_topics (
          id, user_id, course_id, course_code, topic, mastery, trend,
          source_quiz_title, source_quiz_id, suggested_action, action_target, last_diagnosed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Just now')
        ON CONFLICT (id) DO UPDATE SET mastery = $6, trend = $7, last_diagnosed = 'Just now'`,
        [
          `weak-${quiz.topicId || 'top'}-${userId.slice(0, 8)}`,
          userId,
          quiz.courseId || 'general',
          quiz.courseCode || 'GEN',
          quiz.topicName,
          percentage,
          `${percentage}% in recent quiz`,
          quiz.title || 'Practice Drill',
          quiz.id || 'quiz',
          'Review with AI Tutor in ELI10 mode',
          `/courses/${quiz.courseId || 'general'}/tutor`,
        ]
      );
    }
  } catch (dbErr) {
    console.warn('DB attempt completion update error:', dbErr.message);
  }

  const topicMap = {};
  explanations.forEach((exp) => {
    const tName = exp.topicName || quiz?.topicName || quiz?.title || 'Core Concepts';
    if (!topicMap[tName]) topicMap[tName] = { total: 0, correct: 0 };
    topicMap[tName].total++;
    if (exp.isCorrect) topicMap[tName].correct++;
  });

  const topicPerformance = Object.entries(topicMap).map(([topicName, stats]) => {
    const score = Math.round((stats.correct / stats.total) * 100);
    return {
      topicName,
      score,
      status: score >= 80 ? 'Mastered' : score >= 60 ? 'Improving' : 'Weak Area',
    };
  });

  const weakTopics = topicPerformance
    .filter((tp) => tp.score < 75)
    .map((tp) => tp.topicName);

  const result = {
    attemptId,
    quizId: quiz?.id || 'unknown',
    quizTitle: quiz?.title || 'Practice Quiz',
    courseId: quiz?.courseId || 'course-cs301',
    courseCode: quiz?.courseCode || 'CS 301',
    score: correctCount,
    totalQuestions: total,
    correctCount,
    incorrectCount: total - correctCount,
    percentage,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    topicPerformance,
    weakTopics,
    recommendedActivity: {
      title: weakTopics.length > 0 ? `Review ${weakTopics[0]} with AI Tutor` : 'Challenge: Next Topic',
      type: 'AI Tutor Session',
      reason: weakTopics.length > 0 ? 'Reinforce weak areas identified in this quiz' : 'Great score — push further!',
      route: `/courses/${quiz?.courseId || 'course-cs301'}/tutor`,
    },
    explanations,
  };

  res.json(result);
});

/**
 * Standalone Quiz Generator Handler (Groq LLM)
 */
export async function generateQuizHandler(req, res) {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const {
    courseId = 'course-cs301',
    topicId = 'top-1',
    difficulty = 'Medium',
    questionCount = 5,
    type = 'MCQ',
    courseName = 'Course',
    topicName = 'Core Concepts',
  } = req.body;

  const n = Math.max(1, Math.min(Number(questionCount) || 5, 20));
  const isTf = type === 'True/False' || type === 'TF' || type === 'true/false';

  if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
    try {
      const prompt = `You are an expert quiz generator. Generate exactly ${n} ${isTf ? 'True/False' : type} questions on "${topicName}" from "${courseName}". Difficulty: ${difficulty}. Output strictly valid JSON.`;
      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are an expert quiz generator. Output strictly valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = extractJson(data.choices?.[0]?.message?.content);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          const quiz = {
            id: `quiz-groq-${Date.now()}`,
            courseId,
            topicId,
            topicName,
            title: parsed.title || `${courseName}: ${topicName} Drill`,
            difficulty,
            type: isTf ? 'True/False' : type,
            questionsCount: parsed.questions.length,
            timeLimitMinutes: Math.max(5, parsed.questions.length * 2),
            createdAt: new Date().toLocaleDateString(),
            score: null,
            questions: parsed.questions,
          };

          try {
            await pool.query(
              `INSERT INTO quizzes (id, user_id, course_id, course_code, course_name, topic_id, topic_name, title, difficulty, type, questions_count, time_limit_minutes, questions)
               VALUES ($1, $2, $3, 'CS 301', $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
              [quiz.id, userId, courseId, courseName, topicId, topicName, quiz.title, difficulty, quiz.type, quiz.questionsCount, quiz.timeLimitMinutes, JSON.stringify(quiz.questions)]
            );
          } catch {}

          return res.json({ success: true, quiz });
        }
      }
    } catch (groqErr) {
      console.warn('Groq quiz generation error, using fallback:', groqErr.message);
    }
  }

  const fallback = buildFallbackQuiz({ courseId, topicId, difficulty, questionCount: n, type, courseName, topicName });
  try {
    await pool.query(
      `INSERT INTO quizzes (id, user_id, course_id, course_code, course_name, topic_id, topic_name, title, difficulty, type, questions_count, time_limit_minutes, questions)
       VALUES ($1, $2, $3, 'CS 301', $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [fallback.id, userId, courseId, courseName, topicId, topicName, fallback.title, difficulty, fallback.type, fallback.questionsCount, fallback.timeLimitMinutes, JSON.stringify(fallback.questions)]
    );
  } catch {}

  res.json({ success: true, quiz: fallback });
}

export { getUserQuizzes };
export default router;
