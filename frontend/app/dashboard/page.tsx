'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import api from '@/lib/api';

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: string;
  applied_at: string;
  match_score?: number;
}

interface TrackerStats {
  total: number;
  pending: number;
  shortlisted: number;
  interviewing: number;
  hired: number;
}

export default function DashboardPage() {
  const candidate = useAuthStore((state) => state.candidate);
  const [trackerStats, setTrackerStats] = useState<TrackerStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get('/api/tracker/stats'),
          api.get('/api/tracker'),
        ]);
        setTrackerStats(statsRes.data);
        setApplications(appsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted': return 'bg-green-50 text-green-700';
      case 'interview': case 'interviewing': return 'bg-blue-50 text-blue-700';
      case 'applied': case 'new': return 'bg-purple-50 text-purple-700';
      case 'review': case 'screening': return 'bg-amber-50 text-amber-700';
      case 'hired': case 'accepted': return 'bg-emerald-50 text-emerald-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5 text-[#1a1a2e]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const stats = trackerStats ? [
    { label: 'Total Applications', value: trackerStats.total?.toString() || '0', icon: 'briefcase', color: 'bg-[#4f6ef7]' },
    { label: 'Pending', value: trackerStats.pending?.toString() || '0', icon: 'clock', color: 'bg-[#f59e0b]' },
    { label: 'Shortlisted', value: trackerStats.shortlisted?.toString() || '0', icon: 'check', color: 'bg-[#22c55e]' },
    { label: 'Interviewing', value: trackerStats.interviewing?.toString() || '0', icon: 'chat', color: 'bg-[#8b5cf6]' },
  ] : [
    { label: 'Total Applications', value: '0', icon: 'briefcase', color: 'bg-[#4f6ef7]' },
    { label: 'Pending', value: '0', icon: 'clock', color: 'bg-[#f59e0b]' },
    { label: 'Shortlisted', value: '0', icon: 'check', color: 'bg-[#22c55e]' },
    { label: 'Interviewing', value: '0', icon: 'chat', color: 'bg-[#8b5cf6]' },
  ];

  const StatIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'briefcase': return <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'clock': return <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'check': return <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'chat': return <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
      default: return null;
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#eef0f5] p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <StatIcon type={stat.icon} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eef0f5] shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f5]">
            <h2 className="text-base font-semibold text-[#1a1a2e]">Recent Applications</h2>
            <Link href="/dashboard/tracker" className="text-xs text-[#4f6ef7] font-semibold hover:underline hover:text-[#3b5de7] transition">
              View all &rarr;
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No applications yet. Start applying to jobs!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f5f5fa]">
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Job</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Company</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-400 px-5 py-3">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-[#f5f5fa] last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-[#1a1a2e]">{app.job_title}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{app.company}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(app.applied_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5">
            <h2 className="text-base font-semibold text-[#1a1a2e] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/resume" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f8fc] transition group border border-transparent hover:border-[#eef0f5]">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 transition">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">Upload Resume</p>
                  <p className="text-xs text-gray-400">Get AI-powered ATS score</p>
                </div>
              </Link>
              <Link href="/dashboard/interview" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f8fc] transition group border border-transparent hover:border-[#eef0f5]">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:from-emerald-100 group-hover:to-emerald-200 transition">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">Practice Interview</p>
                  <p className="text-xs text-gray-400">AI-generated questions</p>
                </div>
              </Link>
              <Link href="/dashboard/jobs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f8fc] transition group border border-transparent hover:border-[#eef0f5]">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center flex-shrink-0 group-hover:from-violet-100 group-hover:to-violet-200 transition">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">Browse Jobs</p>
                  <p className="text-xs text-gray-400">Find matching positions</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5">
            <h2 className="text-base font-semibold text-[#1a1a2e] mb-3">Profile Completion</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1a1a2e] rounded-full transition-all"
                  style={{ width: `${candidate?.profile_completion || 0}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[#1a1a2e]">{candidate?.profile_completion || 0}%</span>
            </div>
            <Link href="/dashboard/profile" className="text-xs text-[#4f6ef7] font-medium hover:underline">
              Complete your profile &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
