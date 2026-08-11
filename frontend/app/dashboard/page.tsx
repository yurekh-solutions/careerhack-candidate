'use client';

import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const candidate = useAuthStore((state) => state.candidate);

  const stats = [
    { label: 'Total Candidates', value: '1,248', change: '+12%', up: true },
    { label: 'AI Shortlisted', value: '342', change: '+8%', up: true },
    { label: 'Interviews', value: '84', change: '+5%', up: true },
    { label: 'Hired', value: '23', change: '+3%', up: true },
  ];

  const recentCandidates = [
    { name: 'Alex Ray', position: 'Frontend Developer', match: '95%', status: 'Shortlisted', date: '2 Aug 2025' },
    { name: 'Jerry Wilson', position: 'UI/UX Designer', match: '88%', status: 'Interview', date: '1 Aug 2025' },
    { name: 'Robert Fox', position: 'Backend Developer', match: '92%', status: 'New', date: '31 Jul 2025' },
    { name: 'Esther Howard', position: 'Product Manager', match: '85%', status: 'Shortlisted', date: '30 Jul 2025' },
    { name: 'Brooklyn Simmons', position: 'DevOps Engineer', match: '78%', status: 'Review', date: '29 Jul 2025' },
  ];

  const topJobs = [
    { title: 'Frontend Developer', company: 'TechCorp', applicants: 45 },
    { title: 'UI/UX Designer', company: 'DesignHub', applicants: 32 },
    { title: 'Backend Developer', company: 'DataFlow', applicants: 28 },
    { title: 'Product Manager', company: 'InnovateLab', applicants: 19 },
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">
            Welcome back, {candidate?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your career today.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent w-48 sm:w-64"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white text-xs font-semibold">
            {candidate?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
              <span className={`text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#1a1a2e]">Recent Candidates</h2>
            <Link href="/dashboard/candidates" className="text-xs text-[#4f6ef7] font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Position</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Match</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Added</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((c) => (
                  <tr key={c.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-[#1a1a2e]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{c.position}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#1a1a2e]">{c.match}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Job Openings */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1a1a2e]">Top Job Openings</h2>
              <Link href="/dashboard/jobs" className="text-xs text-[#4f6ef7] font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {topJobs.map((job) => (
                <div key={job.title} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.company} &middot; {job.applicants} applicants</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-[#1a1a2e] mb-3">AI Insights</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-[#4f6ef7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[#1a1a2e] font-medium">Resume score improved</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your resume now matches 95% of frontend roles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-[#1a1a2e] font-medium">3 new matches found</p>
                  <p className="text-xs text-gray-400 mt-0.5">Based on your updated skills and experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
