'use client';

import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const candidate = useAuthStore((state) => state.candidate);

  const profileCompletion = candidate?.profile_completion || 0;
  const educationCount = candidate?.education?.length || 0;
  const experienceCount = candidate?.experience?.length || 0;
  const skillsCount = candidate?.skills?.length || 0;

  // Skills by category for chart
  const skillCategories = {
    technical: candidate?.skills?.filter(s => s.category === 'technical').length || 0,
    soft: candidate?.skills?.filter(s => s.category === 'soft').length || 0,
    tools: candidate?.skills?.filter(s => s.category === 'tools').length || 0,
  };
  const totalSkills = skillCategories.technical + skillCategories.soft + skillCategories.tools || 1;

  const stats = [
    { label: 'Profile', value: `${profileCompletion}%`, sub: 'completion', color: '#4f6ef7', bg: 'bg-[#eef1f8]', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Education', value: educationCount, sub: 'entries', color: '#8b5cf6', bg: 'bg-[#f5f3ff]', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    { label: 'Experience', value: experienceCount, sub: 'roles', color: '#06b6d4', bg: 'bg-[#ecfeff]', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Skills', value: skillsCount, sub: 'added', color: '#22c55e', bg: 'bg-[#f0fdf4]', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  const quickActions = [
    { title: 'Complete Profile', desc: 'Add education, experience, skills', href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-[#eef1f8] text-[#4f6ef7]' },
    { title: 'Upload Resume', desc: 'AI-powered ATS scoring', href: '/dashboard/resume', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-[#f0fdf4] text-[#15803d]' },
    { title: 'Practice Interview', desc: 'Mock interviews with feedback', href: '/dashboard/interview', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'bg-[#f5f3ff] text-[#8b5cf6]' },
    { title: 'Ask AI Assistant', desc: 'Career advice & templates', href: '/dashboard/assistant', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'bg-[#fefce8] text-[#a16207]' },
    { title: 'Track Applications', desc: 'Monitor your pipeline', href: '/dashboard/tracker', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-[#ecfeff] text-[#0891b2]' },
    { title: 'Browse Jobs', desc: 'Find matched opportunities', href: '/dashboard/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-[#fdf4ff] text-[#c026d3]' },
  ];

  // Donut chart calculation
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (profileCompletion / 100) * circumference;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e2a4a]">
          Welcome back, {candidate?.name?.split(' ')[0] || 'Candidate'}!
        </h1>
        <p className="text-[#6b7280] mt-1 text-sm sm:text-base">
          Here&apos;s your career progress overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <svg className="w-5 h-5" style={{ color: stat.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Profile Completion Donut */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#1e2a4a] mb-4">Profile Completion</h2>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <svg className="w-24 h-24 sm:w-28 sm:h-28 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#eef1f5" strokeWidth="8" />
                <circle
                  cx="40" cy="40" r="36" fill="none"
                  stroke={profileCompletion >= 80 ? '#22c55e' : profileCompletion >= 50 ? '#f59e0b' : '#4f6ef7'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-[#1e2a4a]">{profileCompletion}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[
                { label: 'Personal Info', done: !!(candidate?.name && candidate?.phone), color: '#4f6ef7' },
                { label: 'Education', done: educationCount > 0, color: '#8b5cf6' },
                { label: 'Experience', done: experienceCount > 0, color: '#06b6d4' },
                { label: 'Skills', done: skillsCount > 0, color: '#22c55e' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.done ? item.color : '#e2e8f0' }} />
                  <span className={`text-xs sm:text-sm ${item.done ? 'text-[#1e2a4a] font-medium' : 'text-[#9ca3af]'}`}>{item.label}</span>
                  {item.done && <svg className="w-4 h-4 text-[#22c55e] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </div>
              ))}
            </div>
          </div>
          {profileCompletion < 100 && (
            <Link href="/dashboard/profile" className="inline-flex items-center gap-1 mt-4 text-sm text-[#4f6ef7] hover:underline font-medium">
              Complete your profile <span>&rarr;</span>
            </Link>
          )}
        </div>

        {/* Skills Breakdown Bar Chart */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#1e2a4a] mb-4">Skills Breakdown</h2>
          {skillsCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 bg-[#f4f7fb] rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-sm text-[#6b7280] font-medium">No skills added yet</p>
              <Link href="/dashboard/profile" className="text-xs text-[#4f6ef7] hover:underline mt-1">Add skills &rarr;</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Technical', count: skillCategories.technical, color: '#4f6ef7' },
                { label: 'Soft Skills', count: skillCategories.soft, color: '#8b5cf6' },
                { label: 'Tools', count: skillCategories.tools, color: '#06b6d4' },
              ].map(cat => {
                const pct = Math.round((cat.count / totalSkills) * 100);
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[#1e2a4a]">{cat.label}</span>
                      <span className="text-xs text-[#6b7280]">{cat.count} skills ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#eef1f5] rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                );
              })}
              {/* Recent Skills */}
              {candidate?.skills && candidate.skills.length > 0 && (
                <div className="pt-3 border-t border-[#eef1f5]">
                  <p className="text-xs text-[#6b7280] mb-2">Recent Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(-6).map(skill => (
                      <span key={skill.id} className="bg-[#eef1f8] text-[#4f6ef7] text-xs px-2.5 py-1 rounded-lg border border-[#dbe4ff] font-medium">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#1e2a4a] mb-4">Profile Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#4f6ef7]/10 flex items-center justify-center text-[#4f6ef7] font-bold text-lg flex-shrink-0">
                {candidate?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1e2a4a] text-sm truncate">{candidate?.name || 'Your Name'}</p>
                <p className="text-xs text-[#6b7280] truncate">{candidate?.email || ''}</p>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#eef1f5]">
              {[
                { label: 'Location', value: candidate?.location, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                { label: 'Phone', value: candidate?.phone, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                { label: 'LinkedIn', value: candidate?.linkedin_url, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#9ca3af] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  <span className="text-xs text-[#6b7280] truncate">{item.value || `Add ${item.label.toLowerCase()}`}</span>
                </div>
              ))}
            </div>
            {candidate?.summary && (
              <div className="pt-2 border-t border-[#eef1f5]">
                <p className="text-xs text-[#6b7280] leading-relaxed line-clamp-3">{candidate.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-base sm:text-lg font-semibold text-[#1e2a4a] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 hover:shadow-md hover:border-[#4f6ef7]/30 transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={action.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-[#1e2a4a] group-hover:text-[#4f6ef7] transition text-sm sm:text-base">{action.title}</h3>
                <p className="text-xs sm:text-sm text-[#6b7280] mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
