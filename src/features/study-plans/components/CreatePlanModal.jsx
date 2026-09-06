import React, { useState } from 'react';
import Modal, { ModalBody, ModalFooter } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import studyPlanService from '../services/studyPlanService';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  FileText,
  Layers,
  Zap,
} from 'lucide-react';

const CLASSES = ['Class 10', 'Class 9', 'Class 11', 'Class 12'];

const SUBJECTS = {
  'Class 10': ['Mathematics', 'Science', 'English'],
  'Class 9': ['Mathematics', 'Science', 'English'],
  'Class 11': ['Mathematics', 'Physics', 'Chemistry'],
  'Class 12': ['Mathematics', 'Physics', 'Chemistry'],
};

// Available chapters from the provided Class 10 Maths PDF notes
const CHAPTERS = {
  Mathematics: [
    {
      id: 'ch1',
      name: 'Chapter 1 - Real Numbers',
      badge: 'From Provided Notes',
      description: "Euclid's Division Lemma, HCF/LCM, Prime Factorisation, Irrationality Proofs, Decimal Expansions",
    },
    {
      id: 'ch2',
      name: 'Chapter 2 - Polynomials',
      badge: 'From Provided Notes',
      description: 'Degree, Geometrical Zeroes, Sum & Product of Zeroes, Division Algorithm, Middle-Term Splitting',
    },
  ],
  Science: [
    { id: 'sci1', name: 'Chapter 1 - Chemical Reactions and Equations', badge: 'Standard Syllabus' },
  ],
  English: [
    { id: 'eng1', name: 'Chapter 1 - A Letter to God', badge: 'Standard Syllabus' },
  ],
};

const DAY_PRESETS = [3, 5, 7, 10, 14, 21, 30];

const STUDY_TIME_OPTIONS = [
  { label: '1 hour / day', minutes: 60, subtext: 'Light daily pace' },
  { label: '1.5 hours / day', minutes: 90, subtext: 'Balanced focus' },
  { label: '2 hours / day', minutes: 120, subtext: 'Recommended for mastery' },
  { label: '3 hours / day', minutes: 180, subtext: 'Intensive revision' },
  { label: '4 hours / day', minutes: 240, subtext: 'Full sprint' },
];

export default function CreatePlanModal({ isOpen, onClose, onPlanCreated }) {
  // Step 1 = Class, Subject, Chapter, Days
  // Step 2 = Daily Study Time & Execute
  const [step, setStep] = useState(1);

  // Form selections
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedChapter, setSelectedChapter] = useState('Chapter 1 - Real Numbers');
  const [days, setDays] = useState(5);
  const [customDays, setCustomDays] = useState('');
  const [selectedTimeOption, setSelectedTimeOption] = useState(STUDY_TIME_OPTIONS[2]); // 2 hours/day default

  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  // Available subjects for selected class
  const availableSubjects = SUBJECTS[selectedClass] || ['Mathematics'];
  // Available chapters for selected subject
  const availableChapters = CHAPTERS[selectedSubject] || CHAPTERS.Mathematics;

  const handleClassChange = (e) => {
    const cls = e.target.value;
    setSelectedClass(cls);
    const subs = SUBJECTS[cls] || ['Mathematics'];
    setSelectedSubject(subs[0]);
    const chaps = CHAPTERS[subs[0]] || CHAPTERS.Mathematics;
    setSelectedChapter(chaps[0].name);
  };

  const handleSubjectChange = (e) => {
    const sub = e.target.value;
    setSelectedSubject(sub);
    const chaps = CHAPTERS[sub] || CHAPTERS.Mathematics;
    setSelectedChapter(chaps[0].name);
  };

  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    const effectiveDays = customDays ? parseInt(customDays, 10) : days;
    if (!effectiveDays || effectiveDays < 1 || effectiveDays > 60) {
      setError('Please choose a valid number of days between 1 and 60.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleExecute = async () => {
    const effectiveDays = customDays ? parseInt(customDays, 10) : days;
    try {
      setIsExecuting(true);
      setError(null);

      const plan = await studyPlanService.generateStudyPlan({
        classLevel: selectedClass,
        subject: selectedSubject,
        chapter: selectedChapter,
        days: effectiveDays,
        studyTime: selectedTimeOption.label,
        dailyMinutes: selectedTimeOption.minutes,
      });

      if (onPlanCreated) {
        onPlanCreated(plan);
      }
      onClose();
      // Reset step for next open
      setStep(1);
    } catch (err) {
      console.error('Study plan execution failed', err);
      setError(err.message || 'Failed to generate study plan with Grok. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  const effectiveDaysCount = customDays ? parseInt(customDays, 10) : days;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isExecuting ? () => {} : onClose}
      title={step === 1 ? 'Step 1: Select Syllabus & Days' : 'Step 2: Daily Study Time & Execute'}
      size="md"
    >
      <div style={{ padding: '4px 0' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'var(--primary)',
            }}
          />
          <div
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: step === 2 ? 'var(--primary)' : 'var(--border-subtle)',
              transition: 'background 0.3s ease',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        {/* STEP 1: CLASS, SUBJECT, CHAPTER, DAYS */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Select Class */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                <GraduationCap size={16} color="var(--primary)" />
                1. Select Class
              </label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                }}
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Subject */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                <BookOpen size={16} color="var(--primary)" />
                2. Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={handleSubjectChange}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                }}
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Select Lesson / Chapter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  <FileText size={16} color="var(--primary)" />
                  3. Select Lesson / Chapter
                </label>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    background: 'rgba(99, 102, 241, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  From Provided PDF Notes
                </span>
              </div>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.925rem',
                  outline: 'none',
                }}
              >
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.name}>
                    {ch.name}
                  </option>
                ))}
              </select>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {availableChapters.find((c) => c.name === selectedChapter)?.description || 'Includes core concepts, theorems & exercises.'}
              </p>
            </div>

            {/* 4. Select Number of Days */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  <Calendar size={16} color="var(--primary)" />
                  4. Select Number of Days
                </label>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {effectiveDaysCount} Days Plan
                </span>
              </div>

              {/* Preset Days Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {DAY_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDays(d);
                      setCustomDays('');
                    }}
                    style={{
                      flex: '1 0 calc(25% - 8px)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: !customDays && days === d ? 'var(--primary)' : 'var(--bg-elevated)',
                      color: !customDays && days === d ? '#ffffff' : 'var(--text-secondary)',
                      border: !customDays && days === d ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {d} Days
                  </button>
                ))}
              </div>

              {/* Meaning explanation */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Zap size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Goal:</strong> "I want to finish this syllabus in <strong>{effectiveDaysCount} days</strong>."
                </span>
              </div>
            </div>

            {/* Step 1 Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={ArrowRight}
              fullWidth
              style={{ marginTop: '6px' }}
            >
              Continue: Set Daily Study Time
            </Button>
          </form>
        )}

        {/* STEP 2: DAILY STUDY TIME & EXECUTE */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Recap Box */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                Configured Syllabus Target
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {selectedClass} • {selectedSubject}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '6px' }}>
                {selectedChapter}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Target Timeline: <strong>{effectiveDaysCount} Days</strong>
              </div>
            </div>

            {/* How much time can you study per day? */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.925rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                }}
              >
                <Clock size={18} color="var(--primary)" />
                How much time can you study per day?
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {STUDY_TIME_OPTIONS.map((opt) => {
                  const isSelected = selectedTimeOption.minutes === opt.minutes;
                  return (
                    <div
                      key={opt.minutes}
                      onClick={() => setSelectedTimeOption(opt)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-elevated)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {opt.subtext}
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 size={20} color="var(--primary)" />
                      ) : (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-medium)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                icon={ArrowLeft}
                onClick={() => setStep(1)}
                disabled={isExecuting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                icon={Sparkles}
                onClick={handleExecute}
                loading={isExecuting}
                disabled={isExecuting}
                fullWidth
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                {isExecuting ? 'Grok Synthesizing Plan...' : 'EXECUTE'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
