import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  groqService,
  stripReasoning,
  extractJson,
  GROQ_MODELS,
} from '../services/groqService';

describe('Groq LLM Service & Utilities Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. Groq service identifies configured API key starting with gsk_', () => {
    expect(groqService.isConfigured()).toBe(true);
    expect(groqService.getApiKey()).toMatch(/^gsk_/);
  });

  it('2. Groq service supports dynamic model selection and persistence', () => {
    expect(groqService.getModel()).toBe('openai/gpt-oss-120b');

    groqService.setModel('qwen/qwen3.6-27b');
    expect(groqService.getModel()).toBe('qwen/qwen3.6-27b');

    groqService.setModel('openai/gpt-oss-20b');
    expect(groqService.getModel()).toBe('openai/gpt-oss-20b');
  });

  it('3. stripReasoning removes <think> tags while preserving educational response', () => {
    const rawThinking = `<think>
1. Analyze user question
2. Formulate 5-point explanation
</think>
### Raft Consensus Protocol
Raft achieves consensus via leader election and log replication.`;

    const cleaned = stripReasoning(rawThinking);
    expect(cleaned).not.toContain('<think>');
    expect(cleaned).not.toContain('Analyze user question');
    expect(cleaned).toContain('### Raft Consensus Protocol');
    expect(cleaned).toContain('Raft achieves consensus via leader election');
  });

  it('4. extractJson parses direct JSON and markdown fenced JSON', () => {
    const rawFencedJson = `Here is your generated quiz:
\`\`\`json
{
  "title": "Distributed Systems Quiz",
  "questions": [
    {
      "id": "q-1",
      "question": "What is Raft?",
      "options": ["Consensus", "Database", "Compiler"],
      "correctAnswerIndex": 0
    }
  ]
}
\`\`\`
Hope this helps!`;

    const parsed = extractJson(rawFencedJson);
    expect(parsed).toBeDefined();
    expect(parsed.title).toBe('Distributed Systems Quiz');
    expect(parsed.questions).toHaveLength(1);
    expect(parsed.questions[0].correctAnswerIndex).toBe(0);
  });

  it('5. chatCompletion calls Groq endpoint with Bearer auth and payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'chatcmpl-test',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Vector clocks guarantee causal consistency across distributed nodes.',
            },
          },
        ],
      }),
    });
    global.fetch = mockFetch;

    const result = await groqService.chatCompletion({
      messages: [{ role: 'user', content: 'Explain vector clocks' }],
      model: 'openai/gpt-oss-120b',
    });

    expect(result).toBe('Vector clocks guarantee causal consistency across distributed nodes.');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer gsk_/),
        }),
      })
    );
  });

  it('6. generateTutorResponse generates grounded response with citations', async () => {
    vi.spyOn(groqService, 'chatCompletion').mockResolvedValue(
      'Raft election timeouts are randomized between 150ms and 300ms to avoid split votes.'
    );

    const course = { code: 'CS 301', name: 'Distributed Systems', topics: [{ title: 'Raft' }] };
    const response = await groqService.generateTutorResponse({
      course,
      question: 'How do election timeouts work?',
      mode: 'eli10',
    });

    expect(response.role).toBe('assistant');
    expect(response.content).toContain('Raft election timeouts');
    expect(response.mode).toBe('eli10');
    expect(response.sources).toHaveLength(1);
    expect(response.sources[0].documentName).toContain('CS-301');
  });

  it('7. generateQuiz generates and normalizes dynamic quiz questions', async () => {
    const mockQuizJson = JSON.stringify({
      title: 'CS 301: Raft Drill',
      questions: [
        {
          id: 'q-1',
          topicName: 'Consensus & Raft',
          type: 'MCQ',
          question: 'What triggers candidate election in Raft?',
          options: ['Heartbeat Timeout', 'User RPC', 'Leader Step Down', 'Disk Flush'],
          correctAnswerIndex: 0,
          explanation: 'A follower becomes candidate when its randomized heartbeat election timer expires.',
        },
      ],
    });

    vi.spyOn(groqService, 'chatCompletion').mockResolvedValue(mockQuizJson);

    const quiz = await groqService.generateQuiz({
      courseName: 'CS 301',
      topicName: 'Consensus & Raft',
      difficulty: 'Medium',
      questionCount: 1,
      type: 'MCQ',
    });

    expect(quiz.title).toBe('CS 301: Raft Drill');
    expect(quiz.questions).toHaveLength(1);
    expect(quiz.questions[0].options).toHaveLength(4);
    expect(quiz.questions[0].correctAnswerIndex).toBe(0);
  });

  it('8. generateStudyPlan creates actionable task schedule', async () => {
    const mockPlanJson = JSON.stringify({
      title: 'CS 301 Adaptive Mastery Sprint',
      tasks: [
        {
          id: 'task-1',
          title: 'Review Vector Clocks',
          topic: 'Logical Time',
          topicPriority: 'Critical',
          activityType: 'Weak-topic review',
          durationMinutes: 30,
          actionType: 'tutor',
        },
      ],
    });

    vi.spyOn(groqService, 'chatCompletion').mockResolvedValue(mockPlanJson);

    const plan = await groqService.generateStudyPlan({
      courseName: 'CS 301',
      examDate: '2026-10-15',
      dailyStudyMinutes: 60,
      weakTopics: ['Logical Time'],
    });

    expect(plan.title).toBe('CS 301 Adaptive Mastery Sprint');
    expect(plan.tasks).toHaveLength(1);
    expect(plan.tasks[0].topicPriority).toBe('Critical');
  });
});
