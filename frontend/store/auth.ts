import { create } from 'zustand';
import api from '@/lib/api';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  achievements?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

interface Candidate {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  summary?: string;
  profile_completion: number;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
}

interface AuthState {
  candidate: Candidate | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCandidate: (candidate: Candidate) => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  candidate: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token, candidate } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('candidate', JSON.stringify(candidate));
    
    set({
      token,
      candidate,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    const { token, candidate } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('candidate', JSON.stringify(candidate));
    
    set({
      token,
      candidate,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('candidate');
    set({
      token: null,
      candidate: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateCandidate: (candidate: Candidate) => {
    localStorage.setItem('candidate', JSON.stringify(candidate));
    set({ candidate });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const candidateStr = localStorage.getItem('candidate');
    
    if (token && candidateStr) {
      try {
        const candidate = JSON.parse(candidateStr);
        set({
          token,
          candidate,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('candidate');
        set({
          token: null,
          candidate: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
