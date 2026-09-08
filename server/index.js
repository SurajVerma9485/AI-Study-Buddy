import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import studyPlanRoutes from './routes/studyPlan.js';
import aiTutorRoutes from './routes/aiTutor.js';
import courseRoutes from './routes/courses.js';
import studyPlansDataRoutes from './routes/studyPlansData.js';
import quizRoutes, { generateQuizHandler } from './routes/quizzes.js';
import progressRoutes from './routes/progress.js';

import { initDatabase } from './db.js';

dotenv.config();

// __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// React dist folder
const distPath = path.join(__dirname, '../dist');

const app = express();

// Railway provides PORT automatically
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/ai', aiTutorRoutes);

app.use('/api/v1/ai', studyPlanRoutes);

app.post('/api/v1/ai/quiz', generateQuizHandler);

app.use('/api/v1/courses', courseRoutes);

app.use('/api/v1/study-plans', studyPlansDataRoutes);

app.use('/api/v1/quizzes', quizRoutes);

app.use('/api/v1/attempts', quizRoutes);

app.use('/api/v1/progress', progressRoutes);

// =====================================================
// SERVE REACT FRONTEND
// =====================================================

app.use(express.static(distPath));

// Express 5 compatible SPA fallback
app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(
    path.join(distPath, 'index.html'),
    (err) => {
      if (err) {
        next(err);
      }
    }
  );
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
  });
});

// =====================================================
// START SERVER
// =====================================================

async function startServer() {
  try {
    console.log('🔄 Connecting to PostgreSQL...');

    await initDatabase();

    console.log('✅ PostgreSQL database connected successfully.');
    console.log('✅ Database tables initialized successfully.');

    app.listen(PORT, () => {
      console.log(
        `🚀 StudyBuddy API Server is running on port ${PORT}`
      );
      console.log(
        `🔗 Health check: http://localhost:${PORT}/api/v1/health`
      );
    });
  } catch (err) {
    console.error('❌ PostgreSQL database connection failed.');
    console.error(err.message);

    // Don't start the server if database is required
    process.exit(1);
  }
}

startServer();