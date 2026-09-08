import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, X, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { useCourses } from '../../../context/CourseContext';
import { quizService } from '../services/quizService';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

// ─── Classes & Subjects map ───────────────────────────────────────────────────
const CLASSES = ['Class 10', 'Class 9', 'Class 11', 'Class 12'];

const CLASS_SUBJECTS = {
  'Class 9': ['Mathematics', 'Science', 'English'],
  'Class 10': ['Mathematics', 'Science', 'English'],
  'Class 11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
  'Class 12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
};

// ─── Class & Subject → Chapters map ───────────────────────────────────────────
const CLASS_CHAPTERS = {
  'Class 9': {
    Mathematics: [
      { id: 'c9-m1', title: 'Chapter 1: Number Systems' },
      { id: 'c9-m2', title: 'Chapter 2: Polynomials' },
      { id: 'c9-m3', title: 'Chapter 3: Coordinate Geometry' },
      { id: 'c9-m4', title: 'Chapter 4: Linear Equations in Two Variables' },
      { id: 'c9-m5', title: 'Chapter 5: Introduction to Euclid\'s Geometry' },
      { id: 'c9-m6', title: 'Chapter 6: Lines and Angles' },
      { id: 'c9-m7', title: 'Chapter 7: Triangles' },
      { id: 'c9-m8', title: 'Chapter 8: Quadrilaterals' },
      { id: 'c9-m9', title: 'Chapter 9: Circles' },
      { id: 'c9-m10', title: 'Chapter 10: Heron\'s Formula' },
      { id: 'c9-m11', title: 'Chapter 11: Surface Areas and Volumes' },
      { id: 'c9-m12', title: 'Chapter 12: Statistics' },
    ],
    Science: [
      { id: 'c9-s1', title: 'Chapter 1: Matter in Our Surroundings' },
      { id: 'c9-s2', title: 'Chapter 2: Is Matter Around Us Pure' },
      { id: 'c9-s3', title: 'Chapter 3: Atoms and Molecules' },
      { id: 'c9-s4', title: 'Chapter 4: Structure of the Atom' },
      { id: 'c9-s5', title: 'Chapter 5: The Fundamental Unit of Life' },
      { id: 'c9-s6', title: 'Chapter 6: Tissues' },
      { id: 'c9-s7', title: 'Chapter 7: Motion' },
      { id: 'c9-s8', title: 'Chapter 8: Force and Laws of Motion' },
      { id: 'c9-s9', title: 'Chapter 9: Gravitation' },
      { id: 'c9-s10', title: 'Chapter 10: Work and Energy' },
      { id: 'c9-s11', title: 'Chapter 11: Sound' },
      { id: 'c9-s12', title: 'Chapter 12: Improvement in Food Resources' },
    ],
    English: [
      { id: 'c9-e1', title: 'Chapter 1: The Fun They Had' },
      { id: 'c9-e2', title: 'Chapter 2: The Sound of Music' },
      { id: 'c9-e3', title: 'Chapter 3: The Little Girl' },
      { id: 'c9-e4', title: 'Chapter 4: A Truly Beautiful Mind' },
      { id: 'c9-e5', title: 'Chapter 5: The Snake and the Mirror' },
      { id: 'c9-e6', title: 'Chapter 6: My Childhood' },
      { id: 'c9-e7', title: 'Chapter 7: Reach for the Top' },
      { id: 'c9-e8', title: 'Chapter 8: Kathmandu' },
      { id: 'c9-e9', title: 'Chapter 9: If I Were You' },
    ],
  },
  'Class 10': {
    Mathematics: [
      { id: 'c10-m1', title: 'Chapter 1: Real Numbers' },
      { id: 'c10-m2', title: 'Chapter 2: Polynomials' },
      { id: 'c10-m3', title: 'Chapter 3: Pair of Linear Equations in Two Variables' },
      { id: 'c10-m4', title: 'Chapter 4: Quadratic Equations' },
      { id: 'c10-m5', title: 'Chapter 5: Arithmetic Progressions (AP)' },
      { id: 'c10-m6', title: 'Chapter 6: Triangles' },
      { id: 'c10-m7', title: 'Chapter 7: Coordinate Geometry' },
      { id: 'c10-m8', title: 'Chapter 8: Introduction to Trigonometry' },
      { id: 'c10-m9', title: 'Chapter 9: Some Applications of Trigonometry' },
      { id: 'c10-m10', title: 'Chapter 10: Circles' },
      { id: 'c10-m11', title: 'Chapter 11: Areas Related to Circles' },
      { id: 'c10-m12', title: 'Chapter 12: Surface Areas and Volumes' },
      { id: 'c10-m13', title: 'Chapter 13: Statistics' },
      { id: 'c10-m14', title: 'Chapter 14: Probability' },
    ],
    Science: [
      { id: 'c10-s1', title: 'Chapter 1: Chemical Reactions and Equations' },
      { id: 'c10-s2', title: 'Chapter 2: Acids, Bases and Salts' },
      { id: 'c10-s3', title: 'Chapter 3: Metals and Non-Metals' },
      { id: 'c10-s4', title: 'Chapter 4: Carbon and its Compounds' },
      { id: 'c10-s5', title: 'Chapter 5: Life Processes' },
      { id: 'c10-s6', title: 'Chapter 6: Control and Coordination' },
      { id: 'c10-s7', title: 'Chapter 7: How do Organisms Reproduce?' },
      { id: 'c10-s8', title: 'Chapter 8: Heredity and Evolution' },
      { id: 'c10-s9', title: 'Chapter 9: Light — Reflection & Refraction' },
      { id: 'c10-s10', title: 'Chapter 10: The Human Eye and Colourful World' },
      { id: 'c10-s11', title: 'Chapter 11: Electricity' },
      { id: 'c10-s12', title: 'Chapter 12: Magnetic Effects of Electric Current' },
      { id: 'c10-s13', title: 'Chapter 13: Our Environment' },
    ],
    English: [
      { id: 'c10-e1', title: 'Chapter 1: A Letter to God' },
      { id: 'c10-e2', title: 'Chapter 2: Nelson Mandela — Long Walk to Freedom' },
      { id: 'c10-e3', title: 'Chapter 3: Two Stories About Flying' },
      { id: 'c10-e4', title: 'Chapter 4: From the Diary of Anne Frank' },
      { id: 'c10-e5', title: 'Chapter 5: Glimpses of India' },
      { id: 'c10-e6', title: 'Chapter 6: Mijbil the Otter' },
      { id: 'c10-e7', title: 'Chapter 7: Madam Rides the Bus' },
      { id: 'c10-e8', title: 'Chapter 8: The Sermon at Benares' },
      { id: 'c10-e9', title: 'Chapter 9: The Proposal' },
    ],
  },
  'Class 11': {
    Mathematics: [
      { id: 'c11-m1', title: 'Chapter 1: Sets' },
      { id: 'c11-m2', title: 'Chapter 2: Relations and Functions' },
      { id: 'c11-m3', title: 'Chapter 3: Trigonometric Functions' },
      { id: 'c11-m4', title: 'Chapter 4: Complex Numbers and Quadratic Equations' },
      { id: 'c11-m5', title: 'Chapter 5: Linear Inequalities' },
      { id: 'c11-m6', title: 'Chapter 6: Permutations and Combinations' },
      { id: 'c11-m7', title: 'Chapter 7: Binomial Theorem' },
      { id: 'c11-m8', title: 'Chapter 8: Sequences and Series' },
      { id: 'c11-m9', title: 'Chapter 9: Straight Lines' },
      { id: 'c11-m10', title: 'Chapter 10: Conic Sections' },
      { id: 'c11-m11', title: 'Chapter 11: Introduction to Three Dimensional Geometry' },
      { id: 'c11-m12', title: 'Chapter 12: Limits and Derivatives' },
      { id: 'c11-m13', title: 'Chapter 13: Statistics' },
      { id: 'c11-m14', title: 'Chapter 14: Probability' },
    ],
    Physics: [
      { id: 'c11-p1', title: 'Chapter 1: Units and Measurements' },
      { id: 'c11-p2', title: 'Chapter 2: Motion in a Straight Line' },
      { id: 'c11-p3', title: 'Chapter 3: Motion in a Plane' },
      { id: 'c11-p4', title: 'Chapter 4: Laws of Motion' },
      { id: 'c11-p5', title: 'Chapter 5: Work, Energy and Power' },
      { id: 'c11-p6', title: 'Chapter 6: System of Particles and Rotational Motion' },
      { id: 'c11-p7', title: 'Chapter 7: Gravitation' },
      { id: 'c11-p8', title: 'Chapter 8: Mechanical Properties of Solids' },
      { id: 'c11-p9', title: 'Chapter 9: Mechanical Properties of Fluids' },
      { id: 'c11-p10', title: 'Chapter 10: Thermal Properties of Matter' },
      { id: 'c11-p11', title: 'Chapter 11: Thermodynamics' },
      { id: 'c11-p12', title: 'Chapter 12: Kinetic Theory of Gases' },
      { id: 'c11-p13', title: 'Chapter 13: Oscillations' },
      { id: 'c11-p14', title: 'Chapter 14: Waves' },
    ],
    Chemistry: [
      { id: 'c11-c1', title: 'Chapter 1: Some Basic Concepts of Chemistry' },
      { id: 'c11-c2', title: 'Chapter 2: Structure of Atom' },
      { id: 'c11-c3', title: 'Chapter 3: Classification of Elements & Periodicity' },
      { id: 'c11-c4', title: 'Chapter 4: Chemical Bonding & Molecular Structure' },
      { id: 'c11-c5', title: 'Chapter 5: Chemical Thermodynamics' },
      { id: 'c11-c6', title: 'Chapter 6: Equilibrium' },
      { id: 'c11-c7', title: 'Chapter 7: Redox Reactions' },
      { id: 'c11-c8', title: 'Chapter 8: Organic Chemistry — Basic Principles & Techniques' },
      { id: 'c11-c9', title: 'Chapter 9: Hydrocarbons' },
    ],
    Biology: [
      { id: 'c11-b1', title: 'Chapter 1: The Living World' },
      { id: 'c11-b2', title: 'Chapter 2: Biological Classification' },
      { id: 'c11-b3', title: 'Chapter 3: Plant Kingdom' },
      { id: 'c11-b4', title: 'Chapter 4: Animal Kingdom' },
      { id: 'c11-b5', title: 'Chapter 5: Morphology of Flowering Plants' },
      { id: 'c11-b6', title: 'Chapter 6: Anatomy of Flowering Plants' },
      { id: 'c11-b7', title: 'Chapter 7: Structural Organisation in Animals' },
      { id: 'c11-b8', title: 'Chapter 8: Cell — The Unit of Life' },
      { id: 'c11-b9', title: 'Chapter 9: Biomolecules' },
      { id: 'c11-b10', title: 'Chapter 10: Cell Cycle and Cell Division' },
      { id: 'c11-b11', title: 'Chapter 11: Photosynthesis in Higher Plants' },
      { id: 'c11-b12', title: 'Chapter 12: Respiration in Plants' },
      { id: 'c11-b13', title: 'Chapter 13: Plant Growth and Development' },
      { id: 'c11-b14', title: 'Chapter 14: Breathing and Exchange of Gases' },
      { id: 'c11-b15', title: 'Chapter 15: Body Fluids and Circulation' },
      { id: 'c11-b16', title: 'Chapter 16: Excretory Products and Their Elimination' },
      { id: 'c11-b17', title: 'Chapter 17: Locomotion and Movement' },
      { id: 'c11-b18', title: 'Chapter 18: Neural Control and Coordination' },
      { id: 'c11-b19', title: 'Chapter 19: Chemical Coordination and Integration' },
    ],
    English: [
      { id: 'c11-e1', title: 'Chapter 1: The Portrait of a Lady' },
      { id: 'c11-e2', title: 'Chapter 2: We\'re Not Afraid to Die...' },
      { id: 'c11-e3', title: 'Chapter 3: Discovering Tut: The Saga Continues' },
      { id: 'c11-e4', title: 'Chapter 4: The Voice of the Rain' },
      { id: 'c11-e5', title: 'Chapter 5: The Ailing Planet' },
      { id: 'c11-e6', title: 'Chapter 6: The Browning Version' },
      { id: 'c11-e7', title: 'Chapter 7: Silk Road' },
    ],
  },
  'Class 12': {
    Mathematics: [
      { id: 'c12-m1', title: 'Chapter 1: Relations and Functions' },
      { id: 'c12-m2', title: 'Chapter 2: Inverse Trigonometric Functions' },
      { id: 'c12-m3', title: 'Chapter 3: Matrices' },
      { id: 'c12-m4', title: 'Chapter 4: Determinants' },
      { id: 'c12-m5', title: 'Chapter 5: Continuity and Differentiability' },
      { id: 'c12-m6', title: 'Chapter 6: Applications of Derivatives' },
      { id: 'c12-m7', title: 'Chapter 7: Integrals' },
      { id: 'c12-m8', title: 'Chapter 8: Applications of Integrals' },
      { id: 'c12-m9', title: 'Chapter 9: Differential Equations' },
      { id: 'c12-m10', title: 'Chapter 10: Vector Algebra' },
      { id: 'c12-m11', title: 'Chapter 11: Three Dimensional Geometry' },
      { id: 'c12-m12', title: 'Chapter 12: Linear Programming' },
      { id: 'c12-m13', title: 'Chapter 13: Probability' },
    ],
    Physics: [
      { id: 'c12-p1', title: 'Chapter 1: Electric Charges and Fields' },
      { id: 'c12-p2', title: 'Chapter 2: Electrostatic Potential and Capacitance' },
      { id: 'c12-p3', title: 'Chapter 3: Current Electricity' },
      { id: 'c12-p4', title: 'Chapter 4: Moving Charges and Magnetism' },
      { id: 'c12-p5', title: 'Chapter 5: Magnetism and Matter' },
      { id: 'c12-p6', title: 'Chapter 6: Electromagnetic Induction' },
      { id: 'c12-p7', title: 'Chapter 7: Alternating Current' },
      { id: 'c12-p8', title: 'Chapter 8: Electromagnetic Waves' },
      { id: 'c12-p9', title: 'Chapter 9: Ray Optics and Optical Instruments' },
      { id: 'c12-p10', title: 'Chapter 10: Wave Optics' },
      { id: 'c12-p11', title: 'Chapter 11: Dual Nature of Radiation and Matter' },
      { id: 'c12-p12', title: 'Chapter 12: Atoms' },
      { id: 'c12-p13', title: 'Chapter 13: Nuclei' },
      { id: 'c12-p14', title: 'Chapter 14: Semiconductor Electronics' },
    ],
    Chemistry: [
      { id: 'c12-c1', title: 'Chapter 1: Solutions' },
      { id: 'c12-c2', title: 'Chapter 2: Electrochemistry' },
      { id: 'c12-c3', title: 'Chapter 3: Chemical Kinetics' },
      { id: 'c12-c4', title: 'Chapter 4: The d- and f- Block Elements' },
      { id: 'c12-c5', title: 'Chapter 5: Coordination Compounds' },
      { id: 'c12-c6', title: 'Chapter 6: Haloalkanes and Haloarenes' },
      { id: 'c12-c7', title: 'Chapter 7: Alcohols, Phenols and Ethers' },
      { id: 'c12-c8', title: 'Chapter 8: Aldehydes, Ketones and Carboxylic Acids' },
      { id: 'c12-c9', title: 'Chapter 9: Amines' },
      { id: 'c12-c10', title: 'Chapter 10: Biomolecules' },
    ],
    Biology: [
      { id: 'c12-b1', title: 'Chapter 1: Sexual Reproduction in Flowering Plants' },
      { id: 'c12-b2', title: 'Chapter 2: Human Reproduction' },
      { id: 'c12-b3', title: 'Chapter 3: Reproductive Health' },
      { id: 'c12-b4', title: 'Chapter 4: Principles of Inheritance and Variation' },
      { id: 'c12-b5', title: 'Chapter 5: Molecular Basis of Inheritance' },
      { id: 'c12-b6', title: 'Chapter 6: Evolution' },
      { id: 'c12-b7', title: 'Chapter 7: Human Health and Disease' },
      { id: 'c12-b8', title: 'Chapter 8: Microbes in Human Welfare' },
      { id: 'c12-b9', title: 'Chapter 9: Biotechnology: Principles and Processes' },
      { id: 'c12-b10', title: 'Chapter 10: Biotechnology and its Applications' },
      { id: 'c12-b11', title: 'Chapter 11: Organisms and Populations' },
      { id: 'c12-b12', title: 'Chapter 12: Ecosystem' },
      { id: 'c12-b13', title: 'Chapter 13: Biodiversity and Conservation' },
    ],
    English: [
      { id: 'c12-e1', title: 'Chapter 1: The Last Lesson' },
      { id: 'c12-e2', title: 'Chapter 2: Lost Spring' },
      { id: 'c12-e3', title: 'Chapter 3: Deep Water' },
      { id: 'c12-e4', title: 'Chapter 4: The Rattrap' },
      { id: 'c12-e5', title: 'Chapter 5: Indigo' },
      { id: 'c12-e6', title: 'Chapter 6: Poets and Pancakes' },
      { id: 'c12-e7', title: 'Chapter 7: The Interview' },
      { id: 'c12-e8', title: 'Chapter 8: Going Places' },
    ],
  },
};

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
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('MCQ');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState(null); // null = show form; object = show preview

  const availableSubjects = CLASS_SUBJECTS[selectedClass] || ['Mathematics'];
  const chapters = CLASS_CHAPTERS[selectedClass]?.[selectedSubject] || CLASS_CHAPTERS['Class 10']?.['Mathematics'] || [];
  const selectedChapter = chapters.find((ch) => ch.id === selectedChapterId) || chapters[0];

  // Reset generated quiz when modal closes
  const handleClose = () => {
    if (!isGenerating) {
      setGeneratedQuiz(null);
      setError('');
      onClose();
    }
  };

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    const subs = CLASS_SUBJECTS[cls] || ['Mathematics'];
    const nextSub = subs.includes(selectedSubject) ? selectedSubject : subs[0];
    setSelectedSubject(nextSub);
    const nextChapters = CLASS_CHAPTERS[cls]?.[nextSub] || [];
    setSelectedChapterId(nextChapters[0]?.id || '');
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    const nextChapters = CLASS_CHAPTERS[selectedClass]?.[subject] || [];
    setSelectedChapterId(nextChapters[0]?.id || '');
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
        courseName: `${selectedClass} ${selectedSubject}: ${chapterTitle}`,
        className: selectedClass,
        subject: `${selectedClass} ${selectedSubject}`,
        difficulty,
        questionCount,
        type: questionType,
      });

      // Attach subject label for display
      newQuiz.courseCode = `${selectedClass.replace('Class ', 'C')}-${selectedSubject.slice(0, 3).toUpperCase()}`;
      newQuiz.subject = `${selectedClass} ${selectedSubject}`;
      if (!newQuiz.title) {
        newQuiz.title = `${selectedClass} ${selectedSubject}: ${chapterTitle}`;
      }

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

        {/* ── 1 & 2. Class & Subject Selectors ──────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={LABEL_STYLE}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={15} color="var(--primary)" />
                Class / Grade
              </span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              style={SELECT_STYLE}
            >
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={LABEL_STYLE}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={15} color="var(--primary)" />
                Subject
              </span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              style={SELECT_STYLE}
            >
              {availableSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── 3. Syllabus Topic (Chapters shown according to Class Name) ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>
              Syllabus Topic / Chapter
            </label>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--primary)',
                background: 'rgba(99, 102, 241, 0.12)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {selectedClass} &bull; {selectedSubject} ({chapters.length} Chapters)
            </span>
          </div>
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
