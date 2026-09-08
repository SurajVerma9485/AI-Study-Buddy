import apiClient from '../../../services/api';
import { MOCK_COURSES, MOCK_RECENT_QUIZZES } from '../../../services/mockData';
import { weakTopicsManager } from '../../../services/weakTopicsManager';

const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

// Generate simulated historical progress timeline data
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
 * Progress Service
 * Endpoints expected:
 * - GET /api/v1/courses/:id/progress
 * - GET /api/v1/courses/:id/weak-topics
 * - GET /api/v1/progress (Global progress across courses)
 */
export const progressService = {
  /**
   * Fetch learning progress for a specific course
   * Expected API: GET /api/v1/courses/:id/progress
   */
  async getCourseProgress(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') || ENABLE_MOCK_FALLBACK) {
        await new Promise((r) => setTimeout(r, 150));

        const savedCourses = (() => {
          try {
            const raw = localStorage.getItem('study_buddy_courses_data');
            return raw ? JSON.parse(raw) : MOCK_COURSES;
          } catch {
            return MOCK_COURSES;
          }
        })();

        const course =
          (savedCourses && savedCourses.find((c) => c.id === courseId)) ||
          MOCK_COURSES.find((c) => c.id === courseId) ||
          MOCK_COURSES[0];

        const courseQuizzes = weakTopicsManager.getQuizHistory(course.id);
        const weakTopics = weakTopicsManager.getWeakTopics(course.id);
        const topics = course.topics || [];

        const recentlyStudied = topics.slice(0, 3).map((t, idx) => ({
          id: `recent-${t.id}`,
          topicId: t.id,
          title: t.title,
          lastStudiedAt: idx === 0 ? 'Today, 2:30 PM' : idx === 1 ? 'Yesterday, 6:15 PM' : '3 days ago',
          timeSpent: idx === 0 ? '45 mins' : idx === 1 ? '30 mins' : '60 mins',
          activityType: idx === 0 ? 'Quiz' : idx === 1 ? 'AI Tutor' : 'Study',
          mastery: t.mastery,
        }));

        const studyActivity = [
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
          {
            id: 'act-3',
            type: 'Document Study',
            title: 'Read 48 document chunks & lecture notes',
            timestamp: 'Aug 30, 2026',
            durationMinutes: 65,
            score: null,
          },
          {
            id: 'act-4',
            type: 'Study Plan',
            title: 'Completed 2 daily study plan tasks',
            timestamp: 'Aug 29, 2026',
            durationMinutes: 45,
            score: null,
          },
        ];

        return {
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          overallMastery: course.progress || 74,
          questionsAttempted: 95,
          correctAnswers: 76,
          quizAccuracyPercentage: 80,
          quizzesCompletedCount: courseQuizzes.length || 4,
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
          recentlyStudiedTopics: recentlyStudied,
          studyActivity,
          progressOverTime: generateProgressTimeline(course.progress || 74),
          quizHistory: courseQuizzes.length > 0 ? courseQuizzes : MOCK_RECENT_QUIZZES.filter((q) => q.courseId === course.id),
        };
      }
      throw error;
    }
  },

  /**
   * Fetch weak topics for a specific course
   * Expected API: GET /api/v1/courses/:id/weak-topics
   */
  async getCourseWeakTopics(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/weak-topics`);
      return response.data;
    } catch (error) {
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') || ENABLE_MOCK_FALLBACK) {
        await new Promise((r) => setTimeout(r, 100));
        return weakTopicsManager.getWeakTopics(courseId);
      }
      throw error;
    }
  },

  /**
   * Fetch global learning progress across all enrolled courses
   * Expected API: GET /api/v1/progress
   */
  async getGlobalProgress() {
    try {
      const response = await apiClient.get('/progress');
      return response.data;
    } catch (error) {
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') || ENABLE_MOCK_FALLBACK) {
        await new Promise((r) => setTimeout(r, 150));

        const savedCourses = (() => {
          try {
            const raw = localStorage.getItem('study_buddy_courses_data');
            return raw ? JSON.parse(raw) : MOCK_COURSES;
          } catch {
            return MOCK_COURSES;
          }
        })();

        const coursesList = savedCourses && savedCourses.length > 0 ? savedCourses : MOCK_COURSES;

        const allTopics = coursesList.flatMap((c) =>
          (c.topics || []).map((t) => ({ ...t, courseId: c.id, courseCode: c.code, courseName: c.name }))
        );

        const weakTopics = weakTopicsManager.getWeakTopics('all');
        const quizHistory = weakTopicsManager.getQuizHistory('all');

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

        return {
          overallMastery: avgMastery,
          questionsAttempted: 240,
          correctAnswers: 192,
          quizAccuracyPercentage: 80,
          quizzesCompletedCount: quizHistory.length || 28,
          studyStreakDays: 14,
          totalStudyHours: 46.2,
          topicsMastery: allTopics,
          weakTopics,
          recentlyStudiedTopics: recentlyStudied,
          studyActivity,
          progressOverTime: generateProgressTimeline(avgMastery),
          quizHistory: quizHistory.length > 0 ? quizHistory : MOCK_RECENT_QUIZZES,
        };
      }
      throw error;
    }
  },
};

export default progressService;
