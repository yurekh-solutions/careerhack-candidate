'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const QUICK_PROMPTS = [
  'Help me write a cover letter',
  'Give me interview tips',
  'How do I negotiate salary?',
  'How can I improve my resume?',
  'Help me write a resignation letter',
  'Write a LinkedIn outreach message',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/assistant/history');
      setMessages(res.data.messages);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setError('');
    setLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: msg,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.post('/api/assistant/chat', { message: msg });
      setMessages(prev => [...prev, res.data.message]);
    } catch {
      setError('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Clear all chat history?')) return;
    try {
      await api.post('/api/assistant/clear');
      setMessages([]);
    } catch { /* ignore */ }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">AI Career Assistant</h1>
          <p className="text-[#6b7280] text-sm mt-1">Ask me anything about your career</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="text-[#6b7280] hover:text-[#ef4444] text-sm font-medium transition">Clear</button>
        )}
      </div>

      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

      {/* Messages */}
      <div className="bg-white rounded-xl border border-[#f0f0f5] flex-1 overflow-y-auto p-4 mb-4" style={{ minHeight: '300px', maxHeight: 'calc(100vh - 280px)' }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-[#f0f0f5] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#4f6ef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-[#1a1a2e] font-semibold mb-1">How can I help you?</p>
            <p className="text-[#6b7280] text-sm mb-6">Choose a topic or type your question</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="bg-[#f0f0f5] hover:bg-[#dbe4ff] text-[#4f6ef7] text-xs font-medium px-3 py-2 rounded-xl transition border border-[#dbe4ff]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#4f6ef7] text-white rounded-br-md'
                    : 'bg-[#f4f4f9] text-[#1a1a2e] rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#f4f4f9] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#4f6ef7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#4f6ef7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#4f6ef7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about cover letters, interviews, salary negotiation..."
          className="flex-1 px-4 py-3 border border-[#f0f0f5] rounded-xl focus:ring-2 focus:ring-[#4f6ef7] focus:border-transparent text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af]"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold px-6 rounded-xl transition text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
