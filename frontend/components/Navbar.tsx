'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Navbar() {
  const router = useRouter();
  const candidate = useAuthStore((state) => state.candidate);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-[#1e2a4a]">
              CareerHack
            </Link>
            <div className="hidden sm:flex space-x-4">
              <Link
                href="/dashboard"
                className="text-[#6b7280] hover:text-[#1e2a4a] px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-[#6b7280] hover:text-[#1e2a4a] px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Profile
              </Link>
              <Link
                href="/resume"
                className="text-[#6b7280] hover:text-[#1e2a4a] px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Resume
              </Link>
              <Link
                href="/jobs"
                className="text-[#6b7280] hover:text-[#1e2a4a] px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Jobs
              </Link>
              <Link
                href="/interview"
                className="text-[#6b7280] hover:text-[#1e2a4a] px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Interview
              </Link>
              <Link
                href="/assistant"
                className="text-[#6b7280] hover:text-[#1e2a4a] px-3 py-2 rounded-md text-sm font-medium transition"
              >
                AI Assistant
              </Link>
              <Link
                href="/tracker"
                className="text-[#6b7280] hover:text-[#1e2a4a] px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Tracker
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-[#6b7280] hidden sm:block">
              {candidate?.name || candidate?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-[#6b7280] hover:text-[#4f6ef7] text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
