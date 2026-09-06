import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

// ─── In-memory conversation store ─────────────────────────────────────────────
// key: courseId  → value: array of conversation threads
const conversationStore = new Map();

function getThreads(courseId) {
  if (!conversationStore.has(courseId)) {
    // Seed with one default thread per course
    const defaultThread = {
      id: `conv-${courseId}-default`,
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
    conversationStore.set(courseId, [defaultThread]);
  }
  return conversationStore.get(courseId);
}

function saveThreads(courseId, threads) {
  conversationStore.set(courseId, threads);
}

// ─── Groq helper ──────────────────────────────────────────────────────────────
function stripReasoning(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

const MODE_SYSTEM_PROMPTS = {
  normal:
    'You are an expert AI Study Buddy. Give clear, accurate answers grounded in the course topic.',
  eli10:
    'You are an AI Study Buddy explaining to a 10-year-old. Use simple words, fun analogies, and emojis. Keep it short and joyful.',
  detailed:
    'You are an expert AI Study Buddy. Give a thorough, technical, in-depth explanation with definitions, examples, edge cases, and formulas where relevant.',
  exam:
    'You are an AI Study Buddy helping with exam prep. Format your answer as a model answer with mark allocations, key points examiners look for, and common mistakes to avoid.',
  hint:
    'You are an AI Study Buddy giving Socratic hints only. Do NOT give the full answer. Ask guiding questions that help the student think through the problem themselves.',
};

async function callGroq(messages, model) {
  const response = await fetch(GROQ_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: model || GROQ_MODEL,
      messages,
      temperature: 0.55,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return stripReasoning(data.choices?.[0]?.message?.content || '');
}

// ─── Fallback answers ─────────────────────────────────────────────────────────
function buildFallbackAnswer(message, mode, courseId) {
  const modeLabels = {
    eli10: '🧒 Simple Explanation',
    detailed: '📚 Detailed Analysis',
    exam: '📝 Exam-Style Answer',
    hint: '💡 Guided Hint',
    normal: '💬 Answer',
  };

  const label = modeLabels[mode] || modeLabels.normal;

  const answers = {
    eli10: `${label}\n\nImagine this topic is like a puzzle 🧩. Each piece fits perfectly with the others to create the full picture. The core idea is: everything works together step by step, and when one part finishes, it tells the next part to start!\n\nDoes that help? Ask me more! 😊`,
    detailed: `${label}\n\nThis topic involves several interconnected concepts:\n\n1. **Core Principle** — The fundamental mechanism operates through a structured sequence of operations that ensures consistency.\n2. **Key Properties** — Safety (correctness is always maintained) and Liveness (progress is always made under normal conditions).\n3. **Edge Cases** — Failure scenarios are handled through retry mechanisms and timeout-based recovery.\n4. **Practical Application** — In real systems, this is implemented with careful attention to performance trade-offs.\n\nWould you like me to dive deeper into any of these aspects?`,
    exam: `${label}\n\n**Model Answer (6 marks)**\n\n- **(2 marks)** Define the concept clearly, stating its purpose and scope.\n- **(2 marks)** Explain the mechanism: describe the step-by-step process and why each step matters.\n- **(2 marks)** Evaluate trade-offs: discuss limitations, failure modes, and how the design addresses them.\n\n**Common mistakes:** Vague definitions, skipping the "why", and forgetting to mention failure handling.`,
    hint: `${label}\n\n💡 Think about this:\n- What is the *goal* of the process you're describing?\n- What happens if one step fails — how does the system recover?\n- Can you identify the *invariant* that must always hold true?\n\nTry working through those questions and come back with your thoughts!`,
    normal: `Based on your course material, this concept involves a well-defined protocol where each participant follows specific rules to ensure the system remains consistent and correct even in the presence of failures.\n\nThe key insight is that by combining proper sequencing with majority-based decisions, the system can make progress while guaranteeing safety. Would you like a simpler explanation or more technical depth?`,
  };

  return answers[mode] || answers.normal;
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/ai/conversations?courseId=...
 */
router.get('/conversations', (req, res) => {
  const { courseId } = req.query;
  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId query parameter is required.' });
  }
  const threads = getThreads(courseId);
  res.json(threads);
});

/**
 * POST /api/v1/ai/conversations
 * Create a new conversation thread
 */
router.post('/conversations', (req, res) => {
  const { courseId, title = 'New Discussion' } = req.body;
  if (!courseId) {
    return res.status(400).json({ success: false, message: 'courseId is required.' });
  }

  const newThread = {
    id: `conv-${courseId}-${Date.now()}`,
    courseId,
    title,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Hello! I am ready to assist you. Ask any question and choose your preferred explanation mode — Simple (ELI10), Detailed, Exam-style, or Hint.',
        mode: 'normal',
        sources: [],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };

  const threads = getThreads(courseId);
  const updated = [newThread, ...threads];
  saveThreads(courseId, updated);

  res.status(201).json(newThread);
});

/**
 * DELETE /api/v1/ai/conversations/:id
 */
router.delete('/conversations/:id', (req, res) => {
  const { id } = req.params;
  const { courseId } = req.query;

  if (courseId) {
    const threads = getThreads(courseId);
    const updated = threads.filter((t) => t.id !== id);
    saveThreads(courseId, updated);
  } else {
    // Search all courses if courseId not provided
    for (const [cId, threads] of conversationStore.entries()) {
      const filtered = threads.filter((t) => t.id !== id);
      if (filtered.length !== threads.length) {
        saveThreads(cId, filtered);
        break;
      }
    }
  }

  res.json({ success: true, id });
});

/**
 * POST /api/v1/ai/chat
 * Send a message and get an AI-generated response
 */
router.post('/chat', async (req, res) => {
  const { courseId, conversationId, message, mode = 'normal' } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const systemPrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.normal;

  // Build message history for context
  const threads = getThreads(courseId || 'general');
  const thread = threads.find((t) => t.id === conversationId);
  const history = thread?.messages || [];

  // Build Groq message array (limit to last 10 messages for context window)
  const recentHistory = history.slice(-10);
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  let responseContent = '';
  let usedGroq = false;

  // Try Groq if API key is available
  if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
    try {
      responseContent = await callGroq(groqMessages, GROQ_MODEL);
      usedGroq = true;
    } catch (groqErr) {
      console.warn('Groq chat error, using fallback:', groqErr.message);
    }
  }

  // Use deterministic fallback if Groq not available or errored
  if (!responseContent) {
    responseContent = buildFallbackAnswer(message, mode, courseId);
  }

  const aiMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    role: 'assistant',
    content: responseContent,
    mode,
    sources: [],
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    generatedBy: usedGroq ? 'groq' : 'fallback',
  };

  // Persist messages to in-memory store
  if (courseId && conversationId) {
    const allThreads = getThreads(courseId);
    const threadIdx = allThreads.findIndex((t) => t.id === conversationId);
    if (threadIdx !== -1) {
      allThreads[threadIdx].messages.push(
        {
          id: `usr-${Date.now()}`,
          role: 'user',
          content: message,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        aiMessage
      );
      saveThreads(courseId, allThreads);
    }
  }

  res.json(aiMessage);
});

export default router;
