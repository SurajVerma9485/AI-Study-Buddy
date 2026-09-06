import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  FileCheck,
  Brain,
  Lightbulb,
  GraduationCap,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function AITutor() {
  const { courses, selectedCourse, setSelectedCourseId } = useCourses();

  // 5 AI Tutor Modes
  const tutorModes = [
    { id: 'normal', name: 'Balanced Tutor', icon: Sparkles, desc: 'Clear, structured explanations' },
    { id: 'eli10', name: "Explain Like I'm 10", icon: Brain, desc: 'Intuitive analogies for complex topics' },
    { id: 'detailed', name: 'Deep Technical', icon: Layers, desc: 'Rigorous engineering breakdowns' },
    { id: 'exam', name: 'Exam Style', icon: GraduationCap, desc: 'High-scoring marking criteria answers' },
    { id: 'hint', name: 'Socratic Hint', icon: Lightbulb, desc: 'Guided questions without spoiling answers' },
  ];

  const [activeMode, setActiveMode] = useState('normal');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      role: 'assistant',
      content: `Hello! I'm your personalized AI Study Buddy for **${selectedCourse ? selectedCourse.name : 'Distributed Systems'}**. All my explanations are grounded in your uploaded syllabus and lecture documents. How can I help you today?`,
      mode: 'normal',
      sources: [],
    },
    {
      id: 'msg-2',
      role: 'user',
      content: 'Can you explain the difference between leader election in Raft versus Paxos?',
    },
    {
      id: 'msg-3',
      role: 'assistant',
      content: `In **Raft**, leader election is strongly randomized and centralized: nodes transition from Follower to Candidate with a randomized election timeout (typically 150–300ms) to avoid split votes. A candidate wins if it receives majority votes and its log is at least as up-to-date as the voters'.\n\nIn **Multi-Paxos**, leader election is implicit or decoupled. Any proposer can issue a Prepare(n) request; once accepted by a majority, it acts as the stable leader. Raft enforces that the leader always has all committed entries, whereas Paxos allows a newly elected leader to fill log holes before taking writes.`,
      mode: 'normal',
      sources: [
        { doc: 'Lecture-04-Raft-Consensus.pdf', chunk: 14, page: 6, relevance: '94%' },
        { doc: 'Syllabus-Fall-2026.docx', chunk: 3, page: 2, relevance: '82%' },
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isTyping) return;

    const userText = inputQuery;
    const userMsg = { id: `msg-${Date.now()}`, role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate RAG retrieval + LLM synthesis
    setTimeout(() => {
      let aiResponseText = '';
      let sources = [
        { doc: 'Lecture-04-Raft-Consensus.pdf', chunk: 22, page: 11, relevance: '91%' },
      ];

      if (activeMode === 'eli10') {
        aiResponseText = `Think of it like a classroom voting for a class captain: Raft gives everyone a kitchen timer set to random minutes. Whoever's timer rings first jumps up and asks everyone to vote for them! If most friends agree and you haven't skipped your homework, you're the captain!`;
      } else if (activeMode === 'hint') {
        aiResponseText = `Here's a thought experiment to guide you: What happens if two candidates request votes at the exact same millisecond? How does randomized timeouts in Raft prevent this deadlock from repeating indefinitely?`;
      } else if (activeMode === 'exam') {
        aiResponseText = `**Exam Criteria Breakdown (5 Marks):**\n1. Definition of randomized election timeouts (1 mark)\n2. Log up-to-date invariant requirement for leader safety (2 marks)\n3. Quorum majority rule ($N/2 + 1$) prevention of split-brain (2 marks).`;
      } else {
        aiResponseText = `Based on your course materials for **${selectedCourse?.code || 'CS 301'}**, this concept relies on strict majority quorums to maintain safety invariants under asynchronous network latency. Relevant chunks have been retrieved from your document store.`;
      }

      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponseText,
        mode: activeMode,
        sources,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }} className="animate-fade-in">
      {/* Tutor Header & Mode Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>AI Tutor with RAG Grounding</h1>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Course Context: <strong>{selectedCourse?.code} - {selectedCourse?.name}</strong>
          </span>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {tutorModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-medium)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-elevated)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
                title={mode.desc}
              >
                <Icon size={14} />
                {mode.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          padding: '12px 6px',
        }}
      >
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
              }}
            >
              {isAssistant && (
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Sparkles size={18} />
                </div>
              )}

              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isAssistant ? 'var(--bg-glass)' : 'var(--primary)',
                  color: isAssistant ? 'var(--text-primary)' : '#ffffff',
                  border: isAssistant ? '1px solid var(--border-subtle)' : 'none',
                  backdropFilter: isAssistant ? 'blur(16px)' : 'none',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                }}
              >
                {/* Message Content */}
                <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>

                {/* Grounded RAG Sources & Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <FileCheck size={12} color="var(--success)" /> Verified RAG Sources
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {msg.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          📄 {src.doc} • Chunk {src.chunk} (Page {src.page})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
            <span>Searching pgvector chunks and crafting {activeMode} explanation...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={`Ask a question in ${tutorModes.find((m) => m.id === activeMode)?.name}...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '14px 18px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={Send}
          disabled={!inputQuery.trim() || isTyping}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
