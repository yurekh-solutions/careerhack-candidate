'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Application {
  id: string;
  job: { title: string; company: string; location: string } | null;
  status: string;
  applied_date: string;
  notes: string;
  salary_offered?: number;
}

const STATUS_OPTIONS = ['applied', 'viewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];
const STATUS_COLORS: Record<string, string> = {
  applied: 'bg-[#eef1f8] text-[#4f6ef7]',
  viewed: 'bg-[#f0fdf4] text-[#15803d]',
  shortlisted: 'bg-[#fefce8] text-[#a16207]',
  interview: 'bg-[#faf5ff] text-[#7e22ce]',
  offer: 'bg-[#fff7ed] text-[#c2410c]',
  hired: 'bg-[#f0fdf4] text-[#15803d]',
  rejected: 'bg-[#fef2f2] text-[#dc2626]',
};
const STATUS_BORDER: Record<string, string> = {
  applied: 'border-l-[#4f6ef7]',
  viewed: 'border-l-[#22c55e]',
  shortlisted: 'border-l-[#eab308]',
  interview: 'border-l-[#8b5cf6]',
  offer: 'border-l-[#f97316]',
  hired: 'border-l-[#22c55e]',
  rejected: 'border-l-[#ef4444]',
};

// Mini progress ring
function MiniRing({ value, color, size = 44 }: { value: number; color: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef0f5" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', location: '', status: 'applied', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{total_applications: number; response_rate: number; interview_rate: number; offer_rate: number} | null>(null);

  const fetchData = async () => {
    try {
      const [appsRes, statsRes] = await Promise.all([
        api.get('/api/tracker'),
        api.get('/api/tracker/stats'),
      ]);
      setApplications(appsRes.data.applications);
      setStats(statsRes.data);
    } catch {
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!form.title || !form.company) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/tracker', form);
      setShowForm(false);
      setForm({ title: '', company: '', location: '', status: 'applied', notes: '' });
      fetchData();
    } catch {
      setError('Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, status: string) => {
    try {
      await api.put(`/api/tracker/${appId}`, { status });
      fetchData();
    } catch { /* ignore */ }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm('Delete this application?')) return;
    try {
      await api.delete(`/api/tracker/${appId}`);
      fetchData();
    } catch { /* ignore */ }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Application Tracker</h1>
            <p className="text-[#6b7280] text-sm mt-0.5">Track all your job applications in one place</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 sm:mt-0 bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-5 rounded-xl transition text-sm shadow-sm"
        >
          {showForm ? 'Cancel' : '+ Add Application'}
        </button>
      </div>

      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-4 flex items-center gap-3">
            <div className="relative">
              <MiniRing value={100} color="#1a1a2e" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1a1a2e]">{stats.total_applications}</span>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] font-medium">Total</p>
              <p className="text-sm font-bold text-[#1a1a2e]">Applied</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-4 flex items-center gap-3">
            <div className="relative">
              <MiniRing value={stats.response_rate} color="#4f6ef7" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#4f6ef7]">{stats.response_rate}%</span>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] font-medium">Response</p>
              <p className="text-sm font-bold text-[#4f6ef7]">Rate</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-4 flex items-center gap-3">
            <div className="relative">
              <MiniRing value={stats.interview_rate} color="#8b5cf6" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#8b5cf6]">{stats.interview_rate}%</span>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] font-medium">Interview</p>
              <p className="text-sm font-bold text-[#8b5cf6]">Rate</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-4 flex items-center gap-3">
            <div className="relative">
              <MiniRing value={stats.offer_rate} color="#22c55e" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#22c55e]">{stats.offer_rate}%</span>
            </div>
            <div>
              <p className="text-xs text-[#6b7280] font-medium">Offer</p>
              <p className="text-sm font-bold text-[#22c55e]">Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Add New Application</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Job Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition" />
            <input type="text" placeholder="Company *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition" />
            <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] transition">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="sm:col-span-2 w-full px-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition" />
          </div>
          <button onClick={handleAdd} disabled={loading} className="mt-4 bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Application'}
          </button>
        </div>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-[#f4f5f9] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-[#1a1a2e] font-medium">No applications tracked yet</p>
          <p className="text-[#9ca3af] text-sm mt-1">Add your first application to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className={`bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-4 sm:p-5 hover:shadow-md transition-all border-l-[3px] ${STATUS_BORDER[app.status] || 'border-l-gray-300'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1a1a2e] text-sm sm:text-base">{app.job?.title || 'Unknown Role'}</h3>
                  <p className="text-[#2d2d3f] text-xs font-medium">{app.job?.company || 'Unknown Company'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {app.job?.location && <span className="text-[#9ca3af] text-xs">{app.job.location}</span>}
                    <span className="text-[#9ca3af] text-xs">|</span>
                    <span className="text-[#9ca3af] text-xs">{app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {app.notes && <p className="text-[#6b7280] text-xs mt-2 italic">{app.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <button onClick={() => handleDelete(app.id)} className="text-[#9ca3af] hover:text-[#ef4444] transition p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
