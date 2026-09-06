import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studyPlanRoutes from './routes/studyPlan.js';
import aiTutorRoutes from './routes/aiTutor.js';
import courseRoutes from './routes/courses.js';
import studyPlansDataRoutes from './routes/studyPlansData.js';
import quizRoutes, { generateQuizHandler } from './routes/quizzes.js';
import progressRoutes from './routes/progress.js';
import { initDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiTutorRoutes);         // /conversations + /chat
app.use('/api/v1/ai', studyPlanRoutes);        // /study-plan
app.post('/api/v1/ai/quiz', generateQuizHandler); // AI quiz generation
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/study-plans', studyPlansDataRoutes);
app.use('/api/v1/quizzes', quizRoutes);        // /quizzes + /quizzes/:id/attempts
app.use('/api/v1/attempts', quizRoutes);       // /attempts/:id/answers + /attempts/:id/complete
app.use('/api/v1/progress', progressRoutes);   // /progress global stats

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 StudyBuddy API Server is running at http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize database and start server:', err);
    process.exit(1);
  }
}

startServer();
