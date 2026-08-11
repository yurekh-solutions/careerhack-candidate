'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[#1a1a2e] text-lg font-bold">CareerHack</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Create your account</h1>
          <p className="text-[#6b7280] text-sm mb-6">Sign up to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition bg-white text-[#1a1a2e] placeholder-[#9ca3af] text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition bg-white text-[#1a1a2e] placeholder-[#9ca3af] text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition bg-white text-[#1a1a2e] placeholder-[#9ca3af] text-sm"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1a1a2e] transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#374151] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border border-[#d1d5db] rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition bg-white text-[#1a1a2e] placeholder-[#9ca3af] text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1a1a2e] transition"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a2e] hover:bg-[#2d2d4e] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Register'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="text-xs text-[#9ca3af]">OR continue with</span>
            <div className="flex-1 h-px bg-[#e5e7eb]" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-[#d1d5db] bg-white hover:bg-gray-50 text-[#374151] font-medium py-3 rounded-lg transition text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-[#6b7280]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1a1a2e] font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f8f9fa] flex-col items-center justify-center p-12 relative">
        <div className="max-w-md text-center">
          {/* Illustration */}
          <div className="mb-8">
            <svg className="w-80 h-64 mx-auto" viewBox="0 0 400 320" fill="none">
              {/* Group of people */}
              <circle cx="160" cy="80" r="18" fill="#1a1a2e"/>
              <rect x="145" y="100" width="30" height="35" rx="8" fill="#1a1a2e"/>
              <circle cx="220" cy="70" r="20" fill="#4f6ef7"/>
              <rect x="203" y="92" width="34" height="40" rx="8" fill="#4f6ef7"/>
              <circle cx="270" cy="85" r="16" fill="#1a1a2e" opacity="0.6"/>
              <rect x="257" y="103" width="26" height="30" rx="8" fill="#1a1a2e" opacity="0.6"/>
              {/* Connection lines */}
              <line x1="175" y1="90" x2="203" y2="85" stroke="#4f6ef7" strokeWidth="1.5" strokeDasharray="4 2"/>
              <line x1="240" y1="85" x2="254" y2="90" stroke="#4f6ef7" strokeWidth="1.5" strokeDasharray="4 2"/>
              {/* Floating cards */}
              <rect x="100" y="150" width="80" height="50" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
              <circle cx="120" cy="170" r="10" fill="#4f6ef7" opacity="0.15"/>
              <rect x="135" y="165" width="30" height="3" rx="1.5" fill="#d1d5db"/>
              <rect x="135" y="173" width="20" height="3" rx="1.5" fill="#d1d5db"/>
              <rect x="115" y="185" width="50" height="6" rx="3" fill="#4f6ef7" opacity="0.3"/>
              <rect x="240" y="140" width="90" height="55" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
              <rect x="255" y="155" width="40" height="4" rx="2" fill="#1a1a2e"/>
              <rect x="255" y="165" width="60" height="3" rx="1.5" fill="#d1d5db"/>
              <rect x="255" y="173" width="50" height="3" rx="1.5" fill="#d1d5db"/>
              <rect x="255" y="183" width="30" height="6" rx="3" fill="#4f6ef7"/>
              {/* Decorative dots */}
              <circle cx="320" cy="100" r="4" fill="#4f6ef7" opacity="0.2"/>
              <circle cx="330" cy="110" r="3" fill="#4f6ef7" opacity="0.15"/>
              <circle cx="80" cy="120" r="4" fill="#4f6ef7" opacity="0.2"/>
              <circle cx="70" cy="130" r="3" fill="#4f6ef7" opacity="0.15"/>
              <circle cx="340" cy="200" r="3" fill="#1a1a2e" opacity="0.1"/>
              <circle cx="60" cy="200" r="3" fill="#1a1a2e" opacity="0.1"/>
              {/* Bottom bar */}
              <rect x="120" y="230" width="160" height="6" rx="3" fill="#1a1a2e" opacity="0.1"/>
              <rect x="140" y="242" width="120" height="4" rx="2" fill="#1a1a2e" opacity="0.05"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">Join thousands of recruiters</h2>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            Use AI to find the best candidates<br />and build great teams.
          </p>
        </div>
      </div>
    </div>
  );
}
