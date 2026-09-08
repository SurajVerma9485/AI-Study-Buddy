import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.VITE_GROQ_MODEL || 'openai/gpt-oss-120b';

// Knowledge base from the provided Class 10 Maths PDF notes
const CHAPTER_NOTES_CONTEXT = {
  'Chapter 1 - Real Numbers': `
Chapter 1: Real Numbers (Class 10 Mathematics)
Key Concepts from Notes:
1. Real Numbers: Rational and irrational numbers together on the number line.
2. Euclid's Division Lemma: Given integers a and b, unique integers q and r exist such that a = b*q + r (0 <= r < b). Dividend = Divisor * Quotient + Remainder.
3. Euclid's Division Algorithm: Step-by-step method to compute Highest Common Factor (HCF) of two positive integers using repeated division until remainder is zero.
4. Fundamental Theorem of Arithmetic: Every natural number can be expressed as a unique product of prime numbers.
5. LCM & HCF Relation: HCF(a, b) * LCM(a, b) = a * b.
6. Irrational Numbers: Numbers that cannot be expressed as p/q. Proof by contradiction (e.g., proving sqrt(p) is irrational when p is prime).
7. Decimal Expansions of Rational Numbers: p/q terminates if denominator q = 2^n * 5^m (non-negative integers); otherwise non-terminating recurring.
`,
  'Chapter 2 - Polynomials': `
Chapter 2: Polynomials (Class 10 Mathematics)
Key Concepts from Notes:
1. Degree of Polynomial: Highest power of x in p(x). Linear (degree 1), Quadratic (degree 2), Cubic (degree 3).
2. Zeroes of a Polynomial: Real number k such that p(k) = 0.
3. Geometrical Meaning of Zeroes: Number of zeroes equals number of points where the graph cuts the x-axis (at most 2 for quadratic parabolas).
4. Relationship between Zeroes & Coefficients: For quadratic ax^2 + bx + c = 0 with zeroes alpha and beta:
   - Sum of zeroes (alpha + beta) = -b/a
   - Product of zeroes (alpha * beta) = c/a
5. Division Algorithm for Polynomials: p(x) = g(x)*q(x) + r(x), where r(x)=0 or degree(r(x)) < degree(g(x)).
6. Factoring by Splitting Middle Term: Finding factors of polynomials like x^2 - 2x - 3 = (x + 1)(x - 3).
`
};

/**
 * Strips reasoning tokens (<think>...</think>) from Groq reasoning models
 */
function stripReasoning(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Robust JSON extraction helper
 */
function extractJson(text) {
  if (!text) return null;
  const cleaned = stripReasoning(text);

  try {
    return JSON.parse(cleaned);
  } catch {}

  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {}
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  return null;
}

/**
 * Deterministic fallback plan generator if Groq is slow or offline
 */
function generateFallbackPlan({ classLevel, subject, chapter, days, studyTime, dailyMinutes }) {
  const chapterName = chapter || 'Chapter 1 - Real Numbers';
  const isCh1 = chapterName.toLowerCase().includes('real number');
  const numDays = Math.max(1, Math.min(parseInt(days, 10) || 5, 30));

  const daySchedules = [];
  const allTasks = [];

  for (let i = 1; i <= numDays; i++) {
    const dayLabel = `Day ${i}`;
    let bulletPoints = [];
    let dayTheme = '';

    if (numDays === 5) {
      if (i === 1) {
        dayTheme = 'Foundation & Core Concepts';
        bulletPoints = [
          `Learn ${chapterName} core concepts`,
          'Read textbook & NCERT revision notes',
          'Practice basic questions & definitions',
        ];
      } else if (i === 2) {
        dayTheme = 'Key Theorems & Methods';
        bulletPoints = [
          `Continue ${chapterName} deep dive`,
          isCh1 ? "Master Euclid's Division Lemma & Algorithm" : `Study core theorems and principles of ${chapterName}`,
          'Practice textbook examples step-by-step',
        ];
      } else if (i === 3) {
        dayTheme = 'Targeted Practice & Problem Solving';
        bulletPoints = [
          'Practice important exam-focused questions',
          isCh1 ? 'Solve HCF & LCM property problems' : `Practice application problems for ${chapterName}`,
          'Identify tricky edge cases and common mistakes',
        ];
      } else if (i === 4) {
        dayTheme = 'Advanced Problems & Exercise Drills';
        bulletPoints = [
          'Solve exercise questions independently',
          isCh1 ? 'Practice proof of irrationality (sqrt 2, sqrt 3)' : `Solve exercise problems and derivations for ${chapterName}`,
          'Review formula sheet and short notes',
        ];
      } else {
        dayTheme = 'Final Revision & Mock Test';
        bulletPoints = [
          `Comprehensive revision of all ${chapterName} concepts`,
          'Take full chapter practice test / quiz',
          'Review weak areas before exam day',
        ];
      }
    } else {
      // Generalized day distribution for arbitrary N days
      const progressRatio = (i - 1) / (numDays - 1 || 1);
      if (progressRatio <= 0.25) {
        dayTheme = 'Concept Learning & Notes';
        bulletPoints = [
          `Study ${chapterName} fundamentals`,
          'Read revision notes thoroughly',
          'Solve basic introductory problems',
        ];
      } else if (progressRatio <= 0.6) {
        dayTheme = 'Core Methods & Problem Solving';
        bulletPoints = [
          `Work on core problem types in ${chapterName}`,
          'Solve illustrative examples and derivations',
          'Practice medium-difficulty questions',
        ];
      } else if (progressRatio <= 0.85) {
        dayTheme = 'Advanced Exercises & Edge Cases';
        bulletPoints = [
          'Solve previous years questions (PYQs)',
          'Focus on speed and rigorous step-by-step solutions',
          'Self-evaluate and clear doubts',
        ];
      } else {
        dayTheme = 'Comprehensive Revision & Testing';
        bulletPoints = [
          `Full syllabus revision of ${chapterName}`,
          'Attempt timed mock quiz',
          'Consolidate summary notes and formulas',
        ];
      }
    }

    daySchedules.push({
      dayNumber: i,
      dayLabel,
      theme: dayTheme,
      bulletPoints,
      allocatedTime: studyTime,
    });

    // Create 2 actionable tasks per day
    allTasks.push({
      id: `task-d${i}-1`,
      dayNumber: i,
      scheduledFor: dayLabel,
      title: bulletPoints[0],
      topic: chapterName,
      topicPriority: i === numDays ? 'Critical' : i <= 2 ? 'High' : 'Medium',
      activityType: i === numDays ? 'Revision' : i % 2 === 0 ? 'Practice' : 'Study',
      durationMinutes: Math.round(dailyMinutes * 0.6),
      duration: `${Math.round(dailyMinutes * 0.6)} mins`,
      status: 'pending',
      description: bulletPoints.slice(0, 2).join(' • '),
      actionType: i === numDays ? 'quiz' : 'document',
      actionLabel: i === numDays ? 'Take Practice Quiz' : 'Study Notes',
      actionTarget: i === numDays ? '/quizzes' : '/documents',
    });

    allTasks.push({
      id: `task-d${i}-2`,
      dayNumber: i,
      scheduledFor: dayLabel,
      title: bulletPoints[1] || bulletPoints[0],
      topic: chapterName,
      topicPriority: 'Medium',
      activityType: i === numDays ? 'Quiz' : 'Practice',
      durationMinutes: Math.round(dailyMinutes * 0.4),
      duration: `${Math.round(dailyMinutes * 0.4)} mins`,
      status: 'pending',
      description: bulletPoints[2] || `Practice exercises for ${dayLabel}.`,
      actionType: 'tutor',
      actionLabel: 'Ask AI Tutor',
      actionTarget: '/tutor',
    });
  }

  return {
    id: `plan-${Date.now()}`,
    title: `${classLevel} ${subject}: ${chapterName} (${days} Days)`,
    classLevel,
    subject,
    chapter: chapterName,
    days: numDays,
    dailyStudyTime: studyTime,
    dailyMinutes,
    daySchedule: daySchedules,
    tasks: allTasks,
    overallProgress: 0,
    createdAt: new Date().toISOString(),
    isAiGenerated: true,
  };
}

/**
 * POST /api/v1/ai/study-plan
 * Generates personalized study plan using Groq API
 */
router.post('/study-plan', async (req, res) => {
  try {
    const {
      classLevel = 'Class 10',
      subject = 'Mathematics',
      chapter = 'Chapter 1 - Real Numbers',
      days = 5,
      studyTime = '2 hours/day',
      dailyMinutes = 120,
    } = req.body;

    const numDays = Math.max(1, Math.min(parseInt(days, 10) || 5, 30));
    const targetChapter = chapter || 'Chapter 1 - Real Numbers';
    const notesContext = CHAPTER_NOTES_CONTEXT[targetChapter] || `Standard CBSE / NCERT ${classLevel} ${subject} syllabus covering all core concepts, theorems, formulas, solved examples, NCERT exercise questions, and board exam preparation for ${targetChapter}.`;

    // If Groq API Key is configured, attempt high-precision LLM synthesis
    if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_')) {
      try {
        const prompt = `You are an expert curriculum designer and academic study coach.
Create a personalized ${numDays}-day revision study plan for a student based strictly on the provided syllabus notes.

Student Parameters:
- Class: ${classLevel}
- Subject: ${subject}
- Chapter/Lesson: ${targetChapter}
- Total Target Duration: ${numDays} Days (Finish syllabus in ${numDays} days)
- Daily Available Study Time: ${studyTime} (${dailyMinutes} minutes/day)

Source Curriculum Notes to include:
${notesContext}

Requirements:
1. Divide the syllabus across exactly ${numDays} days (Day 1 through Day ${numDays}).
2. For each day, provide:
   - dayNumber (1 to ${numDays})
   - dayLabel (e.g. "Day 1", "Day 2", ...)
   - theme (concise title of the day's objective)
   - bulletPoints (3-4 crisp, actionable bullet points showing what to learn, read, and practice on this day)
3. Also provide 2 structured tasks per day with:
   - title
   - activityType ("Study", "Practice", "Quiz", or "Revision")
   - durationMinutes (sum of tasks per day should equal ${dailyMinutes})
   - description

Output format: Return ONLY a single valid JSON object. No reasoning tags, no markdown backticks, no preamble.
JSON Schema:
{
  "title": "${classLevel} ${subject}: ${targetChapter} - ${numDays} Day Plan",
  "daySchedule": [
    {
      "dayNumber": 1,
      "dayLabel": "Day 1",
      "theme": "Concepts and Basic Questions",
      "bulletPoints": [
        "Learn Chapter 1 concepts",
        "Read notes",
        "Practice basic questions"
      ]
    }
  ],
  "tasks": [
    {
      "dayNumber": 1,
      "scheduledFor": "Day 1",
      "title": "Learn Chapter 1 concepts",
      "activityType": "Study",
      "durationMinutes": 60,
      "description": "Read definitions and understand Euclid's Lemma"
    }
  ]
}`;

        const groqResponse = await fetch(GROQ_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              {
                role: 'system',
                content: 'You are an expert educational study plan generator. Output strictly valid JSON.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 3500,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const rawContent = data.choices?.[0]?.message?.content;
          const parsed = extractJson(rawContent);

          if (parsed && Array.isArray(parsed.daySchedule) && parsed.daySchedule.length > 0) {
            const formattedPlan = {
              id: `plan-groq-${Date.now()}`,
              title: parsed.title || `${classLevel} ${subject}: ${targetChapter} (${numDays} Days)`,
              classLevel,
              subject,
              chapter: targetChapter,
              days: numDays,
              dailyStudyTime: studyTime,
              dailyMinutes,
              daySchedule: parsed.daySchedule,
              tasks: (parsed.tasks || []).map((t, idx) => ({
                id: `task-${idx + 1}`,
                dayNumber: t.dayNumber || Math.floor(idx / 2) + 1,
                scheduledFor: t.scheduledFor || `Day ${t.dayNumber || Math.floor(idx / 2) + 1}`,
                title: t.title,
                topic: targetChapter,
                topicPriority: (t.dayNumber === numDays) ? 'Critical' : 'High',
                activityType: t.activityType || 'Study',
                durationMinutes: t.durationMinutes || Math.round(dailyMinutes / 2),
                duration: `${t.durationMinutes || Math.round(dailyMinutes / 2)} mins`,
                status: 'pending',
                description: t.description || 'Master key syllabus milestones.',
                actionType: (t.activityType === 'Quiz' || t.dayNumber === numDays) ? 'quiz' : 'tutor',
                actionLabel: (t.activityType === 'Quiz' || t.dayNumber === numDays) ? 'Take Quiz' : 'Ask AI Tutor',
                actionTarget: (t.activityType === 'Quiz' || t.dayNumber === numDays) ? '/quizzes' : '/tutor',
              })),
              overallProgress: 0,
              createdAt: new Date().toISOString(),
              isAiGenerated: true,
              source: 'Groq API',
            };

            return res.json({
              success: true,
              plan: formattedPlan,
              message: 'Study plan successfully generated by Groq.',
            });
          }
        }
      } catch (groqErr) {
        console.warn('Groq generation encountered an error, using reliable fallback:', groqErr.message);
      }
    }

    // Fallback: Generate calibrated curriculum plan
    const fallbackPlan = generateFallbackPlan({
      classLevel,
      subject,
      chapter: targetChapter,
      days: numDays,
      studyTime,
      dailyMinutes,
    });

    return res.json({
      success: true,
      plan: fallbackPlan,
      message: 'Study plan generated successfully.',
    });
  } catch (error) {
    console.error('Study Plan API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate study plan.',
    });
  }
});

export default router;
