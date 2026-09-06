import express from 'express';

const router = express.Router();

// In-memory store for study plans (persists for server lifetime)
let STUDY_PLANS = [
  {
    id: 'plan-cs301',
    courseId: 'course-cs301',
    courseCode: 'CS 301',
    courseName: 'Distributed Systems',
    examDate: '2026-10-15',
    dailyStudyMinutes: 60,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    weakTopics: ['Consensus & Raft Invariants', 'Logical Time & Vector Clocks'],
    createdAt: '2026-09-01T10:00:00.000Z',
    title: 'CS 301 Sprint to Midterm',
    overallProgress: 42,
    tasks: [
      {
        id: 'task-101',
        title: 'Master Vector Clocks & Partial Ordering',
        topic: 'Logical Time & Vector Clocks',
        topicPriority: 'High',
        activityType: 'Weak-topic review',
        durationMinutes: 40,
        duration: '40 mins',
        status: 'pending',
        scheduledFor: 'Today',
        description:
          'Deep-dive into Lamport timestamps vs. vector clocks causality violations using AI Tutor in ELI10 mode.',
        actionType: 'tutor',
        actionLabel: 'Consult AI Tutor',
        actionTarget: '/courses/course-cs301/tutor',
      },
      {
        id: 'task-102',
        title: 'Raft State Transition Drill',
        topic: 'Consensus & Raft Invariants',
        topicPriority: 'Critical',
        activityType: 'Quiz',
        durationMinutes: 20,
        duration: '20 mins',
        status: 'pending',
        scheduledFor: 'Today',
        description:
          'Complete 5-question targeted drill on Leader Election timeouts and Log Matching properties.',
        actionType: 'quiz',
        actionLabel: 'Start Practice Quiz',
        actionTarget: '/courses/course-cs301/quizzes',
      },
      {
        id: 'task-103',
        title: 'Byzantine Fault Tolerance Fundamentals',
        topic: 'Byzantine Fault Tolerance',
        topicPriority: 'Medium',
        activityType: 'Study',
        durationMinutes: 45,
        duration: '45 mins',
        status: 'pending',
        scheduledFor: 'Tomorrow',
        description:
          'Read primary lecture note chunks on 3m+1 node requirements for oral messages protocol.',
        actionType: 'document',
        actionLabel: 'View Course Material',
        actionTarget: '/courses/course-cs301/documents',
      },
    ],
  },
  {
    id: 'plan-cs420',
    courseId: 'course-cs420',
    courseCode: 'CS 420',
    courseName: 'Operating Systems',
    examDate: '2026-11-04',
    dailyStudyMinutes: 45,
    preferredDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    weakTopics: ['Deadlock Detection & Avoidance'],
    createdAt: '2026-09-02T14:30:00.000Z',
    title: 'OS Final Exam Mastery Plan',
    overallProgress: 25,
    tasks: [
      {
        id: 'task-201',
        title: "Banker's Algorithm Safety Check Review",
        topic: 'Deadlock Detection & Avoidance',
        topicPriority: 'Critical',
        activityType: 'Weak-topic review',
        durationMinutes: 30,
        duration: '30 mins',
        status: 'pending',
        scheduledFor: 'Today',
        description:
          'Step-by-step vector matrix computations (Available, Allocation, Need) with AI Tutor.',
        actionType: 'tutor',
        actionLabel: 'Open AI Tutor',
        actionTarget: '/courses/course-cs420/tutor',
      },
      {
        id: 'task-202',
        title: 'Dining Philosophers Synchronization Code',
        topic: 'Concurrency & Deadlock',
        topicPriority: 'High',
        activityType: 'Practice',
        durationMinutes: 25,
        duration: '25 mins',
        status: 'pending',
        scheduledFor: 'Tomorrow',
        description:
          'Verify asymmetric philosopher picking and condition variables in monitor implementations.',
        actionType: 'document',
        actionLabel: 'View OS Notes',
        actionTarget: '/courses/course-cs420/documents',
      },
    ],
  },
];

/**
 * GET /api/v1/study-plans
 * Returns all study plans
 */
router.get('/', (req, res) => {
  res.json(STUDY_PLANS);
});

/**
 * GET /api/v1/study-plans/:id
 * Returns a single study plan by ID
 */
router.get('/:id', (req, res) => {
  const plan = STUDY_PLANS.find((p) => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Study plan not found.' });
  }
  res.json(plan);
});

/**
 * POST /api/v1/study-plans
 * Save a newly generated study plan
 */
router.post('/', (req, res) => {
  const plan = req.body;
  if (!plan || !plan.id) {
    return res.status(400).json({ success: false, message: 'Study plan data is required.' });
  }
  // Replace if already exists, otherwise prepend
  const existingIdx = STUDY_PLANS.findIndex((p) => p.id === plan.id);
  if (existingIdx !== -1) {
    STUDY_PLANS[existingIdx] = plan;
  } else {
    STUDY_PLANS = [plan, ...STUDY_PLANS];
  }
  res.status(201).json({ success: true, plan });
});

/**
 * PATCH /api/v1/study-plans/:planId/tasks/:taskId
 * Toggle task completion status
 */
router.patch('/:planId/tasks/:taskId', (req, res) => {
  const planIdx = STUDY_PLANS.findIndex((p) => p.id === req.params.planId);
  if (planIdx === -1) {
    return res.status(404).json({ success: false, message: 'Study plan not found.' });
  }

  const plan = { ...STUDY_PLANS[planIdx] };
  const task = plan.tasks?.find((t) => t.id === req.params.taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  task.status = task.status === 'completed' ? 'pending' : 'completed';

  // Recalculate overall progress
  const completedCount = plan.tasks.filter((t) => t.status === 'completed').length;
  plan.overallProgress = Math.round((completedCount / plan.tasks.length) * 100);

  STUDY_PLANS[planIdx] = plan;
  res.json({ success: true, plan });
});

/**
 * DELETE /api/v1/study-plans/:id
 * Delete a study plan
 */
router.delete('/:id', (req, res) => {
  const exists = STUDY_PLANS.some((p) => p.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ success: false, message: 'Study plan not found.' });
  }
  STUDY_PLANS = STUDY_PLANS.filter((p) => p.id !== req.params.id);
  res.json({ success: true, id: req.params.id });
});

export default router;
