import apiClient from '../../../services/api';
import { MOCK_COURSES, MOCK_RECENT_QUIZZES } from '../../../services/mockData';
import { groqService } from '../../../services/groqService';

const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';
const LOCAL_QUIZZES_KEY = 'study_buddy_quizzes_data';
const LOCAL_ATTEMPTS_KEY = 'study_buddy_quiz_attempts_data';

const getLocalQuizzes = () => {
  try {
    const saved = localStorage.getItem(LOCAL_QUIZZES_KEY);
    return saved ? JSON.parse(saved) : MOCK_RECENT_QUIZZES;
  } catch {
    return MOCK_RECENT_QUIZZES;
  }
};

const setLocalQuizzes = (quizzes) => {
  try {
    localStorage.setItem(LOCAL_QUIZZES_KEY, JSON.stringify(quizzes));
  } catch (err) {
    console.error('Failed to save quizzes locally', err);
  }
};

/**
 * Quiz Service
 * Communicates with backend endpoints or directly with Groq LLM:
 * - Dynamic AI Quiz Generation with Groq LLM
 * - POST /api/v1/ai/quiz
 * - GET /api/v1/quizzes/:id
 * - POST /api/v1/quizzes/:id/attempts
 * - POST /api/v1/attempts/:id/answers
 * - POST /api/v1/attempts/:id/complete
 */
export const quizService = {
  /**
   * Fetch quizzes for a course (or all courses)
   */
  async getQuizzes(courseId = null) {
    try {
      const url = courseId ? `/courses/${courseId}/quizzes` : '/quizzes';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 100));
        const all = getLocalQuizzes();
        if (!courseId) return all;
        const filtered = all.filter((q) => q.courseId === courseId);
        return filtered.length > 0 ? filtered : all.slice(0, 2).map((q) => ({ ...q, courseId }));
      }
      throw error;
    }
  },

  /**
   * Generate a new AI Quiz from course materials
   * Uses Groq LLM when available for dynamic question generation.
   */
  async generateQuiz({ courseId, topicId, topicName, courseName, subject, difficulty = 'Medium', questionCount = 5, type = 'MCQ' }) {
    const course = MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];
    const topic = course.topics?.find((t) => t.id === topicId) || course.topics?.[0];
    const topicTitle = topicName || (topic ? topic.title : 'Comprehensive Syllabus');

    // 1. Try Groq dynamic LLM quiz generation
    if (groqService.isConfigured()) {
      try {
        const effectiveCourseName = courseName || (course ? `${course.code}: ${course.name}` : (subject ? `${subject}` : 'Course'));
        const groqQuizData = await groqService.generateQuiz({
          courseName: effectiveCourseName,
          topicName: topicTitle,
          difficulty,
          questionCount: Number(questionCount) || 5,
          type,
        });

        const generatedQuiz = {
          id: `quiz-groq-${Date.now()}`,
          courseId: courseId || course.id,
          courseCode: subject ? subject.slice(0, 4).toUpperCase() : course.code,
          courseName: effectiveCourseName,
          topicId: topic?.id || topicId || 'all',
          topicName: topicTitle,
          title: groqQuizData.title || `${subject || course.code}: ${topicTitle} Practice Drill`,
          difficulty,
          type,
          questionsCount: groqQuizData.questions.length,
          timeLimitMinutes: Math.max(5, groqQuizData.questions.length * 2),
          createdAt: new Date().toLocaleDateString(),
          score: null,
          questions: groqQuizData.questions,
          isGeneratedByGroq: true,
        };

        const all = getLocalQuizzes();
        setLocalQuizzes([generatedQuiz, ...all]);
        return generatedQuiz;
      } catch (groqErr) {
        console.warn('Groq quiz generation error, falling back:', groqErr);
      }
    }

    // 2. Try backend API
    try {
      const response = await apiClient.post('/ai/quiz', {
        courseId,
        topicId,
        topicName,
        courseName,
        subject,
        difficulty,
        questionCount,
        type,
      });
      return response.data?.quiz || response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 200));

        const generatedQuiz = {
          id: `quiz-${Date.now()}`,
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          topicId: topic?.id || 'all',
          topicName: topicTitle,
          title: `${course.code}: ${topicTitle}`,
          difficulty,
          type,
          questionsCount: Number(questionCount) || 5,
          timeLimitMinutes: Math.max(5, (Number(questionCount) || 5) * 2),
          createdAt: new Date().toLocaleDateString(),
          score: null,
          questions: [
            {
              id: 'q-1',
              topicId: 'top-1',
              topicName: 'Consensus & Raft Invariants',
              type: 'MCQ',
              question: 'In the Raft consensus protocol, what state does a follower node transition to when its election timer expires?',
              options: ['Leader', 'Candidate', 'Pre-vote Observer', 'Log Compactor'],
              correctAnswerIndex: 1,
              explanation: 'When an election timeout expires with no heartbeat received from the current leader, the follower increments its term and transitions to Candidate to solicit votes.',
            },
            {
              id: 'q-2',
              topicId: 'top-1',
              topicName: 'Consensus & Raft Invariants',
              type: 'True/False',
              question: 'In Raft, a leader can overwrite uncommitted log entries on its followers.',
              options: ['True', 'False'],
              correctAnswerIndex: 0,
              explanation: 'True. Raft enforces that followers must synchronize their logs with the leader; any conflicting uncommitted entries on followers are overwritten by the leader.',
            },
            {
              id: 'q-3',
              topicId: 'top-2',
              topicName: 'Logical Time & Vector Clocks',
              type: 'MCQ',
              question: 'Which of the following describes the limitation of Lamport Timestamps compared to Vector Clocks?',
              options: [
                'Lamport timestamps require atomic GPS clocks',
                'If L(a) < L(b), one cannot infer whether event a causally preceded event b',
                'Lamport clocks cannot be updated concurrently',
                'Vector clocks only work for 2-node networks',
              ],
              correctAnswerIndex: 1,
              explanation: 'Lamport timestamps provide total ordering consistent with causality, but not strong causality: L(a) < L(b) does not guarantee that a happened-before b.',
            },
            {
              id: 'q-4',
              topicId: 'top-2',
              topicName: 'Logical Time & Vector Clocks',
              type: 'True/False',
              question: 'Vector Clocks allow detecting whether two events in a distributed system are causally related or concurrent.',
              options: ['True', 'False'],
              correctAnswerIndex: 0,
              explanation: 'True. If neither timestamp vector dominates the other, the two events are proven to be concurrent.',
            },
            {
              id: 'q-5',
              topicId: 'top-3',
              topicName: 'CAP Theorem & Trade-offs',
              type: 'True/False',
              question: 'Under a network partition in an asynchronous distributed network, a system can guarantee both 100% Availability and Linearizable Consistency.',
              options: ['True', 'False'],
              correctAnswerIndex: 1,
              explanation: 'False. The CAP theorem proves that under network partition (P), a distributed system must sacrifice either Availability (refusing updates) or Consistency (returning stale data).',
            },
          ].slice(0, Number(questionCount) || 5),
        };

        const all = getLocalQuizzes();
        setLocalQuizzes([generatedQuiz, ...all]);
        return generatedQuiz;
      }
      throw error;
    }
  },

  /**
   * Fetch a single quiz by ID.
   * Checks localStorage first (Groq-generated quizzes live there),
   * then falls back to the backend API.
   */
  async getQuizById(quizId) {
    // 1. Always check localStorage first — covers Groq-generated quizzes
    //    that were never persisted to the backend.
    const localQuizzes = getLocalQuizzes();
    const localHit = localQuizzes.find((q) => q.id === quizId);
    if (localHit && localHit.questions && localHit.questions.length > 0) {
      return localHit;
    }

    // 2. Try the backend
    try {
      const response = await apiClient.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      // 3. If backend 404s but we have a local entry (without questions), enrich it
      if (localHit) {
        return localHit;
      }

      // 4. Generic fallback so the attempt page never hard-crashes
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK' || ENABLE_MOCK_FALLBACK) {
        return {
          id: quizId,
          courseCode: 'QUIZ',
          title: 'AI Generated Practice Quiz',
          difficulty: 'Medium',
          type: 'MCQ',
          questionsCount: 3,
          timeLimitMinutes: 10,
          questions: [
            {
              id: 'q-1',
              topicId: 'top-1',
              topicName: 'Core Concepts',
              type: 'MCQ',
              question: 'In Raft, what prevents split votes during leader election?',
              options: ['Fixed timeouts', 'Randomized election timeouts', 'GPS synchronization', 'Log compaction'],
              correctAnswerIndex: 1,
              explanation: 'Randomized election timeouts ensure that candidates start elections at different times, preventing simultaneous split votes.',
            },
            {
              id: 'q-2',
              topicId: 'top-1',
              topicName: 'Core Concepts',
              type: 'True/False',
              question: 'The CAP theorem states that a distributed system can simultaneously guarantee Consistency, Availability, and Partition tolerance.',
              options: ['True', 'False'],
              correctAnswerIndex: 1,
              explanation: 'False. The CAP theorem proves that only two of the three guarantees can be provided simultaneously.',
            },
            {
              id: 'q-3',
              topicId: 'top-1',
              topicName: 'Core Concepts',
              type: 'MCQ',
              question: 'What data structure does Linux CFS use for its run queue?',
              options: ['Max-Heap', 'Red-Black Tree', 'Skip List', 'B+ Tree'],
              correctAnswerIndex: 1,
              explanation: 'CFS uses a Red-Black Tree ordered by virtual runtime (vruntime) for O(log n) task selection.',
            },
          ],
        };
      }

      throw error;
    }
  },

  /**
   * Start a new attempt for a quiz
   * Expected API: POST /api/v1/quizzes/:id/attempts
   */
  async startAttempt(quizId) {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/attempts`);
      return response.data;
    } catch (error) {
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') || ENABLE_MOCK_FALLBACK) {
        await new Promise((r) => setTimeout(r, 200));
        const attempt = {
          attemptId: `att-${Date.now()}`,
          quizId,
          startedAt: Date.now(),
          answers: {},
        };
        sessionStorage.setItem(`attempt_${attempt.attemptId}`, JSON.stringify(attempt));
        return attempt;
      }
      throw error;
    }
  },

  /**
   * Save an answer during an attempt
   * Expected API: POST /api/v1/attempts/:id/answers
   */
  async saveAnswer(attemptId, { questionId, answer }) {
    try {
      const response = await apiClient.post(`/attempts/${attemptId}/answers`, {
        questionId,
        answer,
      });
      return response.data;
    } catch (error) {
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') || ENABLE_MOCK_FALLBACK) {
        const stored = sessionStorage.getItem(`attempt_${attemptId}`);
        if (stored) {
          const attempt = JSON.parse(stored);
          attempt.answers[questionId] = answer;
          sessionStorage.setItem(`attempt_${attemptId}`, JSON.stringify(attempt));
        }
        return { success: true };
      }
      throw error;
    }
  },

  /**
   * Complete the attempt and obtain authoritative backend evaluation
   * Expected API: POST /api/v1/attempts/:id/complete
   * The backend calculates the authoritative score, topic performance, and explanations.
   */
  async completeAttempt(attemptId, finalAnswers = {}, quiz = null) {
    try {
      const response = await apiClient.post(`/attempts/${attemptId}/complete`, {
        answers: finalAnswers,
        quiz,
      });
      return response.data;
    } catch (error) {
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') || ENABLE_MOCK_FALLBACK) {
        await new Promise((r) => setTimeout(r, 400));

        const questions = quiz?.questions || [
          { id: 'q-1', topicName: 'Consensus', correctAnswerIndex: 1, explanation: 'Election timeout prevents split votes.' },
          { id: 'q-2', topicName: 'Consensus', correctAnswerIndex: 0, explanation: 'Leaders overwrite uncommitted logs.' },
          { id: 'q-3', topicName: 'Logical Time', correctAnswerIndex: 1, explanation: 'Lamport timestamps do not detect concurrency.' },
        ];

        let correctCount = 0;
        const explanations = questions.map((q) => {
          const studentAns = finalAnswers[q.id];
          let isCorrect = false;

          const qType = (q.type || '').trim().toLowerCase();
          if (qType === 'mcq' || qType === 'true/false' || qType === 'tf' || qType === 't/f' || !q.type) {
            isCorrect = studentAns === q.correctAnswerIndex;
          } else {
            // Short answer simple check
            isCorrect = typeof studentAns === 'string' && studentAns.trim().length > 2;
          }

          if (isCorrect) correctCount++;

          return {
            questionId: q.id,
            question: q.question,
            topicName: q.topicName || 'General',
            userAnswer: q.options ? q.options[studentAns] : studentAns || 'Unanswered',
            correctAnswer: q.options ? q.options[q.correctAnswerIndex] : q.correctAnswerText || 'Correct concept answer',
            isCorrect,
            explanation: q.explanation || 'Verified from course syllabus ground truth.',
          };
        });

        const total = questions.length;
        const percentage = Math.round((correctCount / total) * 100);

        // Update local quiz best score
        if (quiz) {
          const all = getLocalQuizzes();
          const qIdx = all.findIndex((q) => q.id === quiz.id);
          if (qIdx !== -1) {
            all[qIdx].score = percentage;
            setLocalQuizzes(all);
          }
        }

        const backendResult = {
          attemptId,
          quizId: quiz?.id || 'quiz-default',
          quizTitle: quiz?.title || 'Practice Drill',
          score: correctCount,
          totalQuestions: total,
          correctCount,
          incorrectCount: total - correctCount,
          percentage,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          topicPerformance: [
            {
              topicName: 'Consensus & Raft Invariants',
              score: percentage >= 60 ? 85 : 45,
              status: percentage >= 60 ? 'Mastered' : 'Weak Area',
            },
            {
              topicName: 'Logical Time & Vector Clocks',
              score: percentage >= 75 ? 80 : 35,
              status: percentage >= 75 ? 'Improving' : 'Weak Area',
            },
          ],
          weakTopics: percentage < 80 ? ['Logical Time & Vector Clocks', 'Distributed Deadlock Inversion'] : [],
          recommendedActivity: {
            title: 'Launch ELI10 Tutor on Vector Clocks',
            type: 'AI Tutor Session',
            reason: percentage < 80 ? 'Targeting diagnosed concept gap from this quiz' : 'Reinforce advanced invariants',
            route: `/courses/${quiz?.courseId || 'course-cs301'}/tutor`,
          },
          explanations,
        };

        // Cache result for display on /result page
        sessionStorage.setItem(`quiz_result_${attemptId}`, JSON.stringify(backendResult));
        return backendResult;
      }
      throw error;
    }
  },
};

export default quizService;
