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
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] mb-6 sm:mb-8">My Profile</h1>

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
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-5">Personal Information</h2>
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
          className="mt-5 bg-[#2d2d3f] hover:bg-[#1a1a2e] text-white font-semibold py-2.5 px-6 rounded-xl transition disabled:opacity-50 text-sm shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-2xl border border-[#eef0f5] shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Education</h2>
          <button onClick={() => setShowEduForm(!showEduForm)} className="text-[#4f6ef7] hover:text-[#3b5de7] text-sm font-medium">
            {showEduForm ? 'Cancel' : '+ Add Education'}
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
            {candidate.education.map((edu) => (
              <div key={edu.id} className="border border-[#f0f0f5] rounded-xl p-4">
                <h3 className="font-semibold text-[#1a1a2e]">{edu.degree} in {edu.field}</h3>
                <p className="text-[#6b7280] text-sm">{edu.institution}</p>
                <p className="text-[#9ca3af] text-xs mt-1">{edu.start_date} - {edu.end_date || 'Present'} {edu.grade && `| Grade: ${edu.grade}`}</p>
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
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Work Experience</h2>
          <button onClick={() => setShowExpForm(!showExpForm)} className="text-[#4f6ef7] hover:text-[#3b5de7] text-sm font-medium">
            {showExpForm ? 'Cancel' : '+ Add Experience'}
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
            {candidate.experience.map((exp) => (
              <div key={exp.id} className="border border-[#f0f0f5] rounded-xl p-4">
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
          <h2 className="text-lg font-semibold text-[#1a1a2e]">Skills</h2>
          <button onClick={() => setShowSkillForm(!showSkillForm)} className="text-[#4f6ef7] hover:text-[#3b5de7] text-sm font-medium">
            {showSkillForm ? 'Cancel' : '+ Add Skill'}
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
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span key={skill.id} className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-[#eef1f8] text-[#4f6ef7] border border-[#dbe4ff]">
                {skill.name}
                <span className="ml-1.5 text-xs text-[#93a3f8]">({skill.proficiency}/5)</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[#9ca3af] text-sm">No skills added yet.</p>
        )}
      </div>
    </div>
  );
}
