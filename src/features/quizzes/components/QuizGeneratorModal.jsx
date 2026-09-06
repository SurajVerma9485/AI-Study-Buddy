import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, X, BookOpen, ChevronRight } from 'lucide-react';
import { useCourses } from '../../../context/CourseContext';
import { quizService } from '../services/quizService';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

// ─── Subject → Chapters map ───────────────────────────────────────────────────
const SUBJECT_CHAPTERS = {
  Mathematics: [
    { id: 'math-ch1', title: 'Chapter 1: Number Systems & Real Numbers' },
    { id: 'math-ch2', title: 'Chapter 2: Polynomials & Algebraic Expressions' },
    { id: 'math-ch3', title: 'Chapter 3: Linear Equations in Two Variables' },
    { id: 'math-ch4', title: 'Chapter 4: Quadratic Equations' },
    { id: 'math-ch5', title: 'Chapter 5: Arithmetic Progressions (AP)' },
    { id: 'math-ch6', title: 'Chapter 6: Triangles & Congruence' },
    { id: 'math-ch7', title: 'Chapter 7: Coordinate Geometry' },
    { id: 'math-ch8', title: 'Chapter 8: Introduction to Trigonometry' },
    { id: 'math-ch9', title: 'Chapter 9: Areas Related to Circles' },
    { id: 'math-ch10', title: 'Chapter 10: Statistics & Probability' },
  ],
  Science: [
    { id: 'sci-ch1', title: 'Chapter 1: Chemical Reactions & Equations' },
    { id: 'sci-ch2', title: 'Chapter 2: Acids, Bases and Salts' },
    { id: 'sci-ch3', title: 'Chapter 3: Metals and Non-Metals' },
    { id: 'sci-ch4', title: 'Chapter 4: Carbon and its Compounds' },
    { id: 'sci-ch5', title: 'Chapter 5: Life Processes' },
    { id: 'sci-ch6', title: 'Chapter 6: Control and Coordination' },
    { id: 'sci-ch7', title: 'Chapter 7: Light — Reflection & Refraction' },
    { id: 'sci-ch8', title: 'Chapter 8: Electricity & Circuits' },
    { id: 'sci-ch9', title: 'Chapter 9: Magnetic Effects of Electric Current' },
    { id: 'sci-ch10', title: 'Chapter 10: Sustainable Management of Natural Resources' },
  ],
  English: [
    { id: 'eng-ch1', title: 'Chapter 1: A Letter to God' },
    { id: 'eng-ch2', title: 'Chapter 2: Nelson Mandela — Long Walk to Freedom' },
    { id: 'eng-ch3', title: 'Chapter 3: Two Stories About Flying' },
    { id: 'eng-ch4', title: 'Chapter 4: From the Diary of Anne Frank' },
    { id: 'eng-ch5', title: 'Chapter 5: The Hundred Dresses' },
    { id: 'eng-ch6', title: 'Chapter 6: Glimpses of India' },
    { id: 'eng-ch7', title: 'Chapter 7: Madam Rides the Bus' },
    { id: 'eng-ch8', title: 'Chapter 8: The Sermon at Benares' },
    { id: 'eng-ch9', title: 'Chapter 9: Grammar — Tenses & Voice' },
    { id: 'eng-ch10', title: 'Chapter 10: Writing Skills — Letters & Essays' },
  ],
  History: [
    { id: 'his-ch1', title: 'Chapter 1: The Rise of Nationalism in Europe' },
    { id: 'his-ch2', title: 'Chapter 2: Nationalism in India' },
    { id: 'his-ch3', title: 'Chapter 3: The Making of a Global World' },
    { id: 'his-ch4', title: 'Chapter 4: The Age of Industrialisation' },
    { id: 'his-ch5', title: 'Chapter 5: Print Culture and the Modern World' },
  ],
  Geography: [
    { id: 'geo-ch1', title: 'Chapter 1: Resources and Development' },
    { id: 'geo-ch2', title: 'Chapter 2: Forest and Wildlife Resources' },
    { id: 'geo-ch3', title: 'Chapter 3: Water Resources' },
    { id: 'geo-ch4', title: 'Chapter 4: Agriculture' },
    { id: 'geo-ch5', title: 'Chapter 5: Minerals and Energy Resources' },
    { id: 'geo-ch6', title: 'Chapter 6: Manufacturing Industries' },
    { id: 'geo-ch7', title: 'Chapter 7: Lifelines of National Economy' },
  ],
  Physics: [
    { id: 'phy-ch1', title: 'Chapter 1: Motion & Kinematics' },
    { id: 'phy-ch2', title: 'Chapter 2: Laws of Motion (Newton)' },
    { id: 'phy-ch3', title: 'Chapter 3: Work, Energy and Power' },
    { id: 'phy-ch4', title: 'Chapter 4: Gravitation' },
    { id: 'phy-ch5', title: 'Chapter 5: Waves and Sound' },
  ],
  Chemistry: [
    { id: 'che-ch1', title: 'Chapter 1: Atomic Structure & Periodic Table' },
    { id: 'che-ch2', title: 'Chapter 2: Chemical Bonding' },
    { id: 'che-ch3', title: 'Chapter 3: States of Matter' },
    { id: 'che-ch4', title: 'Chapter 4: Equilibrium' },
    { id: 'che-ch5', title: 'Chapter 5: Organic Chemistry Fundamentals' },
  ],
  Biology: [
    { id: 'bio-ch1', title: 'Chapter 1: Cell Structure & Function' },
    { id: 'bio-ch2', title: 'Chapter 2: Genetics & Heredity' },
    { id: 'bio-ch3', title: 'Chapter 3: Evolution' },
    { id: 'bio-ch4', title: 'Chapter 4: Human Physiology' },
    { id: 'bio-ch5', title: 'Chapter 5: Plant Kingdom & Ecology' },
  ],
};

const SUBJECTS = Object.keys(SUBJECT_CHAPTERS);

const SELECT_STYLE = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border-medium)',
  color: 'var(--text-primary)',
  fontSize: '0.925rem',
  outline: 'none',
  cursor: 'pointer',
};

const LABEL_STYLE = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  display: 'block',
  marginBottom: '6px',
};

// ─── Generated Quiz Preview Card ──────────────────────────────────────────────
function GeneratedQuizCard({ quiz, onStartQuiz, onGenerateAnother }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'modalPanelIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      {/* Success Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: 'var(--success)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Sparkles size={16} />
        Quiz generated successfully! Review it below and click Start Practice Test.
      </div>

      {/* Quiz Card — matches the design in image 2 */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-medium)',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Top badges row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Badge variant="primary" size="sm">
            {quiz.courseCode || quiz.subject || 'Quiz'}
          </Badge>
          <Badge
            variant={
              quiz.difficulty === 'Hard'
                ? 'danger'
                : quiz.difficulty === 'Easy'
                ? 'success'
                : 'warning'
            }
            size="sm"
          >
            {quiz.difficulty || 'Medium'}
          </Badge>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          {quiz.title}
        </h3>

        {/* Meta */}
        <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          {((quiz.type || '').toLowerCase().includes('true') || quiz.type === 'TF') ? 'True / False' : (quiz.type || 'MCQ')} &bull; {quiz.questionsCount || quiz.questions?.length || 5} Questions
        </span>

        {/* Previous evaluation row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Previous Evaluation</span>
          <span style={{ fontWeight: 800, color: quiz.score ? 'var(--success)' : 'var(--text-muted)' }}>
            {quiz.score ? `${quiz.score}%` : 'Not attempted'}
          </span>
        </div>

        {/* Start button */}
        <button
          onClick={onStartQuiz}
          style={{
            marginTop: '6px',
            width: '100%',
            padding: '11px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'var(--transition-smooth)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
        >
          <Play size={16} fill="currentColor" />
          Start Practice Test
        </button>
      </div>

      {/* Generate another link */}
      <button
        onClick={onGenerateAnother}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          cursor: 'pointer',
          textDecoration: 'underline',
          alignSelf: 'center',
        }}
      >
        ← Generate another quiz
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Modal
// ══════════════════════════════════════════════════════════════════════════════
export default function QuizGeneratorModal({
  isOpen,
  onClose,
  defaultCourseId = null,
  onQuizGenerated = null,
}) {
  const navigate = useNavigate();
  const { courses } = useCourses();

  // Form state
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('MCQ');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState(null); // null = show form; object = show preview

  const chapters = SUBJECT_CHAPTERS[selectedSubject] || [];
  const selectedChapter = chapters.find((ch) => ch.id === selectedChapterId) || chapters[0];

  // Reset generated quiz when modal closes
  const handleClose = () => {
    if (!isGenerating) {
      setGeneratedQuiz(null);
      setError('');
      onClose();
    }
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedChapterId(''); // reset chapter
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setError('');
    setIsGenerating(true);

    const chapterId = selectedChapterId || chapters[0]?.id || 'ch-1';
    const chapterTitle = selectedChapter?.title || chapters[0]?.title || selectedSubject;

    try {
      const newQuiz = await quizService.generateQuiz({
        topicId: chapterId,
        topicName: chapterTitle,
        courseName: `${selectedSubject}: ${chapterTitle}`,
        subject: selectedSubject,
        difficulty,
        questionCount,
        type: questionType,
      });

      // Attach subject label for display
      newQuiz.courseCode = selectedSubject.slice(0, 4).toUpperCase();
      newQuiz.subject = selectedSubject;

      if (onQuizGenerated) {
        onQuizGenerated(newQuiz);
      }

      setGeneratedQuiz(newQuiz);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = () => {
    if (generatedQuiz) {
      onClose();
      setGeneratedQuiz(null);
      navigate(`/quizzes/${generatedQuiz.id}/attempt`);
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedQuiz(null);
    setError('');
  };

  // ── Render: Generated Quiz Preview ──────────────────────────────────────────
  if (generatedQuiz) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Quiz Ready!"
        description="Your AI-generated practice quiz is ready. Start it when you're ready."
        size="md"
      >
        <GeneratedQuizCard
          quiz={generatedQuiz}
          onStartQuiz={handleStartQuiz}
          onGenerateAnother={handleGenerateAnother}
        />
      </Modal>
    );
  }

  // ── Render: Form ─────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate AI Practice Quiz"
      description="The Quiz Agent will formulate targeted questions grounded in your course materials"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={handleClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating…' : 'Generate & Begin Quiz'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-light)',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {/* ── 1 & 2. Subject & Syllabus Topic (Side by Side) ──────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px' }}>
          <div>
            <label style={LABEL_STYLE}>Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              style={SELECT_STYLE}
            >
              {SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={LABEL_STYLE}>
              Syllabus Topic
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  color: 'var(--text-muted)',
                }}
              >
                ({selectedSubject})
              </span>
            </label>
            <select
              value={selectedChapterId || chapters[0]?.id || ''}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              style={SELECT_STYLE}
            >
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── 3. Question Type Selector (Multiple Choice & True/False) ────── */}
        <div>
          <label style={LABEL_STYLE}>Question Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { value: 'MCQ', label: 'Multiple Choice', desc: '4 Options (A, B, C, D)' },
              { value: 'True/False', label: 'True / False', desc: 'Binary 2-choice' },
              { value: 'Mixed', label: 'Mixed', desc: 'MCQ & True/False' },
            ].map((t) => {
              const isSelected = questionType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setQuestionType(t.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '2px solid var(--primary)'
                      : '1px solid var(--border-medium)',
                    backgroundColor: isSelected
                      ? 'var(--primary-light)'
                      : 'var(--bg-elevated)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.label}</span>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4 & 5. Quiz Level & Number of Questions ──────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Difficulty Level */}
          <div>
            <label style={LABEL_STYLE}>Quiz Level</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['Easy', 'Medium', 'Hard'].map((diff) => {
                const isSelected = difficulty === diff;
                const accentColor =
                  diff === 'Easy'
                    ? 'var(--success)'
                    : diff === 'Hard'
                    ? 'var(--danger)'
                    : 'var(--warning)';
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? `1px solid ${accentColor}`
                        : '1px solid var(--border-medium)',
                      backgroundColor: isSelected
                        ? `${accentColor}20`
                        : 'var(--bg-elevated)',
                      color: isSelected ? accentColor : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label style={LABEL_STYLE}>Number of Questions</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[3, 5, 10, 15].map((num) => {
                const isSelected = questionCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '1px solid var(--primary)'
                        : '1px solid var(--border-medium)',
                      backgroundColor: isSelected
                        ? 'var(--primary-light)'
                        : 'var(--bg-elevated)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {num} Qs
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
