import { MOCK_WEAK_TOPICS, MOCK_RECENT_QUIZZES } from './mockData';
import { getUserStorageKey, getCurrentUserId } from './storageHelper';

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

function getWeakTopicsKey(userId = null) {
  return getUserStorageKey('course_weak_topics', userId);
}

function getQuizHistoryKey(userId = null) {
  return getUserStorageKey('quiz_history', userId);
}

// Initial seed if not present for current user
function initializeStore(userId = null) {
  const currentUid = userId || getCurrentUserId();
  const weakKey = getWeakTopicsKey(currentUid);
  const existingWeak = localStorage.getItem(weakKey);

  if (!existingWeak) {
    // If it's a demo or anonymous user, provide initial starter weak topics
    if (currentUid === '00000000-0000-0000-0000-000000000001' || currentUid === 'anonymous') {
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
      ];
      setStoredJson(weakKey, initial);
    } else {
      setStoredJson(weakKey, []);
    }
  }

  const historyKey = getQuizHistoryKey(currentUid);
  const existingHistory = localStorage.getItem(historyKey);
  if (!existingHistory) {
    if (currentUid === '00000000-0000-0000-0000-000000000001') {
      setStoredJson(historyKey, MOCK_RECENT_QUIZZES);
    } else {
      setStoredJson(historyKey, []);
    }
  }
}

export const weakTopicsManager = {
  /**
   * Get weak topics filtered by courseId (or all if 'all' / null) for the logged in user
   */
  getWeakTopics(courseId = 'all', userId = null) {
    const currentUid = userId || getCurrentUserId();
    initializeStore(currentUid);
    const all = getStoredJson(getWeakTopicsKey(currentUid), []);
    if (!courseId || courseId === 'all') {
      return all;
    }
    return all.filter((item) => item.courseId === courseId || item.courseCode === courseId);
  },

  /**
   * Get recent quiz history filtered by courseId (or all) for the logged in user
   */
  getQuizHistory(courseId = 'all', userId = null) {
    const currentUid = userId || getCurrentUserId();
    initializeStore(currentUid);
    const all = getStoredJson(getQuizHistoryKey(currentUid), []);
    if (!courseId || courseId === 'all') {
      return all;
    }
    return all.filter((item) => item.courseId === courseId || item.courseCode === courseId);
  },

  /**
   * Update weak topics and quiz history from a completed quiz evaluation
   */
  updateFromQuizResult(evaluation, quiz = null, userId = null) {
    if (!evaluation) return;
    const currentUid = userId || getCurrentUserId();
    initializeStore(currentUid);

    const courseId = quiz?.courseId || evaluation.courseId || 'course-cs301';
    const courseCode = quiz?.courseCode || evaluation.courseCode || 'GENERAL';
    const quizTitle = quiz?.title || evaluation.quizTitle || 'Practice Drill';
    const quizId = quiz?.id || evaluation.quizId || `quiz-${Date.now()}`;
    const percentage =
      evaluation.percentage ??
      Math.round(((evaluation.correctCount || 0) / Math.max(evaluation.totalQuestions || 1, 1)) * 100);

    // 1. Record in user-scoped quiz history
    const historyKey = getQuizHistoryKey(currentUid);
    const history = getStoredJson(historyKey, []);
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
    const updatedHistory = [newHistoryEntry, ...history.filter((h) => h.quizId !== quizId)].slice(0, 15);
    setStoredJson(historyKey, updatedHistory);

    // 2. Identify topics evaluated in this quiz attempt
    const weakKey = getWeakTopicsKey(currentUid);
    const currentWeak = getStoredJson(weakKey, []);

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

    if (Object.keys(topicScores).length === 0) {
      const fallbackTopic = (quiz?.topicName || quizTitle).trim();
      topicScores[fallbackTopic] = {
        correct: evaluation.correctCount ?? Math.round((percentage / 100) * (evaluation.totalQuestions || 5)),
        total: evaluation.totalQuestions || 5,
      };
    }

    let updatedWeakList = [...currentWeak];

    Object.entries(topicScores).forEach(([topicName, stats]) => {
      const topicScore = Math.round((stats.correct / stats.total) * 100);

      if (topicScore < 75) {
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
        updatedWeakList = updatedWeakList.filter(
          (w) =>
            !(
              (w.courseId === courseId || w.courseCode === courseCode) &&
              w.topic.toLowerCase() === topicName.toLowerCase()
            )
        );
      }
    });

    setStoredJson(weakKey, updatedWeakList);

    window.dispatchEvent(
      new CustomEvent('study_buddy_quiz_updated', {
        detail: { courseId, courseCode, percentage, quizTitle, userId: currentUid },
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
    window.addEventListener('study_buddy_user_changed', handleUpdate);

    return () => {
      window.removeEventListener('study_buddy_quiz_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('study_buddy_user_changed', handleUpdate);
    };
  },
};

export default weakTopicsManager;
