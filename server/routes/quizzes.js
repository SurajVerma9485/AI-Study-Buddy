import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

// ─── In-memory stores ─────────────────────────────────────────────────────────
let QUIZZES = [
  {
    id: 'quiz-01',
    courseId: 'course-cs301',
    courseCode: 'CS 301',
    courseName: 'Distributed Systems & Cloud Computing',
    topicId: 'top-2',
    topicName: 'Consensus: Raft & Paxos Algorithm',
    title: 'Raft Consensus & Leader Election Practice',
    difficulty: 'Medium',
    type: 'MCQ & True/False',
    questionsCount: 5,
    timeLimitMinutes: 10,
    score: 80,
    completedAt: 'Yesterday',
    createdAt: '2026-09-05',
    questions: [
      {
        id: 'q-1',
        topicId: 'top-2',
        topicName: 'Consensus & Raft Invariants',
        type: 'MCQ',
        question:
          'In the Raft consensus protocol, what state does a follower node transition to when its election timer expires?',
        options: ['Leader', 'Candidate', 'Pre-vote Observer', 'Log Compactor'],
        correctAnswerIndex: 1,
        explanation:
          'When an election timeout expires with no heartbeat from the current leader, the follower increments its term and becomes a Candidate to solicit votes.',
      },
      {
        id: 'q-2',
        topicId: 'top-2',
        topicName: 'Consensus & Raft Invariants',
        type: 'True/False',
        question: 'In Raft, a leader can overwrite uncommitted log entries on its followers.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        explanation:
          'True. Raft enforces that followers synchronise their logs with the leader; any conflicting uncommitted entries on followers are overwritten.',
      },
      {
        id: 'q-3',
        topicId: 'top-3',
        topicName: 'Logical Time & Vector Clocks',
        type: 'MCQ',
        question:
          'Which of the following describes the key limitation of Lamport Timestamps compared to Vector Clocks?',
        options: [
          'Lamport timestamps require atomic GPS clocks',
          'If L(a) < L(b), one cannot infer whether event a causally preceded event b',
          'Lamport clocks cannot be updated concurrently',
          'Vector clocks only work for 2-node networks',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Lamport timestamps provide total ordering consistent with causality but not strong causality: L(a) < L(b) does not guarantee a happened-before b.',
      },
      {
        id: 'q-4',
        topicId: 'top-3',
        topicName: 'Logical Time & Vector Clocks',
        type: 'True/False',
        question:
          'Vector Clocks allow detecting whether two events in a distributed system are causally related or concurrent.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        explanation:
          'True. If neither timestamp vector dominates the other, the two events are proven concurrent.',
      },
      {
        id: 'q-5',
        topicId: 'top-1',
        topicName: 'CAP Theorem & Trade-offs',
        type: 'True/False',
        question:
          'Under a network partition, a system can guarantee both 100% Availability and Linearizable Consistency.',
        options: ['True', 'False'],
        correctAnswerIndex: 1,
        explanation:
          'False. The CAP theorem proves that under partition (P), a distributed system must sacrifice either Availability or Consistency.',
      },
    ],
  },
  {
    id: 'quiz-02',
    courseId: 'course-cs420',
    courseCode: 'CS 420',
    courseName: 'Operating Systems & Concurrency',
    topicId: 'top-os-2',
    topicName: 'Concurrency Primitives & Deadlock',
    title: 'Deadlock Detection & Concurrency Primitives',
    difficulty: 'Hard',
    type: 'MCQ & True/False',
    questionsCount: 4,
    timeLimitMinutes: 8,
    score: 45,
    completedAt: '2 days ago',
    createdAt: '2026-09-04',
    questions: [
      {
        id: 'q-1',
        topicId: 'top-os-2',
        topicName: 'Deadlock Detection & Avoidance',
        type: 'MCQ',
        question:
          "The Banker's Algorithm is used for which of the following?",
        options: [
          'Page replacement in virtual memory',
          'Deadlock avoidance by safe state evaluation',
          'CPU scheduling with priority inversion',
          'File system journaling',
        ],
        correctAnswerIndex: 1,
        explanation:
          "The Banker's Algorithm evaluates whether granting a resource request keeps the system in a safe state, thus avoiding deadlock.",
      },
      {
        id: 'q-2',
        topicId: 'top-os-2',
        topicName: 'Deadlock Detection & Avoidance',
        type: 'True/False',
        question:
          'A deadlock can occur even if only one resource instance of each type exists in the system.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        explanation:
          'True. With single-instance resources, a circular wait among processes waiting for each other\'s held resources creates deadlock.',
      },
      {
        id: 'q-3',
        topicId: 'top-os-3',
        topicName: 'CPU Scheduling',
        type: 'MCQ',
        question: "Linux's Completely Fair Scheduler (CFS) uses which data structure for the run queue?",
        options: ['Max-Heap', 'Red-Black Tree', 'Circular Queue', 'B-Tree'],
        correctAnswerIndex: 1,
        explanation:
          'CFS uses a Red-Black Tree ordered by virtual runtime (vruntime) for O(log n) task selection.',
      },
      {
        id: 'q-4',
        topicId: 'top-os-1',
        topicName: 'Virtual Memory',
        type: 'True/False',
        question: "Belady's Anomaly can occur with the FIFO page replacement algorithm.",
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        explanation:
          "True. Belady's Anomaly — increasing page frames can increase page faults — is observed in FIFO but not in optimal or LRU algorithms.",
      },
    ],
  },
  {
    id: 'quiz-03',
    courseId: 'course-ai502',
    courseCode: 'AI 502',
    courseName: 'Neural Networks & Deep Learning',
    topicId: 'top-ai-2',
    topicName: 'Transformers & Self-Attention',
    title: 'Self-Attention & Positional Encodings Check',
    difficulty: 'Medium',
    type: 'MCQ',
    questionsCount: 3,
    timeLimitMinutes: 6,
    score: 92,
    completedAt: '4 days ago',
    createdAt: '2026-09-02',
    questions: [
      {
        id: 'q-1',
        topicId: 'top-ai-2',
        topicName: 'Transformers & Self-Attention',
        type: 'MCQ',
        question:
          'What is the time complexity of scaled dot-product attention with sequence length n?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        correctAnswerIndex: 2,
        explanation:
          'Scaled dot-product attention computes pairwise similarities between all tokens, resulting in O(n²) time and memory complexity.',
      },
      {
        id: 'q-2',
        topicId: 'top-ai-2',
        topicName: 'Transformers & Self-Attention',
        type: 'True/False',
        question:
          'Rotary Positional Embeddings (RoPE) inject positional information by adding fixed sinusoidal vectors to token embeddings.',
        options: ['True', 'False'],
        correctAnswerIndex: 1,
        explanation:
          'False. RoPE encodes positional information by rotating query and key vectors in complex space, rather than additive sinusoidal encoding.',
      },
      {
        id: 'q-3',
        topicId: 'top-ai-1',
        topicName: 'Backpropagation',
        type: 'MCQ',
        question:
          'Which optimizer introduced per-parameter adaptive learning rates with bias correction?',
        options: ['SGD', 'RMSProp', 'Adam', 'Adagrad'],
        correctAnswerIndex: 2,
        explanation:
          'Adam combines first-moment (momentum) and second-moment (adaptive rate) estimates with bias correction for robust convergence.',
      },
    ],
  },
];

// attempt store: attemptId → { quiz, answers, startedAt }
const ATTEMPTS = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// Deterministic fallback quiz for any course/topic
function buildFallbackQuiz({ courseId, topicId, difficulty, questionCount, type, courseName, topicName }) {
  const n = Math.max(1, Math.min(Number(questionCount) || 5, 20));
  const isTf = type === 'True/False' || type === 'TF' || type === 'true/false';

  const baseQuestions = isTf
    ? [
        {
          id: 'q-1', topicId, topicName, type: 'True/False',
          question: `In ${topicName}, safety invariants must hold true even under asynchronous network partitions.`,
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          explanation: 'True. Safety invariants are non-negotiable correctness criteria that prevent state corruption.',
        },
        {
          id: 'q-2', topicId, topicName, type: 'True/False',
          question: `Distributed consensus under ${topicName} can guarantee both 100% Availability and Linearizability during network partitions.`,
          options: ['True', 'False'],
          correctAnswerIndex: 1,
          explanation: 'False. The CAP theorem proves that under partitions, consistency or availability must be chosen.',
        },
        {
          id: 'q-3', topicId, topicName, type: 'True/False',
          question: `Liveness guarantees ensure that the system will eventually make forward progress under ${topicName}.`,
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          explanation: 'True. Liveness properties ensure that something good will eventually happen without deadlock.',
        },
        {
          id: 'q-4', topicId, topicName, type: 'True/False',
          question: `In ${topicName}, a follower node can unilaterally promote itself to leader without quorum consensus.`,
          options: ['True', 'False'],
          correctAnswerIndex: 1,
          explanation: 'False. Majority quorum approval is mandatory for safe leader promotion.',
        },
        {
          id: 'q-5', topicId, topicName, type: 'True/False',
          question: `State machine replication requires all non-faulty nodes to execute state transitions in identical order.`,
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          explanation: 'True. Total deterministic order of applied commands guarantees replicated state convergence.',
        },
      ]
    : [
        {
          id: 'q-1', topicId, topicName, type: 'MCQ',
          question: `Which of the following best describes the core principle of ${topicName}?`,
          options: ['Strict sequential ordering', 'Concurrent state management', 'Distributed consensus through majority voting', 'Single-point control flow'],
          correctAnswerIndex: 2,
          explanation: `The core principle of ${topicName} involves ensuring agreement across distributed participants through majority-based decision making.`,
        },
        {
          id: 'q-2', topicId, topicName, type: 'True/False',
          question: `In ${topicName}, safety properties must hold even during network partitions.`,
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          explanation: 'True. Safety (correctness) is a non-negotiable invariant that must hold under all conditions including network partitions.',
        },
        {
          id: 'q-3', topicId, topicName, type: 'MCQ',
          question: `What is the primary trade-off when designing systems based on ${topicName}?`,
          options: ['Speed vs. Accuracy', 'Consistency vs. Availability', 'Memory vs. CPU', 'Latency vs. Bandwidth'],
          correctAnswerIndex: 1,
          explanation: 'Distributed systems must balance consistency (all nodes see the same data) against availability (every request gets a response).',
        },
        {
          id: 'q-4', topicId, topicName, type: 'True/False',
          question: `Liveness properties guarantee that the system will eventually make progress under ${topicName}.`,
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          explanation: 'True. Liveness ensures forward progress — the system will eventually complete operations rather than being stuck indefinitely.',
        },
        {
          id: 'q-5', topicId, topicName, type: 'MCQ',
          question: `Which of the following is NOT a failure mode addressed by ${topicName}?`,
          options: ['Network partition', 'Node crash failure', 'Hardware design flaws', 'Message delay or reordering'],
          correctAnswerIndex: 2,
          explanation: 'Hardware design flaws are addressed at the hardware manufacturing level, not by distributed systems protocols.',
        },
      ];

  const questions = baseQuestions.slice(0, n);

  return {
    id: `quiz-gen-${Date.now()}`,
    courseId,
    topicId,
    topicName,
    title: `${courseName || 'Course'}: ${topicName} — ${difficulty} Drill`,
    difficulty,
    type,
    questionsCount: questions.length,
    timeLimitMinutes: Math.max(5, questions.length * 2),
    createdAt: new Date().toLocaleDateString(),
    score: null,
    questions,
    isAiGenerated: true,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ ROUTES (mounted on /api/v1/quizzes)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/quizzes
 */
router.get('/', (req, res) => {
  res.json(QUIZZES);
});

/**
 * GET /api/v1/quizzes/:id
 */
router.get('/:id', (req, res) => {
  const quiz = QUIZZES.find((q) => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }
  res.json(quiz);
});

/**
 * POST /api/v1/quizzes/:id/attempts
 * Start a quiz attempt
 */
router.post('/:id/attempts', (req, res) => {
  const quiz = QUIZZES.find((q) => q.id === req.params.id);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }
  const attempt = {
    attemptId: `att-${Date.now()}`,
    quizId: quiz.id,
    startedAt: Date.now(),
    answers: {},
  };
  ATTEMPTS.set(attempt.attemptId, { quiz, answers: {}, startedAt: attempt.startedAt });
  res.status(201).json(attempt);
});

// ══════════════════════════════════════════════════════════════════════════════
// ATTEMPT ROUTES (mounted on /api/v1/attempts)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/attempts/:id/answers
 */
router.post(['/:id/answers', '/attempts/:id/answers'], (req, res) => {
  const { questionId, answer } = req.body;
  const attemptId = req.params.id;

  if (ATTEMPTS.has(attemptId)) {
    ATTEMPTS.get(attemptId).answers[questionId] = answer;
  }
  res.json({ success: true });
});

/**
 * POST /api/v1/attempts/:id/complete
 * Score and return result
 */
router.post(['/:id/complete', '/attempts/:id/complete'], (req, res) => {
  const attemptId = req.params.id;
  const { answers: submittedAnswers = {}, quiz: clientQuiz = null } = req.body;

  const stored = ATTEMPTS.get(attemptId);
  const mergedAnswers = { ...(stored?.answers || {}), ...submittedAnswers };
  const quiz = stored?.quiz || clientQuiz || null;
  const questions = quiz?.questions || [];

  let correctCount = 0;
  const explanations = questions.map((q) => {
    const studentAns = mergedAnswers[q.id];
    let isCorrect = false;

    const qType = (q.type || '').trim().toLowerCase();
    if (qType === 'mcq' || qType === 'true/false' || qType === 'tf' || qType === 't/f' || !q.type) {
      isCorrect = studentAns === q.correctAnswerIndex;
    } else {
      isCorrect = typeof studentAns === 'string' && studentAns.trim().length > 3;
    }
    if (isCorrect) correctCount++;

    return {
      questionId: q.id,
      question: q.question,
      topicName: q.topicName || 'General',
      userAnswer: q.options ? (q.options[studentAns] ?? 'Unanswered') : (studentAns ?? 'Unanswered'),
      correctAnswer: q.options ? q.options[q.correctAnswerIndex] : (q.correctAnswerText || '—'),
      isCorrect,
      explanation: q.explanation || 'Refer to your course notes for the correct answer.',
    };
  });

  const total = Math.max(questions.length, 1);
  const percentage = Math.round((correctCount / total) * 100);

  // Update best score in quiz store
  if (quiz) {
    const idx = QUIZZES.findIndex((q) => q.id === quiz.id);
    if (idx !== -1 && (QUIZZES[idx].score === null || percentage > QUIZZES[idx].score)) {
      QUIZZES[idx].score = percentage;
    }
  }

  // Calculate dynamic topic performance
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

  ATTEMPTS.delete(attemptId); // clean up
  res.json(result);
});

// ══════════════════════════════════════════════════════════════════════════════
// AI QUIZ GENERATION (mounted on /api/v1/ai/quiz via server/index.js)
// ══════════════════════════════════════════════════════════════════════════════

export async function generateQuizHandler(req, res) {
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

  // Try Groq
  if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
    try {
      const prompt = `You are an expert quiz generator for academic courses.
Generate exactly ${n} ${isTf ? 'True/False' : type} quiz questions on the topic "${topicName}" from the course "${courseName}".
Difficulty: ${difficulty}.

Rules:
${isTf
  ? '- For True/False: type MUST be "True/False", options MUST be exactly ["True","False"], correctAnswerIndex is 0 (True) or 1 (False).'
  : '- For MCQ: type is "MCQ", 4 answer options, correctAnswerIndex is 0-based index (0-3).'}
- Include a clear explanation for each correct answer.
- Return ONLY valid JSON. No markdown, no preamble.

JSON Schema:
{
  "title": "Quiz title string",
  "questions": [
    {
      "id": "q-1",
      "topicId": "${topicId}",
      "topicName": "${topicName}",
      "type": "${isTf ? 'True/False' : 'MCQ'}",
      "question": "Question text?",
      "options": ${isTf ? '["True", "False"]' : '["Option A", "Option B", "Option C", "Option D"]'},
      "correctAnswerIndex": 0,
      "explanation": "Why this is correct."
    }
  ]
}`;

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
          const normalizedQuestions = parsed.questions.map((q, idx) => {
            const qRaw = (q.type || '').toLowerCase();
            const qIsTf = isTf || qRaw === 'tf' || qRaw === 'true/false';
            return {
              ...q,
              id: q.id || `q-${idx + 1}`,
              type: qIsTf ? 'True/False' : (q.type || 'MCQ'),
              options: qIsTf ? ['True', 'False'] : (Array.isArray(q.options) && q.options.length > 0 ? q.options : ['A', 'B', 'C', 'D']),
              correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
            };
          });

          const quiz = {
            id: `quiz-groq-${Date.now()}`,
            courseId, topicId, topicName,
            title: parsed.title || `${courseName}: ${topicName} Drill`,
            difficulty, type: isTf ? 'True/False' : type,
            questionsCount: normalizedQuestions.length,
            timeLimitMinutes: Math.max(5, normalizedQuestions.length * 2),
            createdAt: new Date().toLocaleDateString(),
            score: null,
            questions: normalizedQuestions,
            isAiGenerated: true,
            source: 'Groq',
          };
          QUIZZES.unshift(quiz);
          return res.json({ success: true, quiz });
        }
      }
    } catch (groqErr) {
      console.warn('Groq quiz generation error, using fallback:', groqErr.message);
    }
  }

  // Fallback
  const quiz = buildFallbackQuiz({ courseId, topicId, difficulty, questionCount: n, type, courseName, topicName });
  QUIZZES.unshift(quiz);
  res.json({ success: true, quiz });
}

export default router;
