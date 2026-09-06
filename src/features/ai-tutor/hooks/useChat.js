import { useState, useEffect, useCallback } from 'react';
import { tutorService } from '../services/tutorService';

/**
 * useChat Custom Hook
 * Manages conversational state, message history, streaming tokens, mode switches, and thread operations.
 */
export function useChat(courseId) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('normal'); // 'normal' | 'eli10' | 'detailed' | 'exam' | 'hint'
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState(null);

  // Load threads on mount or courseId change
  const loadConversations = useCallback(async () => {
    if (!courseId) return;
    setError(null);
    try {
      const threads = await tutorService.getConversations(courseId);
      setConversations(threads);
      if (threads.length > 0) {
        const initialThread = threads[0];
        setActiveConversationId(initialThread.id);
        setMessages(initialThread.messages || []);
      } else {
        // Create initial thread if none exist
        const newThread = await tutorService.createConversation(courseId, 'Initial Study Discussion');
        setConversations([newThread]);
        setActiveConversationId(newThread.id);
        setMessages(newThread.messages || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Could not retrieve conversation history.');
    }
  }, [courseId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Switch conversation thread
  const switchConversation = (conversationId) => {
    const thread = conversations.find((t) => t.id === conversationId);
    if (thread) {
      setActiveConversationId(thread.id);
      setMessages(thread.messages || []);
      setError(null);
    }
  };

  // Start new conversation thread
  const startNewConversation = async (title = 'New Discussion') => {
    try {
      const newThread = await tutorService.createConversation(courseId, title);
      setConversations((prev) => [newThread, ...prev]);
      setActiveConversationId(newThread.id);
      setMessages(newThread.messages || []);
      setError(null);
    } catch (err) {
      setError('Failed to create new conversation thread.');
    }
  };

  // Clear messages in active conversation
  const clearConversation = () => {
    setMessages([]);
    setError(null);
  };

  // Send a student message
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading || isStreaming) return;

    setError(null);
    const userMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const aiResponse = await tutorService.sendMessage(
        {
          courseId,
          conversationId: activeConversationId,
          message: text,
          mode,
        },
        (chunk) => {
          setStreamingContent(chunk);
        }
      );

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setError(err.message || 'Error receiving answer from AI Tutor.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // Retry the last message in conversation
  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove any failed or last assistant message
      setMessages((prev) => {
        const lastIdx = prev.length - 1;
        if (prev[lastIdx]?.role === 'assistant') {
          return prev.slice(0, lastIdx);
        }
        return prev;
      });
      sendMessage(lastUserMessage.content);
    }
  };

  return {
    conversations,
    activeConversationId,
    messages,
    mode,
    setMode,
    isLoading,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    retryLastMessage,
    startNewConversation,
    switchConversation,
    clearConversation,
  };
}

export default useChat;
