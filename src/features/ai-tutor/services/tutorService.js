import apiClient from '../../../services/api';
import { MOCK_COURSES, MOCK_DOCUMENTS } from '../../../services/mockData';
import { groqService } from '../../../services/groqService';

const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';
const LOCAL_CONVERSATIONS_KEY = 'study_buddy_conversations_data';

// Helper to get local conversation threads
const getLocalConversations = (courseId) => {
  try {
    const saved = localStorage.getItem(`${LOCAL_CONVERSATIONS_KEY}_${courseId}`);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error('Failed to read local conversations', err);
  }

  // Default initial thread with sample grounded conversation
  const defaultThreads = [
    {
      id: `conv-${courseId}-1`,
      courseId,
      title: 'Consensus & Raft Invariants',
      createdAt: 'Today, 2:15 PM',
      messages: [
        {
          id: 'msg-init-1',
          role: 'assistant',
          content: 'Hello! I am your AI Study Buddy powered by Groq LLM. Every answer I generate is directly verified and retrieved from your uploaded course materials and syllabus. What would you like to explore?',
          mode: 'normal',
          sources: [],
          createdAt: '2:15 PM',
        },
        {
          id: 'msg-init-2',
          role: 'user',
          content: 'How does leader election prevent split votes in Raft?',
          createdAt: '2:16 PM',
        },
        {
          id: 'msg-init-3',
          role: 'assistant',
          content: `In the **Raft consensus algorithm**, split votes are prevented primarily through **randomized election timeouts** (typically between 150ms and 300ms).\n\nWhen multiple followers become candidates simultaneously:\n1. Randomized timeouts ensure that one candidate's election timer almost always expires first.\n2. The first candidate increments its current term and broadcasts RequestVote RPCs.\n3. Each server votes on a first-come, first-served basis for at most one candidate per term.\n4. If a split vote does occur, the election times out and a new randomized election is triggered, quickly breaking the tie.`,
          mode: 'normal',
          sources: [
            {
              documentName: 'Lecture-04-Raft-Consensus.pdf',
              chunkIndex: 18,
              pageNumber: 8,
              snippet: 'Section 5.2: Leader election uses randomized election timeouts to ensure that split-vote ties are rare and quickly resolved.',
              relevanceScore: '96%',
            },
          ],
          createdAt: '2:16 PM',
        },
      ],
    },
  ];

  try {
    localStorage.setItem(`${LOCAL_CONVERSATIONS_KEY}_${courseId}`, JSON.stringify(defaultThreads));
  } catch {}
  return defaultThreads;
};

const setLocalConversations = (courseId, threads) => {
  try {
    localStorage.setItem(`${LOCAL_CONVERSATIONS_KEY}_${courseId}`, JSON.stringify(threads));
  } catch (err) {
    console.error('Failed to save conversations locally', err);
  }
};

/**
 * AI Tutor Service
 * Communicates with backend endpoints or directly with Groq LLM:
 * - Direct Groq LLM inference with live streaming
 * - POST /api/v1/ai/chat (Supports streaming SSE or JSON)
 * - GET /api/v1/ai/conversations
 * - DELETE /api/v1/ai/conversations/:id
 */
export const tutorService = {
  /**
   * Fetch conversation threads for a course
   */
  async getConversations(courseId) {
    try {
      const response = await apiClient.get(`/ai/conversations?courseId=${courseId}`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        await new Promise((r) => setTimeout(r, 100));
        return getLocalConversations(courseId);
      }
      throw error;
    }
  },

  /**
   * Send message to AI Tutor and handle response (with optional streaming callback)
   * If Groq API Key is configured, uses direct high-speed Groq LLM inference.
   */
  async sendMessage({ courseId, conversationId, message, mode = 'normal' }, onStreamChunk = null) {
    // 1. Check if direct Groq LLM is available
    if (groqService.isConfigured()) {
      try {
        const course = MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];
        const threads = getLocalConversations(courseId);
        const currentThread = threads.find((t) => t.id === conversationId);
        const history = currentThread?.messages || [];

        const aiResponse = await groqService.generateTutorResponse({
          course,
          question: message,
          conversationHistory: history,
          mode,
          onStreamChunk,
        });

        // Attach conversation ID
        aiResponse.conversationId = conversationId;

        // Persist locally
        const threadIndex = threads.findIndex((t) => t.id === conversationId);
        if (threadIndex !== -1) {
          threads[threadIndex].messages.push(
            { id: `usr-${Date.now()}`, role: 'user', content: message, createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            aiResponse
          );
          setLocalConversations(courseId, threads);
        }

        return aiResponse;
      } catch (groqErr) {
        console.warn('Groq LLM error, attempting backend or fallback:', groqErr);
      }
    }

    // 2. Try backend endpoint
    try {
      const response = await apiClient.post('/ai/chat', {
        courseId,
        conversationId,
        message,
        mode,
      });

      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        // Find attached course name for tailored grounded answers
        const course = MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];
        const doc = MOCK_DOCUMENTS.find((d) => d.courseId === courseId) || MOCK_DOCUMENTS[0];

        let content = '';
        if (mode === 'eli10') {
          content = `Imagine you and your friends want to pick a team leader in a playground game! 🎈\n\nRaft gives everyone an alarm clock set to random seconds. Whoever's alarm rings first jumps up and shouts: "Can I be the leader?" If more than half your friends raise their hands, you win! Because everyone's clock rings at different times, two kids almost never shout at the same time. That's how it avoids ties!`;
        } else if (mode === 'detailed') {
          content = `### Deep Technical Analysis: Grounded in ${doc.fileName}\n\nUnder asynchronous network assumptions, consensus protocols require safety invariants ($L_{safe}$) that hold across network partitions:\n\n1. **Randomized Election Timeouts**: Chosen uniformly from $[T, 2T]$ (where $T \\approx 150\\text{ms}$). This guarantees that the probability of split votes approaches zero exponentially with term count.\n2. **Log Completeness Invariant**: A voter denies a vote if the candidate's last log entry has a lower term or shorter index ($\\text{term}_{cand} < \\text{term}_{voter} \\lor (\\text{term}_{cand} = \\text{term}_{voter} \\land \\text{index}_{cand} < \\text{index}_{voter})$).\n3. **Leader Append-Only Guarantee**: Once committed on a majority of nodes, an entry cannot be overwritten by subsequent terms.`;
        } else if (mode === 'exam') {
          content = `### Exam Marking Scheme Answer (5 Marks)\n\n**Question Reference**: Explain leader election mechanism and split-vote mitigation.\n\n- **Part A: Timeout Mechanism (2 Marks)**: Nodes transition from Follower to Candidate if no heartbeat is received within randomized timeout interval $[T, 2T]$.\n- **Part B: Quorum Majority (2 Marks)**: A candidate must obtain votes from a strict majority ($N/2 + 1$) of nodes in the cluster.\n- **Part C: Split-Vote Resolution (1 Mark)**: In the rare event of equal split votes, the term expires without a leader and a new term begins with fresh randomized timeouts.`;
        } else if (mode === 'hint') {
          content = `Here is a guided hint to test your understanding:\n\n💡 *Hint*: Think about what triggers a follower to become a candidate in the first place. What happens if two nodes simultaneously start an election? Which random parameter did the designers introduce to prevent these nodes from staying in lockstep?`;
        } else {
          content = `Based on your course materials for **${course.code}: ${course.name}**:\n\nThe system enforces consensus through strict majority voting and randomized timeouts. The leader maintains an append-only log that replicates state machine commands to followers, guaranteeing linearizable consistency across all active nodes.`;
        }

        const sources = [
          {
            documentName: doc.fileName,
            chunkIndex: Math.floor(Math.random() * 20) + 1,
            pageNumber: Math.floor(Math.random() * 8) + 1,
            snippet: `Excerpt from ${doc.fileName}: 'Consensus requires establishing consistent state machine replicates over asynchronous packet networks while handling up to F failures in 2F+1 nodes.'`,
            relevanceScore: '94%',
          },
        ];

        // Simulate streaming tokens if callback provided
        if (onStreamChunk) {
          const words = content.split(' ');
          let accumulated = '';
          for (let i = 0; i < words.length; i++) {
            await new Promise((r) => setTimeout(r, 20));
            accumulated += (i > 0 ? ' ' : '') + words[i];
            onStreamChunk(accumulated);
          }
        } else {
          await new Promise((r) => setTimeout(r, 300));
        }

        const aiResponse = {
          id: `msg-${Date.now()}`,
          conversationId,
          role: 'assistant',
          content,
          mode,
          sources,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Persist locally
        const threads = getLocalConversations(courseId);
        const threadIndex = threads.findIndex((t) => t.id === conversationId);
        if (threadIndex !== -1) {
          threads[threadIndex].messages.push(
            { id: `usr-${Date.now()}`, role: 'user', content: message, createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            aiResponse
          );
          setLocalConversations(courseId, threads);
        }

        return aiResponse;
      }

      const msg = error.response?.data?.message || error.message || 'Failed to generate tutor response.';
      throw new Error(msg);
    }
  },

  /**
   * Create a new conversation thread for a course
   */
  async createConversation(courseId, title = 'New Doubt Discussion') {
    try {
      const response = await apiClient.post('/ai/conversations', { courseId, title });
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        const newThread = {
          id: `conv-${courseId}-${Date.now()}`,
          courseId,
          title,
          createdAt: 'Just now',
          messages: [
            {
              id: `msg-welcome-${Date.now()}`,
              role: 'assistant',
              content: `Hello! I am ready to assist you with this course. Ask any question, choose an explanation mode (such as ELI10 or Exam style), and I will retrieve answers grounded in your course materials.`,
              mode: 'normal',
              sources: [],
              createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
        const threads = getLocalConversations(courseId);
        const updated = [newThread, ...threads];
        setLocalConversations(courseId, updated);
        return newThread;
      }
      throw error;
    }
  },

  /**
   * Delete a conversation thread
   */
  async deleteConversation(courseId, conversationId) {
    try {
      await apiClient.delete(`/ai/conversations/${conversationId}`);
    } catch (error) {
      if (ENABLE_MOCK_FALLBACK && (!error.response || error.code === 'ERR_NETWORK')) {
        const threads = getLocalConversations(courseId);
        const updated = threads.filter((t) => t.id !== conversationId);
        setLocalConversations(courseId, updated);
        return { success: true };
      }
      throw error;
    }
  },
};

export default tutorService;
