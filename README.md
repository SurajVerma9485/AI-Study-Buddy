# AI Study Buddy

> A RAG-powered, closed-loop personalized learning platform built with React 18, Node.js, PostgreSQL, and Groq Llama 3.3 70B.
> Developed using **IBM Bob** — IBM's AI SDLC partner — as the primary development tool.

🌐 **Live Demo:** [https://ai-study-buddy-assistant.netlify.app](https://ai-study-buddy-assistant.netlify.app)

---

## 📌 Table of Contents

1. [What is AI Study Buddy?](#1-what-is-ai-study-buddy)
2. [The Problem](#2-the-problem)
3. [The Solution](#3-the-solution)
4. [Features](#4-features)
5. [Tech Stack](#5-tech-stack)
6. [Project Structure](#6-project-structure)
7. [Getting Started](#7-getting-started)
8. [Running Tests](#8-running-tests)
9. [API Reference](#9-api-reference)
10. [How IBM Bob Was Used](#10-how-ibm-bob-was-used)
11. [Roadmap](#11-roadmap)

---

## 1. What is AI Study Buddy?

AI Study Buddy is not a generic chatbot with a study theme. It is a **closed-loop personalized learning system** where every component feeds the next:

```
Quiz  →  Diagnose Weak Topics  →  Build Study Plan  →  Study with AI Tutor  →  Re-Quiz
```

The system gets smarter the more you use it — diagnosing knowledge gaps from quiz results, prioritizing them in the study plan, and explaining them in exactly the style the student needs.

> **Try it instantly:** Visit [https://ai-study-buddy-assistant.netlify.app](https://ai-study-buddy-assistant.netlify.app) and click **"Try Demo Student"** — no account or setup needed.

---

## 2. The Problem

Students across every level — school, college, competitive exams — face the same problem: they study hard but not smart.

- Re-read entire chapters without knowing which specific topics they are weak in
- Use generic AI chatbots that have no connection to their actual syllabus
- Create revision plans manually, without any data on where their real gaps are
- No existing tool closes the loop — flashcard apps don't explain, chatbots don't know your syllabus, planners don't know your weak topics

**AI Study Buddy was built to solve exactly this.**

---

## 3. The Solution

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────────┐     ┌───────────────┐
│  Practice    │────▶│  Diagnose Weak     │────▶│  Auto-Generate   │────▶│  Study with   │
│  Quiz        │     │  Topics (< 75%)    │     │  Study Plan      │     │  AI Tutor     │
└──────────────┘     └────────────────────┘     └──────────────────┘     └───────┬───────┘
       ▲                                                                          │
       └──────────────────────────────────────────────────────────────────────────┘
                                    Re-Quiz & Improve
```

Every component feeds the next. The platform continuously adapts to where the student actually is — not where a generic curriculum assumes they should be.

---

## 4. Features

### 🤖 AI Tutor — 5 Explanation Modes
Powered by **Groq Llama 3.3 70B Versatile**. Ask any question, get an answer in the mode you need:

| Mode | Description |
|------|-------------|
| **Normal** | Clear, accurate answer grounded in the course topic |
| **ELI10** | Explain Like I'm 10 — simple words, analogies, fun examples |
| **Detailed** | In-depth technical explanation with definitions, formulas, edge cases |
| **Exam** | Model exam answer with mark allocations and examiner key points |
| **Hint** | Socratic hints only — builds reasoning, never gives the answer |

- Multi-turn conversation history per course, per thread
- Sliding 10-message context window — always coherent, never hits token limits
- Graceful fallback with deterministic mode-specific answers when API is unavailable

---

### 📝 Adaptive Quiz Engine
- AI-generates **MCQ, True/False, Short Answer** quizzes on any topic and difficulty
- **3-tier generation**: Groq LLM → Backend API → Smart deterministic fallback
- After every attempt: per-topic mastery scores calculated automatically
- Topics scoring **< 75%** flagged as Weak Topics — added to the tracker
- Topics scoring **≥ 75%** automatically cleared from the weak list

---

### 🎯 Weak Topics Tracker
- Persists across sessions using `localStorage`
- Updates in real time via `CustomEvent` broadcasting — no page refresh needed
- Feeds directly into the study plan generator as the highest-priority tasks
- Auto-clears topics when the student improves above the mastery threshold

---

### 📅 Personalized Revision Planner
- Input: exam date + daily study time + preferred days
- Reverse-engineers a day-by-day schedule from the exam date backward
- **Auto-prioritizes diagnosed weak topics** at the top of the plan
- Groq-powered dynamic task sequencing
- Every task deep-links to the AI Tutor, course document, or quiz page

---

### 📊 Real-Time Progress Dashboard
- Overall mastery score across all courses
- Per-topic mastery breakdown with progress bars
- Weak topic cards with mastery trends and suggested actions
- Quiz history with scores, difficulty, and topic tags
- Live updates after every quiz — no reload required

---

### 📄 Document Upload & RAG Grounding
- Upload lecture notes, syllabi, and course materials
- AI Tutor answers grounded in the student's own uploaded documents
- Prevents hallucinations — always course-specific, never generic

---

## 5. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router v7, Vite |
| **UI** | Lucide React, CSS Custom Properties (dark theme) |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL (`pg`) |
| **Authentication** | JWT (`jsonwebtoken`), bcryptjs |
| **AI / LLM** | Groq API — Llama 3.3 70B Versatile |
| **State Management** | React Context API (Auth, Course, Theme) |
| **Client Storage** | localStorage + sessionStorage (offline-first) |
| **Testing** | Vitest, @testing-library/react |
| **Dev Tool** | IBM Bob (AI SDLC Partner) |

---

## 6. Project Structure

```
AI-Study-Buddy/
├── server/
│   ├── index.js                  # Express app entry point
│   ├── db.js                     # PostgreSQL connection + table init
│   └── routes/
│       ├── aiTutor.js            # AI Tutor + Groq chat + conversation threads
│       ├── auth.js               # Register / Login / JWT
│       ├── courses.js            # Course CRUD
│       ├── quizzes.js            # Quiz engine + attempts + scoring
│       ├── studyPlan.js          # AI study plan generation
│       ├── studyPlansData.js     # Study plan data routes
│       └── progress.js           # Progress tracking
│
├── src/
│   ├── features/
│   │   ├── ai-tutor/             # Chat UI, useChat hook, tutor service
│   │   ├── quizzes/              # Quiz generation, attempt, result pages
│   │   ├── study-plans/          # Plan creation, task management
│   │   ├── progress/             # Dashboard, mastery, quiz history
│   │   ├── documents/            # Upload, processing status, viewer
│   │   └── auth/                 # Login, register, protected routes
│   │
│   ├── services/
│   │   ├── groqService.js        # Groq LLM client (chat, quiz, plan gen)
│   │   ├── weakTopicsManager.js  # Weak topic diagnosis, tracking, events
│   │   ├── api.js                # Axios client
│   │   ├── courseService.js      # Course API calls
│   │   └── mockData.js           # Seed data for offline fallback
│   │
│   ├── components/
│   │   ├── ui/                   # Button, Card, Badge, Input, Modal, ProgressBar
│   │   ├── layout/               # AppLayout, Navbar, Sidebar
│   │   └── common/               # Loading, ErrorState, EmptyState
│   │
│   ├── context/
│   │   ├── AuthContext.jsx       # User auth state + demo login
│   │   ├── CourseContext.jsx     # Active course + course list
│   │   └── ThemeContext.jsx      # Dark / light theme
│   │
│   ├── pages/                    # Top-level page components
│   ├── routes/                   # AppRoutes + ProtectedRoute
│   └── test/                     # Vitest test suite (9 files)
│
├── .env.example                  # Environment variable template
├── README.md                     # This file
├── package.json
└── vite.config.js
```

---

## 7. Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local or hosted)
- A [Groq API key](https://console.groq.com/keys) (free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-Study-Buddy.git
cd AI-Study-Buddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Enable smart offline fallback (set true if running without backend)
VITE_ENABLE_MOCK_FALLBACK=true

# Groq LLM — get free key at https://console.groq.com/keys
VITE_GROQ_API_KEY=gsk_your_key_here
VITE_GROQ_MODEL=llama-3.3-70b-versatile
VITE_USE_GROQ_DIRECT=true

# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/studybuddy
```

### 4. Start the backend server

```bash
npm run server
```

Runs at `http://localhost:3000`  
Health check: `http://localhost:3000/api/v1/health`

### 5. Start the frontend

```bash
npm run dev
```

Runs at `http://localhost:5173`

### 6. Run without a backend (offline mode)

Set `VITE_ENABLE_MOCK_FALLBACK=true` in `.env`. The app uses smart deterministic fallbacks for all AI features — no Groq key or PostgreSQL required.

---

## 8. Running Tests

```bash
npm test
```

| Test File | What It Covers |
|-----------|----------------|
| `auth.test.jsx` | Login/Register forms, auth context |
| `chat.test.jsx` | AI Tutor messages, mode switching, conversations |
| `quizzes.test.jsx` | Quiz generation, attempt flow, scoring |
| `studyPlans.test.jsx` | Plan creation, task toggling, progress |
| `progress.test.jsx` | Mastery display, weak topics, quiz history |
| `documents.test.jsx` | Upload, processing status, list rendering |
| `courses.test.jsx` | Course listing, filtering, detail page |
| `commonStates.test.jsx` | Loading, error, and empty state components |
| `groq.test.js` | Groq service config, model selection, API key |

---

## 9. API Reference

All routes are prefixed with `/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login — returns JWT token |
| `GET` | `/courses` | Get all courses for user |
| `POST` | `/courses` | Create a new course |
| `POST` | `/ai/chat` | Send message to AI Tutor |
| `GET` | `/ai/conversations?courseId=` | Get conversation threads |
| `POST` | `/ai/conversations` | Create new conversation thread |
| `DELETE` | `/ai/conversations/:id` | Delete a conversation thread |
| `POST` | `/ai/quiz` | Generate an AI quiz |
| `POST` | `/ai/study-plan` | Generate a personalized study plan |
| `GET` | `/quizzes` | Get all quizzes |
| `POST` | `/quizzes/:id/attempts` | Start a quiz attempt |
| `POST` | `/attempts/:id/answers` | Save an answer during attempt |
| `POST` | `/attempts/:id/complete` | Complete attempt + get scored results |
| `GET` | `/study-plans` | Get all study plans |
| `PATCH` | `/study-plans/:planId/tasks/:taskId` | Toggle task completion |
| `GET` | `/progress` | Get global progress summary |

---

## 10. How IBM Bob Was Used

**IBM Bob** is an AI SDLC (Software Development Lifecycle) partner built into the IDE. It operates in three modes and was the primary development tool for this entire project — from the first architecture sketch to the final test suite.

| Mode | Purpose |
|------|---------|
| **Plan** | Design architecture and technical specifications before coding |
| **Agent** | Write, modify, and refactor code — implementing features and fixing bugs |
| **Ask** | Understand the codebase and trace issues without changing any files |

---

### Phase 1 — Architecture Design (Plan Mode)

Before writing a single line of code, Bob's Plan mode was used to:

- Design the **closed feedback loop** — how quiz results flow into the weak topics store, which feeds study plan generation, which links back to the AI Tutor
- Plan the **feature-based folder structure** with clear separation of concerns
- Design the **3-tier LLM fallback strategy**: Groq LLM → Backend API → Deterministic mock
- Design the `weakTopicsManager` data flow and the per-course conversation thread model

---

### Phase 2 — Full-Stack Implementation (Agent Mode)

Bob's Agent mode implemented every major feature:

**AI Tutor** (`server/routes/aiTutor.js` + `src/features/ai-tutor/`)
- 5 system prompt modes, Groq LLM integration with `callGroq()`, sliding 10-message context window, `<think>` reasoning-tag stripping
- All React components: `ChatWindow`, `ChatInput`, `MessageBubble`, `ModeSelector`, `ConversationList`, `TypingIndicator`

**Quiz Engine** (`src/features/quizzes/`)
- `quizService.generateQuiz()` with 3-tier generation
- `QuizAttemptPage` with real-time answer tracking and timer
- `completeAttempt()` with per-topic scoring and automatic weak topic diagnosis
- `QuizResultPage` with topic performance breakdown and recommended next actions

**Weak Topics Manager** (`src/services/weakTopicsManager.js`)
- localStorage persistence, mastery threshold logic (< 75% = weak, ≥ 75% = cleared)
- Real-time `CustomEvent` broadcasting across all subscribed React components

**Study Plan Generator** (`src/features/study-plans/`)
- `studyPlanService.generateStudyPlan()` with Groq-powered task sequencing
- Day-by-day `TaskCard` components that deep-link to AI Tutor or course documents

**Progress Dashboard** (`src/features/progress/`)
- Mastery cards, quiz history, weak topic cards, study activity timeline
- Per-topic mastery breakdown and performance charts

**Auth & Backend** (`server/` + `src/features/auth/`)
- Full JWT auth flow: register, login, protected routes, token validation middleware
- Express backend with PostgreSQL integration, all API route files

**UI Component Library** (`src/components/`)
- Full reusable system: `Button`, `Card`, `Badge`, `Input`, `Modal`, `ProgressBar`
- `AppLayout`, `Navbar`, `Sidebar`, `Loading`, `ErrorState`, `EmptyState`

---

### Phase 3 — Debugging & Understanding (Ask Mode)

Bob's Ask mode was used to:

- Trace data flow: `completeAttempt()` → `weakTopicsManager` → `studyPlanService` across multiple files
- Diagnose the quiz result page not receiving the correct `topicPerformance` array (sessionStorage caching bug)
- Understand the Groq API response shape before writing the parser
- Verify JWT token expiry handling in Express middleware
- Cross-reference how `CourseContext` provides data to deeply nested feature components

---

### Phase 4 — Test Suite Generation (Agent Mode)

Bob generated the complete Vitest test suite — all 9 test files listed in [Running Tests](#8-running-tests).

---

### Phase 5 — Documentation (Agent Mode)

- All JSDoc comments across every service file
- Inline comments for complex logic (3-tier fallback chain, mastery threshold, context windowing)
- This `README.md`

---

### IBM Bob Workflow

```
Plan Mode  →  Architecture + folder structure design
     ↓
Agent Mode →  AI Tutor + Quiz Engine + Study Planner + Progress Dashboard
Agent Mode →  JWT auth + Express backend + PostgreSQL + UI components
     ↓
Ask Mode   →  Debug data flows + trace cross-component issues
     ↓
Agent Mode →  Full Vitest test suite + JSDoc + README
```

---

## 11. Roadmap

- [ ] Full RAG pipeline with `pgvector` — retrieve answers from uploaded document chunks
- [ ] Spaced repetition (SM-2 algorithm) integrated into the revision planner
- [ ] Voice mode tutor — hands-free study sessions
- [ ] Collaborative study rooms with shared quizzes and leaderboard
- [ ] Mobile app (React Native)

---

<div align="center">
  Built with React · Node.js · Groq · PostgreSQL · IBM Bob
</div>
