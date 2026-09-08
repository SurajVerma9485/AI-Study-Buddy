import { MOCK_WEAK_TOPICS, MOCK_RECENT_QUIZZES } from './mockData';

const WEAK_TOPICS_STORAGE_KEY = 'study_buddy_course_weak_topics';
const QUIZ_HISTORY_STORAGE_KEY = 'study_buddy_quiz_history';

// Helper to safely load JSON from localStorage
function getStoredJson(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStoredJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage`, err);
  }
}

// Initial seed if not present
function initializeStore() {
  const existing = localStorage.getItem(WEAK_TOPICS_STORAGE_KEY);
  if (!existing) {
    // Seed initial mock weak topics with their course associations
    const initial = [
      {
        id: 'weak-1',
        courseId: 'course-cs420',
        courseCode: 'CS 420',
        topic: 'Concurrency Primitives & Deadlock',
        mastery: 35,
        trend: '-5% on recent quiz',
        sourceQuizTitle: 'Deadlock Detection & Concurrency Primitives',
        suggestedAction: 'Review with AI Tutor in ELI10 mode',
        actionTarget: '/courses/course-cs420/tutor',
        lastDiagnosed: '2 days ago',
      },
      {
        id: 'weak-2',
        courseId: 'course-cs301',
        courseCode: 'CS 301',
        topic: 'Logical Time & Vector Clocks',
        mastery: 42,
        trend: '-8% on recent quiz',
        sourceQuizTitle: 'Raft Consensus & Leader Election Practice',
        suggestedAction: 'Review Vector Clocks Document Chunks',
        actionTarget: '/courses/course-cs301/tutor',
        lastDiagnosed: 'Yesterday',
      },
      {
        id: 'weak-3',
        courseId: 'course-ai502',
        courseCode: 'AI 502',
        topic: 'Diffusion Models & Score Matching',
        mastery: 45,
        trend: 'New topic diagnosed',
        sourceQuizTitle: 'Self-Attention & Positional Encodings Check',
        suggestedAction: 'Start ELI10 Tutor Session',
        actionTarget: '/courses/course-ai502/tutor',
        lastDiagnosed: '4 days ago',
      },
    ];
    setStoredJson(WEAK_TOPICS_STORAGE_KEY, initial);
  }

  const existingHistory = localStorage.getItem(QUIZ_HISTORY_STORAGE_KEY);
  if (!existingHistory) {
    setStoredJson(QUIZ_HISTORY_STORAGE_KEY, MOCK_RECENT_QUIZZES);
  }
}

// Initialize immediately
initializeStore();

export const weakTopicsManager = {
  /**
   * Get weak topics filtered by courseId (or all if 'all' / null)
   */
  getWeakTopics(courseId = 'all') {
    initializeStore();
    const all = getStoredJson(WEAK_TOPICS_STORAGE_KEY, []);
    if (!courseId || courseId === 'all') {
      return all;
    }
    return all.filter((item) => item.courseId === courseId || item.courseCode === courseId);
  },

  /**
   * Get recent quiz history filtered by courseId (or all)
   */
  getQuizHistory(courseId = 'all') {
    initializeStore();
    const all = getStoredJson(QUIZ_HISTORY_STORAGE_KEY, []);
    if (!courseId || courseId === 'all') {
      return all;
    }
    return all.filter((item) => item.courseId === courseId || item.courseCode === courseId);
  },

  /**
   * Update weak topics and quiz history from a completed quiz evaluation
   */
  updateFromQuizResult(evaluation, quiz = null) {
    if (!evaluation) return;
    initializeStore();

    const courseId = quiz?.courseId || evaluation.courseId || 'course-cs301';
    const courseCode = quiz?.courseCode || evaluation.courseCode || 'GENERAL';
    const quizTitle = quiz?.title || evaluation.quizTitle || 'Practice Drill';
    const quizId = quiz?.id || evaluation.quizId || `quiz-${Date.now()}`;
    const percentage =
      evaluation.percentage ??
      Math.round(((evaluation.correctCount || 0) / Math.max(evaluation.totalQuestions || 1, 1)) * 100);

    // 1. Record in quiz history
    const history = getStoredJson(QUIZ_HISTORY_STORAGE_KEY, []);
    const newHistoryEntry = {
      id: evaluation.attemptId || `att-${Date.now()}`,
      quizId,
      courseId,
      courseCode,
      title: quizTitle,
      score: percentage,
      questionsCount: evaluation.totalQuestions || 5,
      difficulty: quiz?.difficulty || 'Medium',
      completedAt: 'Just now',
      type: quiz?.type || 'Diagnostic Quiz',
      timestamp: Date.now(),
    };
    // Put at top of history
    const updatedHistory = [newHistoryEntry, ...history.filter((h) => h.quizId !== quizId)].slice(0, 15);
    setStoredJson(QUIZ_HISTORY_STORAGE_KEY, updatedHistory);

    // 2. Identify topics evaluated in this quiz attempt
    const currentWeak = getStoredJson(WEAK_TOPICS_STORAGE_KEY, []);

    // Gather topic breakdown from explanations
    const topicScores = {};
    if (evaluation.explanations && Array.isArray(evaluation.explanations)) {
      evaluation.explanations.forEach((exp) => {
        const topic = (exp.topicName || quiz?.topicName || quizTitle).trim();
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 };
        }
        topicScores[topic].total++;
        if (exp.isCorrect) topicScores[topic].correct++;
      });
    }

    // Fallback to quiz-level topic
    if (Object.keys(topicScores).length === 0) {
      const fallbackTopic = (quiz?.topicName || quizTitle).trim();
      topicScores[fallbackTopic] = {
        correct: evaluation.correctCount ?? Math.round((percentage / 100) * (evaluation.totalQuestions || 5)),
        total: evaluation.totalQuestions || 5,
      };
    }

    // Check each topic
    let updatedWeakList = [...currentWeak];

    Object.entries(topicScores).forEach(([topicName, stats]) => {
      const topicScore = Math.round((stats.correct / stats.total) * 100);

      if (topicScore < 75) {
        // Concept Gap / Weak Topic diagnosed!
        const existingIdx = updatedWeakList.findIndex(
          (w) =>
            (w.courseId === courseId || w.courseCode === courseCode) &&
            w.topic.toLowerCase() === topicName.toLowerCase()
        );

        const weakItem = {
          id:
            existingIdx !== -1
              ? updatedWeakList[existingIdx].id
              : `weak-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          courseId,
          courseCode,
          topic: topicName,
          mastery: topicScore,
          trend: `${topicScore}% score in recent quiz (${stats.correct}/${stats.total} correct)`,
          sourceQuizTitle: quizTitle,
          sourceQuizId: quizId,
          suggestedAction: 'Review with AI Tutor in ELI10 mode',
          actionTarget: `/courses/${courseId}/tutor`,
          lastDiagnosed: 'Just now',
          timestamp: Date.now(),
        };

        if (existingIdx !== -1) {
          updatedWeakList[existingIdx] = weakItem;
        } else {
          updatedWeakList.unshift(weakItem);
        }
      } else {
        // High score (>= 75%)! Clear or remove this topic from weak topics for this course
        updatedWeakList = updatedWeakList.filter(
          (w) =>
            !(
              (w.courseId === courseId || w.courseCode === courseCode) &&
              w.topic.toLowerCase() === topicName.toLowerCase()
            )
        );
      }
    });

    setStoredJson(WEAK_TOPICS_STORAGE_KEY, updatedWeakList);

    // 3. Dispatch real-time window events
    window.dispatchEvent(
      new CustomEvent('study_buddy_quiz_updated', {
        detail: { courseId, courseCode, percentage, quizTitle },
      })
    );
  },

  /**
   * Subscribe to real-time updates
   */
  subscribe(callback) {
    const handleUpdate = (e) => {
      callback(e?.detail);
    };
    window.addEventListener('study_buddy_quiz_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('study_buddy_quiz_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  },
};

export default weakTopicsManager;
