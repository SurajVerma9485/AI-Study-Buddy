import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import Loading from '../components/common/Loading';

// Lazy-loaded Public Authentication Pages
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const UnauthorizedPage = lazy(() => import('../features/auth/pages/UnauthorizedPage'));

// Lazy-loaded Student Learning Hub Pages (Code-splitting)
const Home = lazy(() => import('../pages/Home'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Courses = lazy(() => import('../pages/Courses'));
const CourseDetail = lazy(() => import('../pages/CourseDetail'));
const CourseDocumentsPage = lazy(() => import('../features/documents/pages/CourseDocumentsPage'));
const Documents = lazy(() => import('../pages/Documents'));
const TutorPage = lazy(() => import('../features/ai-tutor/pages/TutorPage'));
const CourseQuizzesPage = lazy(() => import('../features/quizzes/pages/CourseQuizzesPage'));
const QuizDetailPage = lazy(() => import('../features/quizzes/pages/QuizDetailPage'));
const QuizAttemptPage = lazy(() => import('../features/quizzes/pages/QuizAttemptPage'));
const QuizResultPage = lazy(() => import('../features/quizzes/pages/QuizResultPage'));
const StudyPlansPage = lazy(() => import('../features/study-plans/pages/StudyPlansPage'));
const StudyPlanDetailPage = lazy(() => import('../features/study-plans/pages/StudyPlanDetailPage'));
const ProgressDashboardPage = lazy(() => import('../features/progress/pages/ProgressDashboardPage'));
const CourseProgressPage = lazy(() => import('../features/progress/pages/CourseProgressPage'));
const Profile = lazy(() => import('../pages/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading fullPage message="Loading study view..." />}>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Student Routes - Requires valid authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses/:courseId/documents" element={<CourseDocumentsPage />} />
            <Route path="/courses/:courseId/tutor" element={<TutorPage />} />
            <Route path="/courses/:courseId/quizzes" element={<CourseQuizzesPage />} />
            <Route path="/courses/:courseId/progress" element={<CourseProgressPage />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/quizzes" element={<CourseQuizzesPage />} />
            <Route path="/quizzes/:quizId" element={<QuizDetailPage />} />
            <Route path="/quizzes/:quizId/attempt" element={<QuizAttemptPage />} />
            <Route path="/quizzes/:quizId/result" element={<QuizResultPage />} />
            <Route path="/study-plans" element={<StudyPlansPage />} />
            <Route path="/study-plans/:planId" element={<StudyPlanDetailPage />} />
            <Route path="/progress" element={<ProgressDashboardPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
