'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_min?: number;
  salary_max?: number;
  source: string;
  url: string;
  posted_date: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (location) params.set('location', location);
      const res = await api.get(`/api/jobs?${params}`);
      setJobs(res.data.jobs);
    } catch {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    setApplying(true);
    setError('');
    try {
      await api.post(`/api/jobs/${jobId}/apply`);
      setMessage('Application submitted successfully!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Job Discovery</h1>
            <p className="text-[#6b7280] text-sm mt-0.5">{jobs.length} jobs matched to your skills</p>
          </div>
        </div>
      </div>

      {message && <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-4 py-3 rounded-xl mb-6 text-sm">{message}</div>}
      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search jobs, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition"
            />
          </div>
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af] transition"
            />
          </div>
          <button
            onClick={fetchJobs}
            className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-[#2d2d3f] mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-[#9ca3af] text-sm mt-3">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-[#f4f5f9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#1a1a2e] font-medium text-sm">No jobs found</p>
              <p className="text-[#9ca3af] text-xs mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            jobs.map((job) => {
              const postedDate = job.posted_date ? new Date(job.posted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
              return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  selectedJob?.id === job.id ? 'border-[#2d2d3f] ring-2 ring-[#2d2d3f]/10' : 'border-[#eef0f5] hover:border-[#2d2d3f]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#f4f5f9] to-[#eef0f5] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#2d2d3f]">{job.company?.charAt(0) || '?'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1a1a2e] text-sm">{job.title}</h3>
                    <p className="text-[#2d2d3f] text-xs font-medium mt-0.5">{job.company}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 text-[#9ca3af] text-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {job.location}
                        </span>
                      )}
                      {postedDate && (
                        <span className="text-[#9ca3af] text-xs">{postedDate}</span>
                      )}
                    </div>
                    {job.salary_min && (
                      <p className="text-[#2d2d3f] text-xs font-semibold mt-1.5">${job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Job Detail */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm">
              {/* Job header with gradient accent */}
              <div className="p-5 sm:p-6 border-b border-[#f0f0f5]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xl font-bold text-white">{selectedJob.company?.charAt(0) || '?'}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1a1a2e]">{selectedJob.title}</h2>
                    <p className="text-[#2d2d3f] font-medium mt-0.5">{selectedJob.company}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedJob.location && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] bg-[#f4f5f9] px-3 py-1 rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {selectedJob.location}
                        </span>
                      )}
                      {selectedJob.salary_min && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] bg-[#f4f5f9] px-3 py-1 rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {selectedJob.salary_min.toLocaleString()} - {selectedJob.salary_max?.toLocaleString()}
                        </span>
                      )}
                      {selectedJob.source && <span className="text-xs bg-[#eef1f8] text-[#2d2d3f] px-3 py-1.5 rounded-lg font-semibold">{selectedJob.source}</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleApply(selectedJob.id)}
                    disabled={applying}
                    className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm disabled:opacity-50 shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    {applying ? 'Applying...' : 'Apply Now'}
                  </button>
                  {selectedJob.url && (
                    <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#2d2d3f] hover:text-[#1a1a2e] text-sm font-medium transition border border-[#eef0f5] hover:border-[#2d2d3f]/30 rounded-xl px-4 py-2.5">
                      Original posting
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Job body */}
              <div className="p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d2d3f]" />
                    Description
                  </h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-wrap">{selectedJob.description || 'No description available.'}</p>
                </div>
                {selectedJob.requirements && (
                  <div className="border-t border-[#f0f0f5] pt-5">
                    <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2d2d3f]" />
                      Requirements
                    </h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-[#f4f5f9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#1a1a2e] font-medium">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
