'use client';

import { useState } from 'react';

const candidates = [
  { id: 1, name: 'Alex Ray', position: 'Frontend Developer', match: 95, status: 'Shortlisted', date: '2 Aug 2025', email: 'alex@email.com' },
  { id: 2, name: 'Jerry Wilson', position: 'UI/UX Designer', match: 88, status: 'Interview', date: '1 Aug 2025', email: 'jerry@email.com' },
  { id: 3, name: 'Robert Fox', position: 'Backend Developer', match: 92, status: 'New', date: '31 Jul 2025', email: 'robert@email.com' },
  { id: 4, name: 'Esther Howard', position: 'Product Manager', match: 85, status: 'Shortlisted', date: '30 Jul 2025', email: 'esther@email.com' },
  { id: 5, name: 'Brooklyn Simmons', position: 'DevOps Engineer', match: 78, status: 'Review', date: '29 Jul 2025', email: 'brooklyn@email.com' },
  { id: 6, name: 'Cameron Lee', position: 'Data Scientist', match: 91, status: 'Shortlisted', date: '28 Jul 2025', email: 'cameron@email.com' },
  { id: 7, name: 'Diana Prince', position: 'Marketing Lead', match: 82, status: 'New', date: '27 Jul 2025', email: 'diana@email.com' },
  { id: 8, name: 'Evan Wright', position: 'Full Stack Developer', match: 89, status: 'Interview', date: '26 Jul 2025', email: 'evan@email.com' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Shortlisted': return 'bg-green-50 text-green-700';
    case 'Interview': return 'bg-blue-50 text-blue-700';
    case 'New': return 'bg-purple-50 text-purple-700';
    case 'Review': return 'bg-amber-50 text-amber-700';
    default: return 'bg-gray-50 text-gray-700';
  }
};

const getMatchColor = (match: number) => {
  if (match >= 90) return 'text-green-600';
  if (match >= 80) return 'text-blue-600';
  if (match >= 70) return 'text-amber-600';
  return 'text-gray-600';
};

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = candidates.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} candidates found</p>
        </div>
        <button className="mt-3 sm:mt-0 bg-[#2d2d3f] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#1a1a2e] transition shadow-sm">
          + Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#eef0f5] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] transition"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2">
          {['All', 'New', 'Shortlisted', 'Interview', 'Review'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                filterStatus === status
                  ? 'bg-[#2d2d3f] text-white shadow-sm'
                  : 'bg-white border border-[#eef0f5] text-gray-600 hover:bg-[#f4f5f9] hover:border-[#2d2d3f]/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Position</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Match Score</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Added On</th>
                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a2e]">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{c.position}</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${getMatchColor(c.match)}`}>{c.match}%</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{c.date}</td>
                  <td className="px-5 py-4">
                    <button className="text-xs text-[#2d2d3f] font-semibold hover:underline border-b border-[#2d2d3f]/30 pb-0.5">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No candidates found
          </div>
        )}
      </div>
    </div>
  );
}
