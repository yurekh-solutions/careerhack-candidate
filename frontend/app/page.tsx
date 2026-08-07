import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#eef1f5]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#4f6ef7] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[#1e2a4a] text-xl font-bold tracking-wide">CareerHack</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[#6b7280] hover:text-[#1e2a4a] font-medium text-sm px-4 py-2 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition shadow-sm shadow-[#4f6ef7]/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#eef1f8] text-[#4f6ef7] text-sm font-medium px-4 py-2 rounded-full mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI-Powered Career Platform
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1e2a4a] tracking-tight leading-tight">
          Transform Your Career with{' '}
          <span className="text-[#4f6ef7]">CareerHack</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[#6b7280] max-w-2xl mx-auto leading-relaxed">
          AI-powered tools to build your resume, practice interviews, track applications,
          and get personalized career guidance.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-[#4f6ef7] hover:bg-[#3b5de7] text-white font-semibold py-3 px-8 rounded-xl transition text-base shadow-sm shadow-[#4f6ef7]/25 text-center"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto border border-[#e2e8f0] hover:border-[#4f6ef7]/30 text-[#1e2a4a] font-semibold py-3 px-8 rounded-xl transition text-base bg-white text-center"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '10K+', label: 'Employers' },
            { value: '2M+', label: 'Candidates' },
            { value: '98%', label: 'Success Rate' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#1e2a4a]">{stat.value}</div>
              <div className="text-sm text-[#6b7280] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1e2a4a]">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="mt-3 text-[#6b7280] max-w-xl mx-auto">
            A complete suite of AI-powered tools designed to accelerate your career growth.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              title: 'Smart Resume Builder',
              description: 'Upload your resume and get AI-powered ATS scoring, keyword suggestions, and improvement tips.',
              icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            },
            {
              title: 'AI Interview Practice',
              description: 'Practice with AI-generated questions tailored to your role, difficulty, and industry.',
              icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
            },
            {
              title: 'Career Assistant',
              description: 'Chat with an AI career coach for advice, cover letters, salary negotiation, and more.',
              icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
            },
            {
              title: 'Application Tracker',
              description: 'Track all your job applications in one pipeline with status updates and analytics.',
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            },
            {
              title: 'Profile Builder',
              description: 'Build a comprehensive professional profile with education, experience, and skills.',
              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            },
            {
              title: 'Job Discovery',
              description: 'Find jobs matched to your skills, experience, and career goals.',
              icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 border border-[#e2e8f0] hover:shadow-md hover:border-[#4f6ef7]/20 transition-all group"
            >
              <div className="w-11 h-11 bg-[#eef1f8] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#4f6ef7] transition-colors">
                <svg className="w-5 h-5 text-[#4f6ef7] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#1e2a4a] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1e2a4a] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Career?
          </h2>
          <p className="text-blue-200 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Join thousands of professionals who are accelerating their career growth with CareerHack.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-[#1e2a4a] hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition text-base"
          >
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e2a4a] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#4f6ef7] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold">CareerHack</span>
          </div>
          <p className="text-sm text-blue-300/60">&copy; 2025 CareerHack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
