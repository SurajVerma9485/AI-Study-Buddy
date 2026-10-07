import express from 'express';
import dotenv from 'dotenv';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

router.use(authenticateToken);

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

// In-memory fallback keyed by `${userId}:${courseId}`
const conversationMemory = new Map();

function getMemoryKey(userId, courseId) {
  return `${userId}:${courseId}`;
}

async function getThreadsForUser(userId, courseId) {
  try {
    const res = await pool.query(
      'SELECT id, user_id AS "userId", course_id AS "courseId", title, messages, created_at AS "createdAt" FROM ai_conversations WHERE user_id = $1 AND course_id = $2 ORDER BY updated_at DESC',
      [userId, courseId]
    );
    if (res.rows.length > 0) {
      return res.rows;
    }
  } catch (err) {
    console.warn('DB ai_conversations error:', err.message);
  }

  const key = getMemoryKey(userId, courseId);
  if (!conversationMemory.has(key)) {
    const defaultThread = {
      id: `conv-${courseId}-${userId.slice(0, 6)}`,
      userId,
      courseId,
      title: 'Study Discussion',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-welcome',
          role: 'assistant',
          content:
            'Hello! I am your AI Study Buddy. Ask me anything about this course — I can explain concepts in simple terms, give detailed analysis, help with exam prep, or give hints without spoiling the answer!',
          mode: 'normal',
          sources: [],
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    conversationMemory.set(key, [defaultThread]);

    try {
      await pool.query(
        'INSERT INTO ai_conversations (id, user_id, course_id, title, messages) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [defaultThread.id, userId, courseId, defaultThread.title, JSON.stringify(defaultThread.messages)]
      );
    } catch {}
  }
  return conversationMemory.get(key) || [];
}

function stripReasoning(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

const MODE_SYSTEM_PROMPTS = {
  normal: 'You are an expert AI Study Buddy. Give clear, accurate answers grounded in the course topic.',
  eli10: 'You are an AI Study Buddy explaining to a 10-year-old. Use simple words, fun analogies, and emojis. Keep it short and joyful.',
  detailed: 'You are an expert AI Study Buddy. Give a thorough, technical, in-depth explanation with definitions, examples, and formulas.',
  exam: 'You are an AI Study Buddy helping with exam prep. Format your answer as a model answer with mark allocations and common mistakes.',
  hint: 'You are an AI Study Buddy giving Socratic hints only. Do NOT give the full answer. Ask guiding questions.',
};

function buildFallbackAnswer(question, mode = 'normal') {
  return `Regarding "${question.slice(0, 60)}": This is a key subject concept. In ${mode} mode: review the fundamentals and verify each step using standard principles.`;
}

/**
 * GET /api/v1/ai/conversations?courseId=...
 */
router.get('/conversations', async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.query;
  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId query parameter is required.' });
  }

  const threads = await getThreadsForUser(userId, courseId);
  res.json(threads);
});

/**
 * POST /api/v1/ai/conversations
 */
router.post('/conversations', async (req, res) => {
  const userId = req.user.id;
  const { courseId, title = 'New Discussion' } = req.body;
  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId is required.' });
  }

  const newThread = {
    id: `conv-${courseId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    courseId,
    title,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Hello! Ask any question and choose your preferred explanation mode.',
        mode: 'normal',
        sources: [],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };

  try {
    await pool.query(
      'INSERT INTO ai_conversations (id, user_id, course_id, title, messages) VALUES ($1, $2, $3, $4, $5)',
      [newThread.id, userId, courseId, title, JSON.stringify(newThread.messages)]
    );
  } catch {}

  const key = getMemoryKey(userId, courseId);
  const current = conversationMemory.get(key) || [];
  conversationMemory.set(key, [newThread, ...current]);

  res.status(201).json(newThread);
});

/**
 * DELETE /api/v1/ai/conversations/:id
 */
router.delete('/conversations/:id', async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM ai_conversations WHERE id = $1 AND user_id = $2', [id, userId]);
  } catch {}

  for (const [key, threads] of conversationMemory.entries()) {
    if (key.startsWith(`${userId}:`)) {
      conversationMemory.set(key, threads.filter((t) => t.id !== id));
    }
  }

  res.json({ success: true, id });
});

/**
 * POST /api/v1/ai/chat
 */
router.post('/chat', async (req, res) => {
  const userId = req.user.id;
  const { courseId, conversationId, message, mode = 'normal' } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const systemPrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.normal;
  const threads = await getThreadsForUser(userId, courseId || 'general');
  const thread = threads.find((t) => t.id === conversationId) || threads[0];

  let replyText = '';
  if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
    try {
      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message.trim() },
          ],
          temperature: 0.6,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        replyText = stripReasoning(data.choices?.[0]?.message?.content);
      }
    } catch (err) {
      console.warn('Groq tutor chat error:', err.message);
    }
  }

  if (!replyText) {
    replyText = buildFallbackAnswer(message.trim(), mode);
  }

  const userMsg = {
    id: `msg-${Date.now()}-u`,
    role: 'user',
    content: message.trim(),
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const assistantMsg = {
    id: `msg-${Date.now()}-a`,
    role: 'assistant',
    content: replyText,
    mode,
    sources: [],
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  if (thread) {
    const updatedMessages = [...(thread.messages || []), userMsg, assistantMsg];
    thread.messages = updatedMessages;

    try {
      await pool.query(
        'UPDATE ai_conversations SET messages = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
        [JSON.stringify(updatedMessages), thread.id, userId]
      );
    } catch {}
  }

  res.json({
    reply: replyText,
    message: assistantMsg,
    threadId: thread?.id,
  });
});

export default router;
