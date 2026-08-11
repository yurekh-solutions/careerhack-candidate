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

// SVG Score Ring for report
function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#15803d' : score >= 40 ? '#b45309' : '#dc2626';
  const bgColor = score >= 70 ? '#dcfce7' : score >= 40 ? '#fef3c7' : '#fee2e2';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Interview Report</h1>
            <p className="text-[#6b7280] text-sm">Your performance breakdown</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-6 mb-6">
          {/* Overall Score */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-[#f8f9fc] rounded-2xl">
            <ScoreRing score={report.scores.overall} />
            <div>
              <p className="text-lg font-bold text-[#1a1a2e]">Overall Score</p>
              <p className="text-sm text-[#6b7280] mt-1">{report.feedback}</p>
              <div className="flex gap-2 mt-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  report.scores.overall >= 70 ? 'bg-green-50 text-green-700' :
                  report.scores.overall >= 40 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {report.scores.overall >= 70 ? 'Excellent' : report.scores.overall >= 40 ? 'Good effort' : 'Keep practicing'}
                </span>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Object.entries(report.scores).filter(([k]) => k !== 'overall').map(([key, val]) => (
              <div key={key} className="bg-[#f8f9fc] rounded-xl p-4 text-center">
                <p className="text-xs text-[#6b7280] capitalize mb-2">{key}</p>
                <div className="w-full bg-[#eef0f5] rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full transition-all duration-700 ${(val as number) >= 70 ? 'bg-green-500' : (val as number) >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${val as number}%` }} />
                </div>
                <p className="text-lg font-bold text-[#1a1a2e]">{val as number}%</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[#1a1a2e] flex items-center gap-2">
              <span className="w-6 h-6 bg-[#f4f5f9] rounded-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </span>
              Question Breakdown
            </h3>
            {report.question_scores.map((qs: {question: string; score: number}, i: number) => (
              <div key={i} className="bg-[#f8f9fc] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-[10px] font-bold text-[#2d2d3f] shadow-sm">{i + 1}</span>
                    <p className="text-sm font-medium text-[#1a1a2e]">Question {i + 1}</p>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${qs.score >= 70 ? 'bg-green-50 text-[#15803d]' : qs.score >= 40 ? 'bg-amber-50 text-[#b45309]' : 'bg-red-50 text-[#dc2626]'}`}>{qs.score}%</span>
                </div>
                <p className="text-xs text-[#6b7280] ml-8">{qs.question}</p>
                <div className="ml-8 mt-2 w-full bg-[#eef0f5] rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${qs.score >= 70 ? 'bg-green-500' : qs.score >= 40 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${qs.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => { setReport(null); setStarted(false); setSession(null); }} className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm">
          Start New Interview
        </button>
      </div>
    );
  }

  if (started && session) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a2e]">Interview Practice</h1>
              <p className="text-xs text-[#6b7280]">{session.role} &middot; {session.difficulty}</p>
            </div>
          </div>
          <span className="text-sm text-[#6b7280] font-medium bg-[#f4f5f9] px-3 py-1.5 rounded-lg">Q {currentQ + 1}/{session.questions.length}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#eef0f5] rounded-full h-2 mb-4">
          <div className="bg-[#2d2d3f] h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / session.questions.length) * 100}%` }} />
        </div>

        {/* Question navigation dots */}
        <div className="flex gap-1.5 mb-6">
          {session.questions.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all ${
              i < currentQ ? 'bg-[#2d2d3f]' : i === currentQ ? 'bg-[#2d2d3f]/60' : 'bg-[#eef0f5]'
            }`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-6 mb-6">
          <p className="text-xs text-[#2d2d3f] font-semibold uppercase tracking-wide mb-2">Question {currentQ + 1}</p>
          <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">{session.questions[currentQ]}</h2>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition"
            placeholder="Type your answer here..."
          />
        </div>

        <div className="flex gap-3">
          {currentQ < session.questions.length - 1 ? (
            <button onClick={saveAnswer} className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm">
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
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Interview Arena</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">Practice with AI-generated interview questions</p>
        </div>
      </div>

      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-[#f4f5f9] rounded-md flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          Start New Session
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Role</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] transition">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={startInterview} disabled={loading} className="w-full bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 rounded-xl transition text-sm disabled:opacity-50 shadow-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Interview History</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f4f5f9] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#1a1a2e] text-sm">{h.role}</p>
                    <p className="text-xs text-[#6b7280]">{h.difficulty} &middot; {new Date(h.interview_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${
                  (h.scores?.overall ?? 0) >= 70 ? 'bg-green-50 text-[#15803d]' :
                  (h.scores?.overall ?? 0) >= 40 ? 'bg-amber-50 text-[#b45309]' :
                  'bg-red-50 text-[#dc2626]'
                }`}>{h.scores?.overall ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
