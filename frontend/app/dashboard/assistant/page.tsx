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
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">AI Career Assistant</h1>
            <p className="text-[#6b7280] text-sm mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Online & ready to help
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="text-[#6b7280] hover:text-[#ef4444] text-sm font-medium transition flex items-center gap-1.5 border border-[#eef0f5] rounded-lg px-3 py-1.5 hover:border-red-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Clear
          </button>
        )}
      </div>

      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm flex-1 overflow-y-auto p-4 mb-4" style={{ minHeight: '300px', maxHeight: 'calc(100vh - 280px)' }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-[#f4f5f9] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="bg-[#f4f5f9] hover:bg-[#eef0f5] text-[#2d2d3f] text-xs font-medium px-3.5 py-2 rounded-xl transition border border-[#eef0f5] hover:border-[#2d2d3f]/20"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-[#2d2d3f] text-white'
                    : 'bg-gradient-to-br from-[#f4f5f9] to-[#eef0f5] text-[#2d2d3f]'
                }`}>
                  {msg.role === 'user' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  )}
                </div>
                <div>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#2d2d3f] text-white rounded-br-md'
                      : 'bg-[#f4f5f9] text-[#1a1a2e] rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] text-[#9ca3af] mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f4f5f9] to-[#eef0f5] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div className="bg-[#f4f5f9] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-[#2d2d3f]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#2d2d3f]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#2d2d3f]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3 mt-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about cover letters, interviews, salary..."
            className="w-full px-4 py-3 pr-12 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition"
            disabled={loading}
          />
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold px-5 rounded-xl transition text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
