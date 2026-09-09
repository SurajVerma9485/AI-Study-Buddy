# How IBM Bob Was Used in AI Study Buddy

This document describes how **IBM Bob** — IBM's AI SDLC (Software Development Lifecycle) partner — was used throughout the development of **AI Study Buddy**.

---

## What is IBM Bob?

IBM Bob is an AI coding assistant that augments the entire software development lifecycle. It operates inside the IDE with three built-in modes:

| Mode | Purpose |
|------|---------|
| **Agent** | Write, modify, and refactor code — implementing features and fixing bugs |
| **Plan** | Design architecture and create technical specifications before coding |
| **Ask** | Understand the codebase, get explanations, and answer questions without changing files |

Bob reads the live codebase, runs terminal commands, edits files with surgical precision, and tracks progress through a built-in todo system — all within the developer's IDE.

---

## How IBM Bob Was Used in This Project

### 1. Architecture Planning (Plan Mode)

Before writing a single line of code, Bob's **Plan mode** was used to design the full system architecture:

- Designed the **closed feedback loop** architecture: Quiz → Weak Topic Diagnosis → Study Plan → AI Tutor → Re-quiz
- Planned the **feature folder structure** (`features/ai-tutor`, `features/quizzes`, `features/study-plans`, `features/progress`) with clear separation of concerns
- Designed the **dual-layer fallback strategy**: Groq LLM → Backend API → Deterministic mock data — so the app works in all environments
- Planned the **conversation thread model** for the AI Tutor with per-course, per-thread message history
- Designed the **weakTopicsManager** data flow: how quiz results update a persistent cross-session weak topics store that feeds into study plan generation

---

### 2. Full-Stack Feature Implementation (Agent Mode)

Bob's **Agent mode** was used to implement every major feature in the project:

#### AI Tutor (`src/features/ai-tutor/`, `server/routes/aiTutor.js`)
- Built the complete AI Tutor backend route with 5 system prompt modes: `normal`, `eli10`, `detailed`, `exam`, `hint`
- Implemented Groq LLM integration with `callGroq()`, sliding 10-message context window, and reasoning-tag stripping (`<think>` tag removal)
- Built conversation thread management: create, list, delete threads per course, with in-memory store
- Implemented the `ChatWindow`, `ChatInput`, `MessageBubble`, `ModeSelector`, and `ConversationList` React components
- Built the graceful fallback system with mode-specific deterministic answers when the API key is unavailable

#### Quiz Engine (`src/features/quizzes/`)
- Implemented `quizService.generateQuiz()` with three-tier generation: Groq LLM → Backend API → Mock fallback
- Built `QuizAttemptPage` with real-time answer tracking, timer, and navigation between questions
- Implemented `completeAttempt()` with client-side scoring, topic breakdown calculation, and weak topic diagnosis
- Built `QuizResultPage` with per-topic performance breakdown and recommended next action
- Integrated `weakTopicsManager.updateFromQuizResult()` so every quiz attempt updates the persistent weak topics store

#### Weak Topics Manager (`src/services/weakTopicsManager.js`)
- Built the entire `weakTopicsManager` service: localStorage-based persistence, topic mastery scoring (< 75% = weak), real-time `CustomEvent` broadcasting across components
- Implemented automatic weak topic removal when a student scores ≥ 75% on a topic

#### Study Plan Generator (`src/features/study-plans/`)
- Implemented `studyPlanService.generateStudyPlan()` with Groq-powered personalized plan generation
- Built the day-by-day plan structure with `taskCard` components that deep-link to the AI Tutor or course documents
- Built `CreatePlanModal` with class/subject/chapter/days/study-time inputs

#### Progress Dashboard (`src/features/progress/`)
- Built `ProgressDashboardPage` with overall mastery cards, quiz history list, weak topic cards, and study activity timeline
- Implemented `CourseProgressPage` with per-topic mastery breakdown and performance charts

#### Authentication & Backend (`server/`, `src/features/auth/`)
- Implemented JWT-based auth flow: register, login, protected routes
- Built Express backend with PostgreSQL integration using the `pg` library
- Created all API route files: `auth.js`, `courses.js`, `quizzes.js`, `studyPlan.js`, `progress.js`

#### UI Component Library (`src/components/ui/`)
- Generated the full set of reusable UI components: `Button`, `Card`, `Badge`, `Input`, `Modal`, `ProgressBar`
- Built `AppLayout`, `Navbar`, and `Sidebar` with responsive design and theme support

---

### 3. Codebase Understanding & Debugging (Ask Mode)

Bob's **Ask mode** was used throughout development to:

- Understand how data flows from `quizService.completeAttempt()` → `weakTopicsManager` → `studyPlanService` without reading every file manually
- Diagnose why the quiz result page wasn't receiving the correct `topicPerformance` array — traced through `sessionStorage` caching logic
- Understand the Groq API's `choices[0].message.content` response shape before writing the parser
- Verify JWT token expiry handling in the Express middleware without re-reading the entire auth flow
- Cross-reference how `CourseContext` provides course data to nested feature components

---

### 4. Test Suite Generation (Agent Mode)

Bob generated the complete test suite in `src/test/`:

| Test File | What It Tests |
|-----------|--------------|
| `auth.test.jsx` | Login/Register form validation and auth context |
| `chat.test.jsx` | AI Tutor message sending, mode switching, conversation management |
| `quizzes.test.jsx` | Quiz generation, attempt flow, scoring, topic breakdown |
| `studyPlans.test.jsx` | Plan generation, task toggling, progress recalculation |
| `progress.test.jsx` | Mastery score display, weak topic cards, quiz history |
| `documents.test.jsx` | Document upload, processing status, list rendering |
| `courses.test.jsx` | Course listing, filtering, detail page rendering |
| `commonStates.test.jsx` | Loading, error, and empty state components |
| `groq.test.js` | Groq service configuration, model selection, API key validation |

---

### 5. Documentation & Code Comments (Agent Mode)

Bob wrote all JSDoc comments across service files, generated this document, and produced inline comments for complex logic such as:
- The 3-tier quiz generation fallback chain
- The `weakTopicsManager` mastery threshold logic
- The Groq message history windowing in `aiTutor.js`

---

## Key Bob Workflows Used

```
Plan Mode  →  Design closed-loop architecture & folder structure
Agent Mode →  Implement AI Tutor, Quiz Engine, Study Planner, Auth, UI
Ask Mode   →  Debug data flows, understand component relationships
Agent Mode →  Generate full Vitest test suite
Agent Mode →  Write documentation and inline comments
```

---

## Summary

IBM Bob was the primary development tool for this project — used from the first architecture sketch through to the final test suite. The **Plan → Agent → Ask** workflow enabled rapid, confident full-stack development of a complex multi-feature application. Bob's ability to read the live codebase, track multi-step todos, and switch between planning and implementation modes made it possible to build AI Study Buddy's closed-loop learning system with consistency and precision across all layers of the stack.
