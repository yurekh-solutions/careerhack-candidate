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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Job Discovery</h1>
        <p className="text-[#6b7280] mt-1">Find jobs matched to your skills and experience</p>
      </div>

      {message && <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-4 py-3 rounded-xl mb-6 text-sm">{message}</div>}
      {error && <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#f0f0f5] p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search jobs, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#f0f0f5] rounded-xl focus:ring-2 focus:ring-[#4f6ef7] focus:border-transparent text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af]"
          />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#f0f0f5] rounded-xl focus:ring-2 focus:ring-[#4f6ef7] focus:border-transparent text-sm bg-white text-[#1a1a2e] placeholder-[#9ca3af]"
          />
          <button
            onClick={fetchJobs}
            className="bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold py-2.5 rounded-xl transition text-sm"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-[#4f6ef7] mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#f0f0f5] p-8 text-center">
              <p className="text-[#6b7280] text-sm">No jobs found</p>
              <p className="text-[#9ca3af] text-xs mt-1">Try adjusting your search</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition ${
                  selectedJob?.id === job.id ? 'border-[#4f6ef7] ring-2 ring-[#4f6ef7]/20' : 'border-[#f0f0f5] hover:border-[#4f6ef7]/30'
                }`}
              >
                <h3 className="font-semibold text-[#1a1a2e] text-sm">{job.title}</h3>
                <p className="text-[#4f6ef7] text-xs font-medium mt-1">{job.company}</p>
                <div className="flex items-center gap-2 mt-2">
                  {job.location && <span className="text-[#9ca3af] text-xs">{job.location}</span>}
                  {job.salary_min && <span className="text-[#6b7280] text-xs">| {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Job Detail */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="bg-white rounded-xl border border-[#f0f0f5] p-5 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a2e]">{selectedJob.title}</h2>
                  <p className="text-[#4f6ef7] font-medium">{selectedJob.company}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {selectedJob.location && <span className="text-sm text-[#6b7280]">{selectedJob.location}</span>}
                    {selectedJob.salary_min && <span className="text-sm text-[#6b7280]">{selectedJob.salary_min.toLocaleString()} - {selectedJob.salary_max?.toLocaleString()}</span>}
                    {selectedJob.source && <span className="text-xs bg-[#f0f0f5] text-[#4f6ef7] px-2 py-0.5 rounded-lg">{selectedJob.source}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applying}
                  className="bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold py-2.5 px-6 rounded-xl transition text-sm disabled:opacity-50 shadow-sm shadow-[#4f6ef7]/25"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2">Description</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-wrap">{selectedJob.description || 'No description available.'}</p>
                </div>
                {selectedJob.requirements && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#1a1a2e] mb-2">Requirements</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}
                {selectedJob.url && (
                  <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#4f6ef7] hover:underline text-sm font-medium">
                    View original posting
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#f0f0f5] p-12 text-center">
              <p className="text-[#6b7280] font-medium">Select a job to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
