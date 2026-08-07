'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface InterviewSession {
  id: string;
  role: string;
  difficulty: string;
  questions: string[];
  total_questions: number;
}

export default function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [report, setReport] = useState<{scores: Record<string, number>; question_scores: {question: string; score: number}[]; feedback: string} | null>(null);
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{id: string; role: string; difficulty: string; interview_date: string; scores: {overall?: number}}[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/interview/history');
      setHistory(res.data.interviews);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const startInterview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/interview/start', { role, difficulty, num_questions: 6 });
      setSession(res.data.interview);
      setStarted(true);
      setCurrentQ(0);
      setAnswers(new Array(res.data.interview.total_questions).fill(''));
      setReport(null);
    } catch {
      setError('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async () => {
    if (!session) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = answer;
    setAnswers(newAnswers);

    try {
      await api.post(`/api/interview/${session.id}/answer`, { question_index: currentQ, answer });
    } catch { /* ignore */ }

    if (currentQ < session.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer('');
    }
  };

  const completeInterview = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await api.post(`/api/interview/${session.id}/complete`);
      setReport(res.data.report);
      setStarted(false);
      fetchHistory();
    } catch {
      setError('Failed to complete interview');
    } finally {
      setLoading(false);
    }
  };

  if (report) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e2a4a] mb-6">Interview Report</h1>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 mb-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${
              report.scores.overall >= 70 ? 'bg-[#f0fdf4] text-[#15803d]' :
              report.scores.overall >= 40 ? 'bg-[#fffbeb] text-[#b45309]' :
              'bg-[#fef2f2] text-[#dc2626]'
            }`}>{report.scores.overall}%</div>
            <p className="text-[#6b7280] mt-3">{report.feedback}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Object.entries(report.scores).filter(([k]) => k !== 'overall').map(([key, val]) => (
              <div key={key} className="bg-[#f9fafb] rounded-xl p-4 text-center">
                <p className="text-xs text-[#6b7280] capitalize mb-1">{key}</p>
                <p className="text-xl font-bold text-[#1e2a4a]">{val as number}%</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[#1e2a4a]">Question Breakdown</h3>
            {report.question_scores.map((qs: {question: string; score: number}, i: number) => (
              <div key={i} className="bg-[#f9fafb] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[#1e2a4a]">Q{i + 1}</p>
                  <span className={`text-sm font-bold ${qs.score >= 70 ? 'text-[#15803d]' : qs.score >= 40 ? 'text-[#b45309]' : 'text-[#dc2626]'}`}>{qs.score}%</span>
                </div>
                <p className="text-xs text-[#6b7280]">{qs.question}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => { setReport(null); setStarted(false); setSession(null); }} className="bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm">
          Start New Interview
        </button>
      </div>
    );
  }

  if (started && session) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1e2a4a]">Interview Practice</h1>
          <span className="text-sm text-[#6b7280]">Question {currentQ + 1} of {session.questions.length}</span>
        </div>

        <div className="w-full bg-[#eef1f5] rounded-full h-2 mb-6">
          <div className="bg-[#4f6ef7] h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / session.questions.length) * 100}%` }} />
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 mb-6">
          <p className="text-xs text-[#4f6ef7] font-semibold uppercase tracking-wide mb-2">Question {currentQ + 1}</p>
          <h2 className="text-lg font-semibold text-[#1e2a4a] mb-4">{session.questions[currentQ]}</h2>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#4f6ef7] focus:border-transparent text-sm bg-white text-[#1e2a4a] placeholder-[#9ca3af]"
            placeholder="Type your answer here..."
          />
        </div>

        <div className="flex gap-3">
          {currentQ < session.questions.length - 1 ? (
            <button onClick={saveAnswer} className="bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm">
              Next Question
            </button>
          ) : (
            <button onClick={completeInterview} disabled={loading} className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm disabled:opacity-50">
              {loading ? 'Generating Report...' : 'Complete Interview'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1e2a4a] mb-2">Interview Arena</h1>
      <p className="text-[#6b7280] mb-8">Practice with AI-generated interview questions</p>

      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#1e2a4a] mb-4">Start New Session</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1e2a4a] mb-2">Role</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#4f6ef7] text-sm bg-white text-[#1e2a4a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e2a4a] mb-2">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-[#4f6ef7] text-sm bg-white text-[#1e2a4a]">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={startInterview} disabled={loading} className="w-full bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold py-2.5 rounded-xl transition text-sm disabled:opacity-50">
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1e2a4a] mb-4">Interview History</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#1e2a4a] text-sm">{h.role}</p>
                  <p className="text-xs text-[#6b7280]">{h.difficulty} | {new Date(h.interview_date).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                  (h.scores?.overall ?? 0) >= 70 ? 'bg-[#f0fdf4] text-[#15803d]' :
                  (h.scores?.overall ?? 0) >= 40 ? 'bg-[#fffbeb] text-[#b45309]' :
                  'bg-[#fef2f2] text-[#dc2626]'
                }`}>{h.scores?.overall ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
