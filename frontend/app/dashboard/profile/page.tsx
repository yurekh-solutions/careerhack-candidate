'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface EducationForm {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  grade: string;
}

interface ExperienceForm {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string;
}

interface SkillForm {
  name: string;
  category: string;
  proficiency: number;
}

export default function ProfilePage() {
  const candidate = useAuthStore((state) => state.candidate);
  const updateCandidate = useAuthStore((state) => state.updateCandidate);

  const [name, setName] = useState(candidate?.name ?? '');
  const [phone, setPhone] = useState(candidate?.phone ?? '');
  const [location, setLocation] = useState(candidate?.location ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(candidate?.linkedin_url ?? '');
  const [githubUrl, setGithubUrl] = useState(candidate?.github_url ?? '');
  const [portfolioUrl, setPortfolioUrl] = useState(candidate?.portfolio_url ?? '');
  const [summary, setSummary] = useState(candidate?.summary ?? '');
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState<EducationForm>({
    institution: '', degree: '', field: '', start_date: '', end_date: '', grade: '',
  });
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState<ExperienceForm>({
    company: '', role: '', start_date: '', end_date: '', description: '', achievements: '',
  });
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillForm, setSkillForm] = useState<SkillForm>({
    name: '', category: 'technical', proficiency: 3,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await api.put('/api/auth/update-profile', {
        name, phone, location,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        summary,
      });
      updateCandidate(response.data.candidate);
      setMessage('Profile updated successfully!');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async () => {
    try {
      const response = await api.post('/api/profile/education', eduForm);
      updateCandidate(response.data.candidate);
      setShowEduForm(false);
      setEduForm({ institution: '', degree: '', field: '', start_date: '', end_date: '', grade: '' });
    } catch {
      setError('Failed to add education.');
    }
  };

  const handleAddExperience = async () => {
    try {
      const response = await api.post('/api/profile/experience', expForm);
      updateCandidate(response.data.candidate);
      setShowExpForm(false);
      setExpForm({ company: '', role: '', start_date: '', end_date: '', description: '', achievements: '' });
    } catch {
      setError('Failed to add experience.');
    }
  };

  const handleAddSkill = async () => {
    try {
      const response = await api.post('/api/profile/skills', skillForm);
      updateCandidate(response.data.candidate);
      setShowSkillForm(false);
      setSkillForm({ name: '', category: 'technical', proficiency: 3 });
    } catch {
      setError('Failed to add skill.');
    }
  };

  const inputClass = "w-full px-4 py-3 border border-[#eef0f5] rounded-xl focus:ring-2 focus:ring-[#2d2d3f]/20 focus:border-[#2d2d3f] transition bg-white text-[#1a1a2e] placeholder-[#9ca3af] text-sm";
  const labelClass = "block text-sm font-medium text-[#1a1a2e] mb-2";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-11 h-11 bg-gradient-to-br from-[#2d2d3f] to-[#1a1a2e] rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">My Profile</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">Manage your personal info and career details</p>
        </div>
      </div>

      {message && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-4 py-3 rounded-xl mb-6 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#f4f5f9] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Personal Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={candidate?.email || ''} disabled className="w-full px-4 py-3 border border-[#f0f0f5] rounded-xl bg-[#f8f8fc] text-[#9ca3af] text-sm" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Mumbai, India" />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/yourprofile" />
          </div>
          <div>
            <label className={labelClass}>GitHub URL</label>
            <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} placeholder="https://github.com/yourusername" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Portfolio URL</label>
            <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={inputClass} placeholder="https://yourportfolio.com" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Professional Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className={inputClass} placeholder="Brief summary of your professional background..." />
          </div>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-5 bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-6 rounded-xl transition disabled:opacity-50 text-sm shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f4f5f9] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Education</h2>
          </div>
          <button onClick={() => setShowEduForm(!showEduForm)} className="text-[#2d2d3f] hover:text-[#1a1a2e] text-sm font-semibold flex items-center gap-1 border border-[#eef0f5] hover:border-[#2d2d3f]/30 rounded-lg px-3 py-1.5 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {showEduForm ? 'Cancel' : 'Add'}
          </button>
        </div>
        {showEduForm && (
          <div className="border border-[#f0f0f5] rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Institution" value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Degree" value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Field of Study" value={eduForm.field} onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Grade / GPA" value={eduForm.grade} onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })} className={inputClass} />
              <input type="date" value={eduForm.start_date} onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })} className={inputClass} />
              <input type="date" value={eduForm.end_date} onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })} className={inputClass} />
            </div>
            <button onClick={handleAddEducation} className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-medium py-2 px-4 rounded-xl transition text-sm">Add Education</button>
          </div>
        )}
        {candidate?.education && candidate.education.length > 0 ? (
          <div className="space-y-3">
            {candidate.education.map((edu, idx) => (
              <div key={edu.id} className="border border-[#f0f0f5] rounded-xl p-4 relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-3 top-5 w-2.5 h-2.5 rounded-full bg-[#2d2d3f] ring-4 ring-[#2d2d3f]/10" />
                {idx < (candidate.education?.length ?? 0) - 1 && <div className="absolute left-[13px] top-8 bottom-0 w-px bg-[#eef0f5]" />}
                <h3 className="font-semibold text-[#1a1a2e]">{edu.degree} in {edu.field}</h3>
                <p className="text-[#6b7280] text-sm">{edu.institution}</p>
                <p className="text-[#9ca3af] text-xs mt-1">{edu.start_date} - {edu.end_date || 'Present'} {edu.grade && ` | Grade: ${edu.grade}`}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#9ca3af] text-sm">No education entries yet.</p>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f4f5f9] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Work Experience</h2>
          </div>
          <button onClick={() => setShowExpForm(!showExpForm)} className="text-[#2d2d3f] hover:text-[#1a1a2e] text-sm font-semibold flex items-center gap-1 border border-[#eef0f5] hover:border-[#2d2d3f]/30 rounded-lg px-3 py-1.5 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {showExpForm ? 'Cancel' : 'Add'}
          </button>
        </div>
        {showExpForm && (
          <div className="border border-[#f0f0f5] rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Company" value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Role / Title" value={expForm.role} onChange={(e) => setExpForm({ ...expForm, role: e.target.value })} className={inputClass} />
              <input type="date" value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} className={inputClass} />
              <input type="date" value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} className={inputClass} />
            </div>
            <textarea placeholder="Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows={2} className={inputClass} />
            <textarea placeholder="Key Achievements" value={expForm.achievements} onChange={(e) => setExpForm({ ...expForm, achievements: e.target.value })} rows={2} className={inputClass} />
            <button onClick={handleAddExperience} className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-medium py-2 px-4 rounded-xl transition text-sm">Add Experience</button>
          </div>
        )}
        {candidate?.experience && candidate.experience.length > 0 ? (
          <div className="space-y-3">
            {candidate.experience.map((exp, idx) => (
              <div key={exp.id} className="border border-[#f0f0f5] rounded-xl p-4 relative pl-8">
                <div className="absolute left-3 top-5 w-2.5 h-2.5 rounded-full bg-[#2d2d3f] ring-4 ring-[#2d2d3f]/10" />
                {idx < (candidate.experience?.length ?? 0) - 1 && <div className="absolute left-[13px] top-8 bottom-0 w-px bg-[#eef0f5]" />}
                <h3 className="font-semibold text-[#1a1a2e]">{exp.role}</h3>
                <p className="text-[#6b7280] text-sm">{exp.company}</p>
                <p className="text-[#9ca3af] text-xs mt-1">{exp.start_date} - {exp.end_date || 'Present'}</p>
                {exp.description && <p className="text-[#6b7280] text-sm mt-2">{exp.description}</p>}
                {exp.achievements && <p className="text-[#9ca3af] text-sm mt-1">{exp.achievements}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#9ca3af] text-sm">No work experience entries yet.</p>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f4f5f9] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#2d2d3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Skills</h2>
          </div>
          <button onClick={() => setShowSkillForm(!showSkillForm)} className="text-[#2d2d3f] hover:text-[#1a1a2e] text-sm font-semibold flex items-center gap-1 border border-[#eef0f5] hover:border-[#2d2d3f]/30 rounded-lg px-3 py-1.5 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {showSkillForm ? 'Cancel' : 'Add'}
          </button>
        </div>
        {showSkillForm && (
          <div className="border border-[#f0f0f5] rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Skill name" value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} className={inputClass} />
              <select value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} className={inputClass}>
                <option value="technical">Technical</option>
                <option value="soft">Soft Skill</option>
                <option value="tools">Tools</option>
              </select>
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#6b7280]">Level:</label>
                <input type="range" min="1" max="5" value={skillForm.proficiency} onChange={(e) => setSkillForm({ ...skillForm, proficiency: parseInt(e.target.value) })} className="flex-1 accent-[#4f6ef7]" />
                <span className="text-sm font-medium text-[#1a1a2e]">{skillForm.proficiency}/5</span>
              </div>
            </div>
            <button onClick={handleAddSkill} className="bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-medium py-2 px-4 rounded-xl transition text-sm">Add Skill</button>
          </div>
        )}
        {candidate?.skills && candidate.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {candidate.skills.map((skill) => (
              <div key={skill.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[#f4f5f9] text-[#1a1a2e] border border-[#eef0f5]">
                <span className="font-semibold">{skill.name}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((dot) => (
                    <span key={dot} className={`w-1.5 h-1.5 rounded-full ${dot <= skill.proficiency ? 'bg-[#2d2d3f]' : 'bg-[#d1d5db]'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#9ca3af] text-sm">No skills added yet.</p>
        )}
      </div>
    </div>
  );
}
