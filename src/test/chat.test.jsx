import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatInput from '../features/ai-tutor/components/ChatInput';
import TypingIndicator from '../features/ai-tutor/components/TypingIndicator';
import ModeSelector from '../features/ai-tutor/components/ModeSelector';
import MessageBubble from '../features/ai-tutor/components/MessageBubble';

describe('AI Tutor Chat Tests (Items 7, 8)', () => {
  it('7. Chat input accepts text and calls onSendMessage callback', () => {
    const handleSend = vi.fn();

    render(
      <ChatInput onSendMessage={handleSend} disabled={false} mode="normal" />
    );

    const textarea = screen.getByPlaceholderText(/Ask anything about/i);
    const sendBtn = screen.getByRole('button', { name: /Send/i });

    fireEvent.change(textarea, { target: { value: 'Explain Raft leader election' } });
    expect(textarea.value).toBe('Explain Raft leader election');

    fireEvent.click(sendBtn);
    expect(handleSend).toHaveBeenCalledWith('Explain Raft leader election');
  });

  it('8. Chat loading state renders TypingIndicator with animated status', () => {
    render(
      <TypingIndicator mode="eli10" />
    );

    expect(screen.getByText(/Retrieving course document chunks/i)).toBeInTheDocument();
  });

  it('8. Mode selector renders all 5 pedagogical modes', () => {
    const handleModeChange = vi.fn();

    render(
      <ModeSelector currentMode="normal" onSelectMode={handleModeChange} />
    );

    expect(screen.getByText(/Normal/i)).toBeInTheDocument();
    expect(screen.getByText(/Explain Like I'm 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Detailed/i)).toBeInTheDocument();
    expect(screen.getByText(/Exam Style/i)).toBeInTheDocument();
    expect(screen.getByText(/Socratic Hint/i)).toBeInTheDocument();
  });

  it('7 & 8. MessageBubble renders assistant message and grounding sources', () => {
    const mockMessage = {
      id: 'msg-1',
      role: 'assistant',
      content: 'In Raft, followers become candidates upon election timeout.',
      mode: 'normal',
      sources: [
        { documentName: 'Raft-Lecture-04.pdf', chunkIndex: 12, relevanceScore: 94 },
      ],
    };

    render(
      <MessageBubble message={mockMessage} />
    );

    expect(screen.getByText(/In Raft, followers become candidates/i)).toBeInTheDocument();
    expect(screen.getByText(/Raft-Lecture-04\.pdf/i)).toBeInTheDocument();
  });
});
