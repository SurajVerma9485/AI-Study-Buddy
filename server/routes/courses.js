import express from 'express';

const router = express.Router();

// In-memory store seeded with realistic mock courses
// (In production this would be a PostgreSQL courses table)
let COURSES = [
  {
    id: 'course-cs301',
    code: 'CS 301',
    name: 'Distributed Systems & Cloud Computing',
    description:
      'Consensus protocols (Raft, Paxos), CAP theorem, vector clocks, and scalable microservice architectures.',
    examDate: '2026-10-15',
    color: '#6366f1',
    progress: 74,
    documentsCount: 6,
    topicsCount: 5,
    lastStudied: 'Today, 2:30 PM',
    topics: [
      {
        id: 'top-1',
        title: 'CAP Theorem & PACELC Trade-offs',
        order: 1,
        mastery: 92,
        status: 'mastered',
        summary:
          'Consistency, Availability, and Partition tolerance guarantees under asynchronous network partitions.',
        subtopics: ['Network Partitions', 'Strict vs Eventual Consistency', 'Dynamo-style Quorums'],
      },
      {
        id: 'top-2',
        title: 'Consensus: Raft & Paxos Algorithm',
        order: 2,
        mastery: 65,
        status: 'improving',
        summary: 'Leader election, log replication, safety invariants, and state machine consistency.',
        subtopics: ['Leader Election', 'Log Compaction & Snapshots', 'Split Brain Prevention'],
      },
      {
        id: 'top-3',
        title: 'Logical Time & Vector Clocks',
        order: 3,
        mastery: 42,
        status: 'weak',
        summary: 'Lamport timestamps, causal orderings, and detecting concurrent conflicting updates.',
        subtopics: ['Lamport Clocks', 'Vector Timestamps', 'Matrix Clocks'],
      },
      {
        id: 'top-4',
        title: 'Distributed Transactions & 2PC',
        order: 4,
        mastery: 80,
        status: 'mastered',
        summary: 'Two-phase commit, three-phase commit, and Saga pattern for distributed rollbacks.',
        subtopics: ['Two-Phase Commit', 'Saga Pattern', 'Distributed Locking'],
      },
      {
        id: 'top-5',
        title: 'Gossip Protocols & Failure Detection',
        order: 5,
        mastery: 55,
        status: 'improving',
        summary: 'Epidemic algorithms, phi-accrual failure detection, and cluster membership lists.',
        subtopics: ['SWIM Protocol', 'Phi Accrual Failure Detector', 'Anti-Entropy'],
      },
    ],
  },
  {
    id: 'course-cs420',
    code: 'CS 420',
    name: 'Operating Systems & Concurrency',
    description:
      'Kernel internals, virtual memory paging, scheduling algorithms, lock-free synchronization, and file systems.',
    examDate: '2026-11-02',
    color: '#a855f7',
    progress: 58,
    documentsCount: 8,
    topicsCount: 4,
    lastStudied: 'Yesterday',
    topics: [
      {
        id: 'top-os-1',
        title: 'Virtual Memory & Page Replacement',
        order: 1,
        mastery: 70,
        status: 'improving',
        summary: 'Multi-level page tables, TLB shootdowns, LRU and Clock replacement algorithms.',
        subtopics: ['TLB Caches', 'Inverted Page Tables', 'Demand Paging'],
      },
      {
        id: 'top-os-2',
        title: 'Concurrency Primitives & Deadlock',
        order: 2,
        mastery: 35,
        status: 'weak',
        summary: 'Mutexes, semaphores, condition variables, Banker algorithm, and lock inversion.',
        subtopics: ['Banker Algorithm', 'Lock Ordering', 'Futex Implementation'],
      },
      {
        id: 'top-os-3',
        title: 'CPU Scheduling & CFS',
        order: 3,
        mastery: 88,
        status: 'mastered',
        summary:
          'Completely Fair Scheduler (CFS), multi-core affinity, and real-time scheduling guarantees.',
        subtopics: ['CFS Red-Black Trees', 'Work Stealing', 'Priority Inversion'],
      },
      {
        id: 'top-os-4',
        title: 'File Systems & Journaling',
        order: 4,
        mastery: 60,
        status: 'improving',
        summary: 'Ext4 journaling, inodes, copy-on-write (Btrfs/ZFS), and crash consistency.',
        subtopics: ['Inodes & Dentries', 'Write-Ahead Journaling', 'FSCK recovery'],
      },
    ],
  },
  {
    id: 'course-ai502',
    code: 'AI 502',
    name: 'Neural Networks & Deep Learning',
    description:
      'Transformer architectures, multi-head attention, backpropagation mathematics, and diffusion models.',
    examDate: '2026-12-10',
    color: '#06b6d4',
    progress: 82,
    documentsCount: 11,
    topicsCount: 4,
    lastStudied: '3 days ago',
    topics: [
      {
        id: 'top-ai-1',
        title: 'Backpropagation & Computational Graphs',
        order: 1,
        mastery: 95,
        status: 'mastered',
        summary: 'Reverse-mode automatic differentiation, Jacobian matrices, and vanishing gradients.',
        subtopics: ['Chain Rule Derivations', 'Gradient Clipping', 'Optimizer Dynamics (AdamW)'],
      },
      {
        id: 'top-ai-2',
        title: 'Transformers & Self-Attention',
        order: 2,
        mastery: 85,
        status: 'mastered',
        summary: 'Scaled dot-product attention, positional embeddings (RoPE), and KV-caching.',
        subtopics: ['Scaled Dot-Product Attention', 'Rotary Positional Embeddings', 'FlashAttention'],
      },
      {
        id: 'top-ai-3',
        title: 'RAG & Vector Retrieval',
        order: 3,
        mastery: 90,
        status: 'mastered',
        summary:
          'Dense embeddings, HNSW vector indexing, reciprocal rank fusion, and context windows.',
        subtopics: ['Cosine Similarity vs Dot Product', 'HNSW Graph Search', 'Context Window Re-ranking'],
      },
      {
        id: 'top-ai-4',
        title: 'Diffusion Models & Score Matching',
        order: 4,
        mastery: 45,
        status: 'weak',
        summary:
          'Forward and reverse diffusion SDEs, DDPM, DDIM sampling, and classifier-free guidance.',
        subtopics: ['Forward Gaussian Noise', 'Score Matching', 'Classifier-Free Guidance'],
      },
    ],
  },
];

/**
 * GET /api/v1/courses
 * Returns all courses
 */
router.get('/', (req, res) => {
  res.json(COURSES);
});

/**
 * GET /api/v1/courses/:id
 * Returns a single course by ID
 */
router.get('/:id', (req, res) => {
  const course = COURSES.find((c) => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }
  res.json(course);
});

/**
 * POST /api/v1/courses
 * Create a new course
 */
router.post('/', (req, res) => {
  const { code, name, description, examDate, color } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Course name is required.' });
  }
  const newCourse = {
    id: `course-${Date.now()}`,
    code: code || `CS ${(COURSES.length + 1) * 100}`,
    name,
    description: description || 'Comprehensive course syllabus and lecture notes.',
    examDate: examDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    color: color || '#6366f1',
    progress: 0,
    documentsCount: 0,
    topicsCount: 1,
    lastStudied: 'Just created',
    topics: [
      {
        id: `top-${Date.now()}-1`,
        title: 'Module 1: Foundations & Core Concepts',
        order: 1,
        mastery: 0,
        status: 'weak',
        summary: 'Initial topic overview and introductory learning objectives.',
        subtopics: ['Core Definitions', 'Syllabus Breakdown'],
      },
    ],
  };
  COURSES = [newCourse, ...COURSES];
  res.status(201).json(newCourse);
});

/**
 * PUT /api/v1/courses/:id
 * Update an existing course
 */
router.put('/:id', (req, res) => {
  const idx = COURSES.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }
  COURSES[idx] = { ...COURSES[idx], ...req.body, id: req.params.id };
  res.json(COURSES[idx]);
});

/**
 * DELETE /api/v1/courses/:id
 * Delete a course
 */
router.delete('/:id', (req, res) => {
  const exists = COURSES.some((c) => c.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }
  COURSES = COURSES.filter((c) => c.id !== req.params.id);
  res.json({ success: true, id: req.params.id });
});

/**
 * POST /api/v1/courses/:id/topics
 * Add a topic to a course
 */
router.post('/:id/topics', (req, res) => {
  const idx = COURSES.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }
  const course = COURSES[idx];
  const newTopic = {
    id: `top-${Date.now()}`,
    title: req.body.title || 'New Topic',
    order: (course.topics?.length || 0) + 1,
    mastery: 0,
    status: 'weak',
    summary: req.body.summary || 'Topic learning summary.',
    subtopics: req.body.subtopics || ['Key Concept 1'],
  };
  course.topics = [...(course.topics || []), newTopic];
  course.topicsCount = course.topics.length;
  COURSES[idx] = course;
  res.status(201).json(course);
});

/**
 * GET /api/v1/courses/:id/quizzes
 * Returns all quizzes for a specific course (delegated to quizzes store via import)
 * We return a filtered list from the in-memory mock so the course quizzes page works.
 */
router.get('/:id/quizzes', (req, res) => {
  // Inline seeded data for course-scoped quiz lists
  const COURSE_QUIZZES = {
    'course-cs301': [
      { id: 'quiz-01', courseId: 'course-cs301', courseCode: 'CS 301', title: 'Raft Consensus & Leader Election Practice', difficulty: 'Medium', type: 'MCQ & True/False', questionsCount: 5, timeLimitMinutes: 10, score: 80, completedAt: 'Yesterday', createdAt: '2026-09-05' },
    ],
    'course-cs420': [
      { id: 'quiz-02', courseId: 'course-cs420', courseCode: 'CS 420', title: 'Deadlock Detection & Concurrency Primitives', difficulty: 'Hard', type: 'MCQ & True/False', questionsCount: 4, timeLimitMinutes: 8, score: 45, completedAt: '2 days ago', createdAt: '2026-09-04' },
    ],
    'course-ai502': [
      { id: 'quiz-03', courseId: 'course-ai502', courseCode: 'AI 502', title: 'Self-Attention & Positional Encodings Check', difficulty: 'Medium', type: 'MCQ', questionsCount: 3, timeLimitMinutes: 6, score: 92, completedAt: '4 days ago', createdAt: '2026-09-02' },
    ],
  };
  res.json(COURSE_QUIZZES[req.params.id] || []);
});

/**
 * GET /api/v1/courses/:id/weak-topics
 */
router.get('/:id/weak-topics', (req, res) => {
  const course = COURSES.find((c) => c.id === req.params.id) || COURSES[0];
  const weak = (course?.topics || [])
    .filter((t) => t.status === 'weak' || (t.mastery && t.mastery < 60))
    .map((t) => ({
      id: t.id,
      courseId: course.id,
      courseCode: course.code,
      topic: t.title,
      mastery: t.mastery || 40,
      trend: '-4% this week',
      suggestedAction: 'Take 5-min Hint Mode Quiz',
      actionTarget: `/courses/${course.id}/quizzes`,
    }));
  res.json(weak);
});

/**
 * GET /api/v1/courses/:id/progress
 */
router.get('/:id/progress', (req, res) => {
  const course = COURSES.find((c) => c.id === req.params.id) || COURSES[0];
  const topics = course?.topics || [];
  const weakTopics = topics
    .filter((t) => t.status === 'weak' || (t.mastery && t.mastery < 60))
    .map((t) => ({
      id: t.id,
      courseId: course.id,
      courseCode: course.code,
      topic: t.title,
      mastery: t.mastery || 42,
      trend: '-4% this week',
      suggestedAction: 'Review with AI Tutor in ELI10 mode',
      actionTarget: `/courses/${course.id}/tutor`,
    }));

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const progressOverTime = days.map((day, idx) => ({
    day,
    date: `2026-08-${25 + idx}`,
    mastery: Math.min(100, Math.max(30, (course.progress || 70) - 12 + idx * 3)),
    quizScore: Math.min(100, Math.max(40, (course.progress || 70) - 8 + idx * 4)),
    studyMinutes: [45, 60, 30, 90, 45, 120, 60][idx],
  }));

  res.json({
    courseId: course.id,
    courseCode: course.code,
    courseName: course.name,
    overallMastery: course.progress || 74,
    questionsAttempted: 95,
    correctAnswers: 76,
    quizAccuracyPercentage: 80,
    quizzesCompletedCount: 4,
    studyStreakDays: 14,
    totalStudyHours: 18.5,
    topicsMastery: topics.map((t) => ({
      id: t.id,
      title: t.title,
      mastery: t.mastery || 50,
      status: t.status || (t.mastery >= 80 ? 'mastered' : t.mastery >= 60 ? 'improving' : 'weak'),
      order: t.order || 1,
      questionsAttempted: 20,
      correctAnswers: Math.round(20 * ((t.mastery || 50) / 100)),
      subtopics: t.subtopics || [],
    })),
    weakTopics,
    recentlyStudiedTopics: topics.slice(0, 3).map((t, idx) => ({
      id: `recent-${t.id}`,
      topicId: t.id,
      title: t.title,
      lastStudiedAt: idx === 0 ? 'Today, 2:30 PM' : idx === 1 ? 'Yesterday, 6:15 PM' : '3 days ago',
      timeSpent: idx === 0 ? '45 mins' : idx === 1 ? '30 mins' : '60 mins',
      activityType: idx === 0 ? 'Quiz' : idx === 1 ? 'AI Tutor' : 'Study',
      mastery: t.mastery,
    })),
    studyActivity: [
      {
        id: 'act-1',
        type: 'Quiz',
        title: `${course.code}: Practice Assessment Completed`,
        timestamp: 'Today, 2:30 PM',
        durationMinutes: 25,
        score: 80,
      },
      {
        id: 'act-2',
        type: 'AI Tutor',
        title: `AI Tutor Session: ${topics[0]?.title || 'Core Syllabus'}`,
        timestamp: 'Yesterday, 5:40 PM',
        durationMinutes: 40,
        score: null,
      },
    ],
    progressOverTime,
    quizHistory: [
      {
        id: 'quiz-sim-1',
        title: `${course.code} Comprehensive Check`,
        score: 80,
        questionsCount: 10,
        difficulty: 'Medium',
        completedAt: 'Yesterday',
      },
    ],
  });
});

export { COURSES };
export default router;

