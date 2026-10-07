import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  })
  : new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER || 'postgres',
    password: process.env.POSTGRESQL_KEY || process.env.PG_PASSWORD || '1234',
    database: process.env.PG_DATABASE || 'postgres',
    max: 10,
    idleTimeoutMillis: 30000,
  });

/**
 * Starter template courses for newly registered or first-time logged-in students.
 * Cloned per user so each student has independent records.
 */
export const STARTER_COURSES = [
  {
    templateId: 'course-cs301',
    code: 'CS 301',
    name: 'Distributed Systems & Cloud Computing',
    description: 'Consensus protocols (Raft, Paxos), CAP theorem, vector clocks, and scalable microservice architectures.',
    examDate: '2026-10-15',
    color: '#6366f1',
    progress: 74,
    documentsCount: 6,
    topicsCount: 5,
    lastStudied: 'Today, 2:30 PM',
    topics: [
      {
        id: 'top-1',
        title: 'CAP Theorem & PACELC Trade-offs',
        order: 1,
        mastery: 92,
        status: 'mastered',
        summary: 'Consistency, Availability, and Partition tolerance guarantees under asynchronous network partitions.',
        subtopics: ['Network Partitions', 'Strict vs Eventual Consistency', 'Dynamo-style Quorums'],
      },
      {
        id: 'top-2',
        title: 'Consensus: Raft & Paxos Algorithm',
        order: 2,
        mastery: 65,
        status: 'improving',
        summary: 'Leader election, log replication, safety invariants, and state machine consistency.',
        subtopics: ['Leader Election', 'Log Compaction & Snapshots', 'Split Brain Prevention'],
      },
      {
        id: 'top-3',
        title: 'Logical Time & Vector Clocks',
        order: 3,
        mastery: 42,
        status: 'weak',
        summary: 'Lamport timestamps, causal orderings, and detecting concurrent conflicting updates.',
        subtopics: ['Lamport Clocks', 'Vector Timestamps', 'Matrix Clocks'],
      },
      {
        id: 'top-4',
        title: 'Distributed Transactions & 2PC',
        order: 4,
        mastery: 80,
        status: 'mastered',
        summary: 'Two-phase commit, three-phase commit, and Saga pattern for distributed rollbacks.',
        subtopics: ['Two-Phase Commit', 'Saga Pattern', 'Distributed Locking'],
      },
      {
        id: 'top-5',
        title: 'Gossip Protocols & Failure Detection',
        order: 5,
        mastery: 55,
        status: 'improving',
        summary: 'Epidemic algorithms, phi-accrual failure detection, and cluster membership lists.',
        subtopics: ['SWIM Protocol', 'Phi Accrual Failure Detector', 'Anti-Entropy'],
      },
    ],
  },
  {
    templateId: 'course-cs420',
    code: 'CS 420',
    name: 'Operating Systems & Concurrency',
    description: 'Kernel internals, virtual memory paging, scheduling algorithms, lock-free synchronization, and file systems.',
    examDate: '2026-11-02',
    color: '#a855f7',
    progress: 58,
    documentsCount: 8,
    topicsCount: 4,
    lastStudied: 'Yesterday',
    topics: [
      {
        id: 'top-os-1',
        title: 'Virtual Memory & Page Replacement',
        order: 1,
        mastery: 70,
        status: 'improving',
        summary: 'Multi-level page tables, TLB shootdowns, LRU and Clock replacement algorithms.',
        subtopics: ['TLB Caches', 'Inverted Page Tables', 'Demand Paging'],
      },
      {
        id: 'top-os-2',
        title: 'Concurrency Primitives & Deadlock',
        order: 2,
        mastery: 35,
        status: 'weak',
        summary: 'Mutexes, semaphores, condition variables, Banker algorithm, and lock inversion.',
        subtopics: ['Banker Algorithm', 'Lock Ordering', 'Futex Implementation'],
      },
      {
        id: 'top-os-3',
        title: 'CPU Scheduling & CFS',
        order: 3,
        mastery: 75,
        status: 'mastered',
        summary: 'Completely Fair Scheduler, red-black tree runqueues, multi-core affinity, and real-time priorities.',
        subtopics: ['CFS Runqueue', 'Scheduling Latency', 'Priority Inversion'],
      },
      {
        id: 'top-os-4',
        title: 'Crash Consistency & Journaling',
        order: 4,
        mastery: 52,
        status: 'improving',
        summary: 'ext4/XFS journaling block states, write barriers, fsync semantics, and crash recovery.',
        subtopics: ['Write-Ahead Logging', 'Metadata Journaling', 'FSCK Verification'],
      },
    ],
  },
  {
    templateId: 'course-ai502',
    code: 'AI 502',
    name: 'Deep Learning & Generative Models',
    description: 'Attention mechanisms, Transformer architectures, diffusion models, and retrieval-augmented generation.',
    examDate: '2026-12-10',
    color: '#06b6d4',
    progress: 82,
    documentsCount: 11,
    topicsCount: 4,
    lastStudied: '3 days ago',
    topics: [
      {
        id: 'top-ai-1',
        title: 'Backpropagation & Optimization',
        order: 1,
        mastery: 95,
        status: 'mastered',
        summary: 'Computational graphs, reverse-mode autodiff, AdamW, and gradient clipping.',
        subtopics: ['Autodiff Graphs', 'AdamW Weight Decay', 'Vanishing Gradients'],
      },
      {
        id: 'top-ai-2',
        title: 'Transformers & Self-Attention',
        order: 2,
        mastery: 88,
        status: 'mastered',
        summary: 'Scaled dot-product attention, multi-head projections, RoPE, and FlashAttention.',
        subtopics: ['Scaled Dot-Product Attention', 'Rotary Positional Embeddings', 'FlashAttention'],
      },
      {
        id: 'top-ai-3',
        title: 'RAG & Vector Retrieval',
        order: 3,
        mastery: 90,
        status: 'mastered',
        summary: 'Dense embeddings, HNSW vector indexing, reciprocal rank fusion, and context windows.',
        subtopics: ['Cosine Similarity vs Dot Product', 'HNSW Graph Search', 'Context Window Re-ranking'],
      },
      {
        id: 'top-ai-4',
        title: 'Diffusion Models & Score Matching',
        order: 4,
        mastery: 45,
        status: 'weak',
        summary: 'Forward and reverse diffusion SDEs, DDPM, DDIM sampling, and classifier-free guidance.',
        subtopics: ['Forward Gaussian Noise', 'Score Matching', 'Classifier-Free Guidance'],
      },
    ],
  },
];

/**
 * Seeds isolated initial data for a specific student if they have no records.
 */
export async function seedUserStarterData(userId, client = null) {
  const runner = client || pool;
  try {
    // Check if user already has courses
    const existing = await runner.query('SELECT id FROM courses WHERE user_id = $1 LIMIT 1', [userId]);
    if (existing.rows.length > 0) {
      return; // Already initialized
    }

    // Seed courses for this specific student
    for (const c of STARTER_COURSES) {
      const courseId = `${c.templateId}-${userId.slice(0, 8)}`;
      await runner.query(
        `INSERT INTO courses (
          id, user_id, code, name, description, exam_date, color,
          progress, documents_count, topics_count, last_studied, topics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING`,
        [
          courseId,
          userId,
          c.code,
          c.name,
          c.description,
          c.examDate,
          c.color,
          c.progress,
          c.documentsCount,
          c.topicsCount,
          c.lastStudied,
          JSON.stringify(c.topics),
        ]
      );
    }

    // Seed initial study plan for this student
    const cs301CourseId = `course-cs301-${userId.slice(0, 8)}`;
    const planId = `plan-cs301-${userId.slice(0, 8)}`;
    await runner.query(
      `INSERT INTO study_plans (
        id, user_id, course_id, course_code, course_name, exam_date,
        daily_study_minutes, preferred_days, weak_topics, title, overall_progress, tasks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING`,
      [
        planId,
        userId,
        cs301CourseId,
        'CS 301',
        'Distributed Systems',
        '2026-10-15',
        60,
        JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        JSON.stringify(['Consensus & Raft Invariants', 'Logical Time & Vector Clocks']),
        'CS 301 Sprint to Midterm',
        42,
        JSON.stringify([
          {
            id: `task-${userId.slice(0, 4)}-1`,
            title: 'Master Vector Clocks & Partial Ordering',
            topic: 'Logical Time & Vector Clocks',
            topicPriority: 'High',
            activityType: 'Weak-topic review',
            durationMinutes: 40,
            duration: '40 mins',
            status: 'pending',
            scheduledFor: 'Today',
            description: 'Deep-dive into Lamport timestamps vs. vector clocks causality violations using AI Tutor.',
            actionType: 'tutor',
            actionLabel: 'Consult AI Tutor',
            actionTarget: `/courses/${cs301CourseId}/tutor`,
          },
          {
            id: `task-${userId.slice(0, 4)}-2`,
            title: 'Raft State Transition Drill',
            topic: 'Consensus & Raft Invariants',
            topicPriority: 'Critical',
            activityType: 'Quiz',
            durationMinutes: 20,
            duration: '20 mins',
            status: 'pending',
            scheduledFor: 'Today',
            description: 'Complete 5-question targeted drill on Leader Election timeouts.',
            actionType: 'quiz',
            actionLabel: 'Start Practice Quiz',
            actionTarget: `/courses/${cs301CourseId}/quizzes`,
          },
        ]),
      ]
    );

    // Seed initial quizzes for this student
    const quiz1Id = `quiz-01-${userId.slice(0, 8)}`;
    await runner.query(
      `INSERT INTO quizzes (
        id, user_id, course_id, course_code, course_name, topic_id, topic_name,
        title, difficulty, type, questions_count, time_limit_minutes, score, completed_at, questions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO NOTHING`,
      [
        quiz1Id,
        userId,
        cs301CourseId,
        'CS 301',
        'Distributed Systems & Cloud Computing',
        'top-2',
        'Consensus: Raft & Paxos Algorithm',
        'Raft Consensus & Leader Election Practice',
        'Medium',
        'MCQ & True/False',
        2,
        10,
        80,
        'Yesterday',
        JSON.stringify([
          {
            id: 'q-1',
            topicId: 'top-2',
            topicName: 'Consensus & Raft Invariants',
            type: 'MCQ',
            question: 'In the Raft consensus protocol, what state does a follower transition to when its election timer expires?',
            options: ['Leader', 'Candidate', 'Pre-vote Observer', 'Log Compactor'],
            correctAnswerIndex: 1,
            explanation: 'When election timeout expires with no heartbeat, follower becomes Candidate to solicit votes.',
          },
          {
            id: 'q-2',
            topicId: 'top-2',
            topicName: 'Consensus & Raft Invariants',
            type: 'True/False',
            question: 'In Raft, a leader can overwrite uncommitted log entries on its followers.',
            options: ['True', 'False'],
            correctAnswerIndex: 0,
            explanation: 'True. Raft enforces followers synchronise logs with leader.',
          },
        ]),
      ]
    );

    // Seed initial weak topics for this student
    const weak1Id = `weak-1-${userId.slice(0, 8)}`;
    await runner.query(
      `INSERT INTO weak_topics (
        id, user_id, course_id, course_code, topic, mastery, trend,
        source_quiz_title, source_quiz_id, suggested_action, action_target, last_diagnosed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING`,
      [
        weak1Id,
        userId,
        cs301CourseId,
        'CS 301',
        'Logical Time & Vector Clocks',
        42,
        '-8% on recent quiz',
        'Raft Consensus & Leader Election Practice',
        quiz1Id,
        'Review Vector Clocks Document Chunks',
        `/courses/${cs301CourseId}/tutor`,
        'Yesterday',
      ]
    );

    console.log(`✅ Seeded isolated initial data for student ${userId}`);
  } catch (err) {
    console.error(`Error seeding data for student ${userId}:`, err.message);
  }
}

/**
 * Initializes the database schema with user-isolated relational tables.
 */
export async function initDatabase() {
  const client = await pool.connect();
  try {
    // 1. Try to enable uuid-ossp extension
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    } catch (extErr) {
      console.warn('Note: uuid-ossp extension could not be auto-created:', extErr.message);
    }

    // 2. Students registration table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);`);

    // Ensure demo student exists in database
    await client.query(`
      INSERT INTO students (id, name, email, password_hash, role)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Demo Student',
        'demo@studybuddy.internal',
        '$2a$10$demohashnotvalidforlogin123456789012345678901234567890',
        'student'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Courses table (User-Isolated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(100) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        exam_date VARCHAR(50),
        color VARCHAR(50),
        progress INT DEFAULT 0,
        documents_count INT DEFAULT 0,
        topics_count INT DEFAULT 0,
        last_studied VARCHAR(100),
        topics JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);`);

    // 4. Study plans table (User-Isolated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id VARCHAR(100) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id VARCHAR(100),
        course_code VARCHAR(50),
        course_name VARCHAR(255),
        exam_date VARCHAR(50),
        daily_study_minutes INT DEFAULT 45,
        preferred_days JSONB DEFAULT '[]'::jsonb,
        weak_topics JSONB DEFAULT '[]'::jsonb,
        title VARCHAR(255),
        overall_progress INT DEFAULT 0,
        tasks JSONB DEFAULT '[]'::jsonb,
        day_schedule JSONB DEFAULT '[]'::jsonb,
        class_level VARCHAR(100),
        subject VARCHAR(100),
        chapter VARCHAR(255),
        days INT DEFAULT 5,
        daily_study_time VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);`);

    // 5. Quizzes table (User-Isolated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(100) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id VARCHAR(100),
        course_code VARCHAR(50),
        course_name VARCHAR(255),
        topic_id VARCHAR(100),
        topic_name VARCHAR(255),
        title VARCHAR(255),
        difficulty VARCHAR(50),
        type VARCHAR(50),
        questions_count INT DEFAULT 5,
        time_limit_minutes INT DEFAULT 10,
        score INT DEFAULT 0,
        completed_at VARCHAR(100),
        questions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);`);

    // 6. Quiz attempts table (User-Isolated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id VARCHAR(100) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        quiz_id VARCHAR(100) NOT NULL,
        answers JSONB DEFAULT '{}'::jsonb,
        score INT DEFAULT 0,
        percentage INT DEFAULT 0,
        passed BOOLEAN DEFAULT false,
        total_questions INT DEFAULT 0,
        correct_count INT DEFAULT 0,
        quiz_data JSONB DEFAULT '{}'::jsonb,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);`);

    // 7. AI conversations table (User-Isolated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id VARCHAR(100) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id VARCHAR(100) NOT NULL,
        title VARCHAR(255),
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);`);

    // 8. Documents table (User-Isolated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(100) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id VARCHAR(100) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50),
        size VARCHAR(50),
        status VARCHAR(50) DEFAULT 'completed',
        chunks_count INT DEFAULT 0,
        content TEXT,
        file_path VARCHAR(500),
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);`);

    // 9. Weak topics table (User-Isolated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS weak_topics (
        id VARCHAR(100) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id VARCHAR(100),
        course_code VARCHAR(50),
        topic VARCHAR(255) NOT NULL,
        mastery INT DEFAULT 40,
        trend VARCHAR(255),
        source_quiz_title VARCHAR(255),
        source_quiz_id VARCHAR(100),
        suggested_action VARCHAR(255),
        action_target VARCHAR(255),
        last_diagnosed VARCHAR(100),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_weak_topics_user_id ON weak_topics(user_id);`);

    console.log('✅ PostgreSQL database tables and user-isolation schema initialized successfully.');
  } finally {
    client.release();
  }
}

export default pool;
