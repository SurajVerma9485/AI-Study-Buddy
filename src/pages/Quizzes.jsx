import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { MOCK_RECENT_QUIZZES } from '../services/mockData';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';

export default function Quizzes() {
  const { courses, selectedCourse } = useCourses();
  const [quizzes, setQuizzes] = useState(MOCK_RECENT_QUIZZES);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  // Active Quiz Runner State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Sample dynamic quiz questions
  const sampleQuestions = [
    {
      id: 'q-1',
      question: 'In the Raft consensus protocol, what state does a follower node transition to when its election timer expires?',
      options: ['Leader', 'Candidate', 'Pre-vote Observer', 'Log Compactor'],
      correctAnswer: 1, // Candidate
      explanation: 'When a follower hears no heartbeat before its randomized election timeout, it assumes the leader has failed, increments its current term, and transitions to Candidate to solicit votes.',
    },
    {
      id: 'q-2',
      question: 'True or False: The CAP theorem states that a distributed data store can simultaneously provide Consistency, Availability, and Partition tolerance.',
      options: ['True', 'False'],
      correctAnswer: 1, // False
      explanation: 'Under network partition (P), a distributed system must trade off between Consistency (C) and Availability (A). It cannot guarantee all three simultaneously.',
    },
    {
      id: 'q-3',
      question: 'Which clock synchronization algorithm uses logical timestamps without relying on physical hardware clock synchronization?',
      options: ['NTP (Network Time Protocol)', 'Lamport Timestamps', 'PTP (Precision Time Protocol)', 'GPS Atomic Sync'],
      correctAnswer: 1, // Lamport Timestamps
      explanation: 'Leslie Lamport showed that the "happened-before" relation can be tracked using simple monotonically increasing counters rather than synchronized wall-clock time.',
    },
  ];

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setUserScore(0);
    setQuizFinished(false);
  };

  const handleSelectOption = (index) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === sampleQuestions[currentQuestionIndex].correctAnswer) {
      setUserScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < sampleQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>Adaptive Practice Quizzes</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.925rem' }}>
            Generate AI-formulated MCQs and evaluate syllabus topic retention
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setGenerateModalOpen(true)}
        >
          Generate New Quiz
        </Button>
      </div>

      {/* If an active quiz runner is open */}
      {activeQuiz && !quizFinished ? (
        <Card glass style={{ border: '1px solid var(--border-glow)' }}>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                <Badge variant="primary" size="sm">
                  Question {currentQuestionIndex + 1} of {sampleQuestions.length}
                </Badge>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '8px' }}>
                  {activeQuiz.title}
                </h2>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setActiveQuiz(null)}>
                Quit Quiz
              </Button>
            </div>
          </CardHeader>

          <CardContent style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {sampleQuestions[currentQuestionIndex].question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sampleQuestions[currentQuestionIndex].options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === sampleQuestions[currentQuestionIndex].correctAnswer;
                let bg = 'var(--bg-elevated)';
                let border = '1px solid var(--border-medium)';

                if (showExplanation) {
                  if (isCorrect) {
                    bg = 'rgba(16, 185, 129, 0.15)';
                    border = '1px solid #10b981';
                  } else if (isSelected) {
                    bg = 'rgba(239, 68, 68, 0.15)';
                    border = '1px solid #ef4444';
                  }
                } else if (isSelected) {
                  bg = 'var(--primary-light)';
                  border = '1px solid var(--primary)';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: bg,
                      border: border,
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      cursor: showExplanation ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    <span>{option}</span>
                    {showExplanation && isCorrect && <CheckCircle2 size={18} color="#10b981" />}
                    {showExplanation && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {showExplanation && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid var(--border-glow)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--primary)' }}>Explanation: </strong>
                {sampleQuestions[currentQuestionIndex].explanation}
              </div>
            )}

            {showExplanation && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button variant="primary" size="md" onClick={handleNextQuestion}>
                  {currentQuestionIndex + 1 === sampleQuestions.length ? 'See Results' : 'Next Question →'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeQuiz && quizFinished ? (
        /* Quiz Finished View */
        <Card glass style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
            Quiz Completed!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You scored <strong>{userScore}</strong> out of <strong>{sampleQuestions.length}</strong> (
            {Math.round((userScore / sampleQuestions.length) * 100)}%)
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="secondary" size="md" icon={RotateCcw} onClick={() => handleStartQuiz(activeQuiz)}>
              Retake Quiz
            </Button>
            <Button variant="primary" size="md" onClick={() => setActiveQuiz(null)}>
              Back to Quiz List
            </Button>
          </div>
        </Card>
      ) : (
        /* Quiz Catalog Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {quizzes.map((quiz) => (
            <Card key={quiz.id} glass hoverable>
              <CardContent style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Badge variant="primary" size="sm">
                    {quiz.courseCode}
                  </Badge>
                  <Badge
                    variant={quiz.difficulty === 'Hard' ? 'danger' : quiz.difficulty === 'Medium' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {quiz.title}
                </h3>

                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
                  {quiz.type} • {quiz.questionsCount} Questions
                </span>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Previous Best</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>{quiz.score}%</span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  icon={Play}
                  fullWidth
                  onClick={() => handleStartQuiz(quiz)}
                >
                  Start Practice Test
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Quiz Modal */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Generate AI Practice Quiz"
        description="The Quiz Agent will extract relevant chunks and construct targeted questions"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              onClick={() => {
                const newQuiz = {
                  id: `quiz-${Date.now()}`,
                  courseId: selectedCourse?.id || 'cs301',
                  courseCode: selectedCourse?.code || 'CS 301',
                  title: `${selectedCourse?.code || 'CS 301'}: Core Concepts Check`,
                  questionsCount: 5,
                  difficulty: 'Medium',
                  score: 0,
                  completedAt: 'Just created',
                  type: 'MCQ & True/False',
                };
                setQuizzes((prev) => [newQuiz, ...prev]);
                setGenerateModalOpen(false);
                handleStartQuiz(newQuiz);
              }}
            >
              Generate & Begin
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Target Course
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.925rem',
              }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Difficulty Level
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: diff === 'Medium' ? 'var(--primary-light)' : 'var(--bg-elevated)',
                    border: diff === 'Medium' ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                    color: diff === 'Medium' ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
