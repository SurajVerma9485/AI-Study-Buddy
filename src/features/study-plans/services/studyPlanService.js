import apiClient from '../../../services/api';
import { MOCK_COURSES, MOCK_WEAK_TOPICS } from '../../../services/mockData';
import { groqService } from '../../../services/groqService';

const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';
const LOCAL_PLANS_KEY = 'study_buddy_study_plans_data';

// Helper to calculate days between two dates
export const calculateDaysRemaining = (targetDateStr) => {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  const now = new Date();
  // Strip time for clean day delta
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Default seed study plans
const DEFAULT_STUDY_PLANS = [
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
        scheduledDate: new Date().toISOString().split('T')[0],
        description: 'Deep-dive into Lamport timestamps vs. vector clocks causality violations using AI Tutor in ELI10 mode.',
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
        scheduledDate: new Date().toISOString().split('T')[0],
        description: 'Complete 5-question targeted drill on Leader Election timeouts and Log Matching properties.',
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
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        description: 'Read primary lecture note chunks on 3m+1 node requirements for oral messages protocol.',
        actionType: 'document',
        actionLabel: 'View Course Material',
        actionTarget: '/courses/course-cs301/documents',
      },
      {
        id: 'task-104',
        title: 'Distributed Snapshots (Chandy-Lamport)',
        topic: 'Distributed Snapshots',
        topicPriority: 'Medium',
        activityType: 'Practice',
        durationMinutes: 35,
        duration: '35 mins',
        status: 'pending',
        scheduledFor: 'Upcoming',
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        description: 'Trace marker rule algorithms on 3-process topologies with FIFO communication channels.',
        actionType: 'tutor',
        actionLabel: 'Ask AI Tutor',
        actionTarget: '/courses/course-cs301/tutor',
      },
      {
        id: 'task-105',
        title: 'Mid-Syllabus Cumulative Self-Test',
        topic: 'Comprehensive Curriculum',
        topicPriority: 'High',
        activityType: 'Revision',
        durationMinutes: 60,
        duration: '60 mins',
        status: 'completed',
        scheduledFor: 'Completed',
        scheduledDate: '2026-09-02',
        description: 'Timed multi-topic review covering RPC semantics, two-phase commits, and election algorithms.',
        actionType: 'quiz',
        actionLabel: 'Review Score',
        actionTarget: '/quizzes',
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
        title: 'Banker’s Algorithm Safety Check Review',
        topic: 'Deadlock Detection & Avoidance',
        topicPriority: 'Critical',
        activityType: 'Weak-topic review',
        durationMinutes: 30,
        duration: '30 mins',
        status: 'pending',
        scheduledFor: 'Today',
        scheduledDate: new Date().toISOString().split('T')[0],
        description: 'Step-by-step vector matrix computations (Available, Allocation, Need) with AI Tutor.',
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
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        description: 'Verify asymmetric philosopher picking and condition variables in monitor implementations.',
        actionType: 'document',
        actionLabel: 'View OS Notes',
        actionTarget: '/courses/course-cs420/documents',
      },
      {
        id: 'task-203',
        title: 'Virtual Memory Page Replacement Simulator',
        topic: 'Virtual Memory & Paging',
        topicPriority: 'Medium',
        activityType: 'Study',
        durationMinutes: 40,
        duration: '40 mins',
        status: 'pending',
        scheduledFor: 'Upcoming',
        scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        description: 'Analyze LRU vs. FIFO Belady anomaly edge cases from lecture notes.',
        actionType: 'document',
        actionLabel: 'Read Chunks',
        actionTarget: '/courses/course-cs420/documents',
      },
      {
        id: 'task-204',
        title: 'Processes & Thread Context Switching Quiz',
        topic: 'Kernel Primitives',
        topicPriority: 'Low',
        activityType: 'Quiz',
        durationMinutes: 20,
        duration: '20 mins',
        status: 'completed',
        scheduledFor: 'Completed',
        scheduledDate: '2026-09-01',
        description: '10 questions on PCB, registers save/restore, and kernel-space traps.',
        actionType: 'quiz',
        actionLabel: 'View Results',
        actionTarget: '/quizzes',
      },
    ],
  },
];

const getStoredPlans = () => {
  try {
    const saved = localStorage.getItem(LOCAL_PLANS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_STUDY_PLANS;
  } catch {
    return DEFAULT_STUDY_PLANS;
  }
};

const setStoredPlans = (plans) => {
  try {
    localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to cache study plans locally', err);
  }
};

/**
 * Study Plan Service
 * Endpoints expected:
 * - POST /api/v1/ai/study-plan (Generate personalized plan)
 * - GET /api/v1/study-plans (Get all study plans)
 * - GET /api/v1/study-plans/:id (Get study plan by id)
 * - PATCH /api/v1/study-plans/:planId/tasks/:taskId (Toggle task completion)
 */
export const studyPlanService = {
  /**
   * Fetch all study plans
   */
  async getStudyPlans() {
    try {
      const response = await apiClient.get('/study-plans');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 200));
        return getStoredPlans();
      }
      throw error;
    }
  },

  /**
   * Fetch a single study plan by ID
   */
  async getStudyPlanById(planId) {
    try {
      const response = await apiClient.get(`/study-plans/${planId}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 200));
        const plans = getStoredPlans();
        const plan = plans.find((p) => p.id === planId);
        if (plan) return plan;
        // Fallback to first plan if ID not found
        return plans[0];
      }
      throw error;
    }
  },

  /**
   * Request the backend AI (Grok) to synthesize a personalized study plan
   * Supports Caveman flow: Class, Subject, Chapter, Days, and Daily Study Time.
   */
  async generateStudyPlan({
    classLevel = 'Class 10',
    subject = 'Mathematics',
    chapter = 'Chapter 1 - Real Numbers',
    days = 5,
    studyTime = '2 hours/day',
    dailyMinutes = 120,
    courseId,
    examDate,
    availableMinutesPerDay,
    preferredDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    weakTopicIds = [],
  }) {
    const effectiveDays = days || 5;
    const effectiveStudyTime = studyTime || `${availableMinutesPerDay || 120} mins/day`;
    const effectiveMinutes = Number(dailyMinutes || availableMinutesPerDay || 120);

    // 1. Send request to Backend API (which calls Grok / Groq API)
    try {
      const response = await apiClient.post('/ai/study-plan', {
        classLevel,
        subject,
        chapter,
        days: effectiveDays,
        studyTime: effectiveStudyTime,
        dailyMinutes: effectiveMinutes,
        courseId,
        examDate,
        preferredDays,
      });

      if (response.data && (response.data.plan || response.data.data)) {
        const newPlan = response.data.plan || response.data.data;
        const currentPlans = getStoredPlans();
        const updated = [newPlan, ...currentPlans.filter((p) => p.id !== newPlan.id)];
        setStoredPlans(updated);
        return newPlan;
      }
    } catch (apiErr) {
      console.warn('Backend Grok study plan API call error, evaluating fallback options:', apiErr.message);
    }

    // 2. Direct client-side Groq synthesis fallback
    if (groqService.isConfigured()) {
      try {
        const groqPlan = await groqService.generateStudyPlan({
          courseName: `${classLevel} ${subject}: ${chapter}`,
          dailyStudyMinutes: effectiveMinutes,
          preferredDays,
        });

        const newPlan = {
          id: `plan-groq-${Date.now()}`,
          classLevel,
          subject,
          chapter,
          title: groqPlan.title || `${classLevel} ${subject}: ${chapter} (${effectiveDays} Days)`,
          days: effectiveDays,
          dailyStudyTime: effectiveStudyTime,
          dailyMinutes: effectiveMinutes,
          preferredDays,
          createdAt: new Date().toISOString(),
          overallProgress: 0,
          tasks: groqPlan.tasks || [],
          isGeneratedByGroq: true,
        };

        const existingPlans = getStoredPlans();
        const updatedPlans = [newPlan, ...existingPlans];
        setStoredPlans(updatedPlans);
        return newPlan;
      } catch (groqErr) {
        console.warn('Direct Groq fallback failed:', groqErr);
      }
    }

    // 3. Deterministic syllabus synthesis fallback
    const fallbackPlan = {
      id: `plan-${Date.now()}`,
      title: `${classLevel} ${subject}: ${chapter} (${effectiveDays} Days)`,
      classLevel,
      subject,
      chapter,
      days: effectiveDays,
      dailyStudyTime: effectiveStudyTime,
      dailyMinutes: effectiveMinutes,
      preferredDays,
      createdAt: new Date().toISOString(),
      overallProgress: 0,
      tasks: [
        {
          id: `task-${Date.now()}-1`,
          dayNumber: 1,
          scheduledFor: 'Day 1',
          title: `Study ${chapter} core concepts & Vedantu notes`,
          topic: chapter,
          topicPriority: 'High',
          activityType: 'Study',
          durationMinutes: Math.round(effectiveMinutes * 0.6),
          duration: `${Math.round(effectiveMinutes * 0.6)} mins`,
          status: 'pending',
          description: 'Read definitions, understand theorems, and review summary notes.',
          actionType: 'document',
          actionLabel: 'View Notes',
          actionTarget: '/documents',
        },
        {
          id: `task-${Date.now()}-2`,
          dayNumber: 1,
          scheduledFor: 'Day 1',
          title: `Practice foundational questions & examples`,
          topic: chapter,
          topicPriority: 'Medium',
          activityType: 'Practice',
          durationMinutes: Math.round(effectiveMinutes * 0.4),
          duration: `${Math.round(effectiveMinutes * 0.4)} mins`,
          status: 'pending',
          description: 'Solve introductory problems to cement understanding.',
          actionType: 'tutor',
          actionLabel: 'Consult AI Tutor',
          actionTarget: '/tutor',
        },
      ],
    };

    const existingPlans = getStoredPlans();
    const updatedPlans = [fallbackPlan, ...existingPlans];
    setStoredPlans(updatedPlans);
    return fallbackPlan;
  },

  /**
   * Toggle task completion status
   * Expected API: PATCH /api/v1/study-plans/:planId/tasks/:taskId
   */
  async toggleTaskStatus(planId, taskId) {
    try {
      const response = await apiClient.patch(`/study-plans/${planId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        const plans = getStoredPlans();
        const planIndex = plans.findIndex((p) => p.id === planId);
        if (planIndex === -1) return null;

        const plan = plans[planIndex];
        const task = plan.tasks.find((t) => t.id === taskId);
        if (!task) return plan;

        task.status = task.status === 'completed' ? 'pending' : 'completed';

        // Recalculate plan overall progress
        const completedCount = plan.tasks.filter((t) => t.status === 'completed').length;
        plan.overallProgress = Math.round((completedCount / plan.tasks.length) * 100);

        plans[planIndex] = { ...plan };
        setStoredPlans(plans);
        return plan;
      }
      throw error;
    }
  },
};

export default studyPlanService;
