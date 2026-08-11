'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Resume {
  id: string;
  title: string;
  content: string;
  ats_score: number;
  keywords: string[];
  file_url: string;
  created_at: string;
}

// SVG Circular Progress for ATS score
function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
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
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-[#6b7280] font-medium">/ 100</span>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ats_score: number; checks: {item: string; status: string; detail: string}[]; suggestions: string[]} | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchResumes = async () => {
    try {
      const res = await api.get('/api/resume');
      setResumes(res.data.resumes);
    } catch {
      setError('Failed to load resumes');
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumes([res.data.resume, ...resumes]);
      setMessage('Resume uploaded successfully!');
    } catch {
      setError('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (resumeId: string) => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.post(`/api/resume/${resumeId}/analyze`);
      setAnalysis(res.data);
      setSelectedResume({ ...selectedResume!, ats_score: res.data.ats_score });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete(`/api/resume/${resumeId}`);
      setResumes(resumes.filter(r => r.id !== resumeId));
      if (selectedResume?.id === resumeId) setSelectedResume(null);
    } catch {
      setError('Failed to delete resume');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Resume Studio</h1>
            <p className="text-[#6b7280] text-sm mt-0.5">Upload, analyze, and optimize your resume with AI</p>
          </div>
        </div>
        <label className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-5 rounded-xl cursor-pointer transition shadow-sm text-sm group">
          <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Resume'}
          <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {message && <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-4 py-3 rounded-xl mb-6 text-sm">{message}</div>}
      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#f4f5f9] rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </span>
            Your Resumes
          </h2>
          {resumes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-[#f4f5f9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[#1a1a2e] font-medium text-sm">No resumes yet</p>
              <p className="text-[#9ca3af] text-xs mt-1">Upload your first resume to get started</p>
            </div>
          ) : (
            resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => { setSelectedResume(resume); setAnalysis(null); }}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  selectedResume?.id === resume.id ? 'border-[#2d2d3f] ring-2 ring-[#2d2d3f]/10' : 'border-[#eef0f5] hover:border-[#2d2d3f]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    resume.ats_score > 0 ? 'bg-gradient-to-br from-emerald-50 to-green-50' : 'bg-[#f4f5f9]'
                  }`}>
                    <svg className={`w-5 h-5 ${resume.ats_score > 0 ? 'text-emerald-600' : 'text-[#9ca3af]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1a1a2e] text-sm truncate">{resume.title}</h3>
                      {resume.ats_score > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          resume.ats_score >= 70 ? 'bg-[#f0fdf4] text-[#15803d]' :
                          resume.ats_score >= 40 ? 'bg-[#fffbeb] text-[#b45309]' :
                          'bg-[#fef2f2] text-[#dc2626]'
                        }`}>{resume.ats_score}%</span>
                      )}
                    </div>
                    <p className="text-[#9ca3af] text-xs mt-1">{new Date(resume.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resume Detail / Analysis */}
        <div className="lg:col-span-2">
          {selectedResume ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f4f5f9] rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-[#1a1a2e]">{selectedResume.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnalyze(selectedResume.id)}
                      disabled={analyzing}
                      className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-medium py-2 px-4 rounded-xl transition text-sm disabled:opacity-50"
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze ATS'}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedResume.id)}
                      className="text-[#ef4444] hover:bg-[#fef2f2] font-medium py-2 px-4 rounded-xl transition text-sm border border-[#fecaca]"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {selectedResume.content ? (
                  <div className="bg-[#f8f8fc] rounded-xl p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-[#1a1a2e] whitespace-pre-wrap font-sans">{selectedResume.content}</pre>
                  </div>
                ) : (
                  <div className="bg-[#f8f8fc] rounded-xl p-8 text-center">
                    <p className="text-[#6b7280] text-sm">No text content available</p>
                    <p className="text-[#9ca3af] text-xs mt-1">Upload a .txt file or add content manually</p>
                  </div>
                )}

                {selectedResume.keywords && selectedResume.keywords.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[#1a1a2e] mb-2">Keywords Found:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.keywords.map((kw, i) => (
                        <span key={i} className="bg-[#f0f0f5] text-[#4f6ef7] text-xs px-2.5 py-1 rounded-lg border border-[#dbe4ff]">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ATS Analysis Results */}
              {analysis && (
                <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-[#f4f5f9] rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1a1a2e]">ATS Analysis Report</h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 p-5 bg-[#f8f9fc] rounded-2xl">
                    <ScoreRing score={analysis.ats_score} />
                    <div>
                      <p className="font-semibold text-[#1a1a2e] text-lg">ATS Score</p>
                      <p className="text-sm text-[#6b7280] mt-1">{analysis.ats_score >= 70 ? 'Great resume! Ready to send.' : analysis.ats_score >= 40 ? 'Needs some improvements.' : 'Significant improvements needed.'}</p>
                      <div className="flex gap-2 mt-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${analysis.ats_score >= 70 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {analysis.ats_score >= 70 ? 'Excellent' : analysis.ats_score >= 40 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {analysis.checks.map((check: {item: string; status: string; detail: string}, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          check.status === 'pass' ? 'bg-[#22c55e] text-white' :
                          check.status === 'warning' ? 'bg-[#f59e0b] text-white' :
                          'bg-[#ef4444] text-white'
                        }`}>{check.status === 'pass' ? '✓' : check.status === 'warning' ? '!' : '✗'}</span>
                        <div>
                          <p className="text-sm font-medium text-[#1a1a2e]">{check.item}</p>
                          <p className="text-xs text-[#6b7280]">{check.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-[#f4f5f9] to-[#f8f9fc] rounded-2xl p-5">
                    <p className="text-sm font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      Suggestions
                    </p>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-[#4b5563] flex items-start gap-2.5">
                          <span className="w-5 h-5 bg-white rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#2d2d3f] shadow-sm mt-0.5">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-[#f4f5f9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[#1a1a2e] font-medium">Select a resume to view details</p>
              <p className="text-[#9ca3af] text-sm mt-1">Or upload a new resume to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
