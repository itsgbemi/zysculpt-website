import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import ResumeTemplatesSection from './components/ResumeTemplatesSection.tsx';
import InterviewPrep from './components/InterviewPrep.tsx';
import JobsSection from './components/JobsSection.tsx';
import Footer from './components/Footer.tsx';

type Mode = 'resume' | 'cover_letter' | 'resignation' | 'interview_prep' | 'jobs';

const App: React.FC = () => {
  // Helper to get mode from current URL hash
  const getModeFromHash = (): Mode => {
    try {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'cover-letter') return 'cover_letter';
      if (hash === 'resignation') return 'resignation';
      if (hash === 'interview-prep') return 'interview_prep';
      if (hash === 'jobs') return 'jobs';
    } catch (e) {
      console.warn("Unable to access window.location.hash");
    }
    return 'resume';
  };

  const [mode, setMode] = useState<Mode>(getModeFromHash());

  // Listen for hash changes (e.g., from browser back/forward or manual URL edit)
  useEffect(() => {
    const handleHashChange = () => {
      setMode(getModeFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems: { label: string; value: Mode; hash: string }[] = [
    { label: 'For resume', value: 'resume', hash: '#resume' },
    { label: 'For cover letter', value: 'cover_letter', hash: '#cover-letter' },
    { label: 'For resignation', value: 'resignation', hash: '#resignation' },
    { label: 'Interview Prep', value: 'interview_prep', hash: '#interview-prep' },
    { label: 'Jobs', value: 'jobs', hash: '#jobs' }
  ];

  const handleNavigate = (newMode: Mode) => {
    // 1. Update React state immediately for responsiveness
    setMode(newMode);
    
    // 2. Safely attempt to update the URL for deep-linking
    const newHash = newMode === 'resume' ? '#resume' : 
                   newMode === 'cover_letter' ? '#cover-letter' : 
                   newMode === 'resignation' ? '#resignation' :
                   newMode === 'interview_prep' ? '#interview-prep' :
                   '#jobs';
    
    try {
      // Use pushState instead of location.hash setter to avoid "Access Denied" on blob origins
      window.history.pushState(null, '', newHash);
    } catch (e) {
      console.warn("Browser denied script-based URL update. Deep linking might not work in this environment.", e);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#1918f0]/10 selection:text-[#1918f0] text-[#0f172a] font-['Inter Tight']">
      <Header onNavigate={handleNavigate} />
      
      {/* Inner Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start overflow-x-auto no-scrollbar gap-1 -mb-px">
            {navItems.map((item) => {
              const isActive = mode === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleNavigate(item.value)}
                  className={`px-6 py-3 text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 border-b-2 ${
                    isActive 
                    ? 'text-[#1918f0] border-[#1918f0] z-10' 
                    : 'text-[#64748b] hover:text-[#110584] border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {mode === 'interview_prep' ? (
          <InterviewPrep />
        ) : mode === 'jobs' ? (
          <JobsSection />
        ) : (
          <>
            <Hero mode={mode} />
            {mode === 'resume' && <ResumeTemplatesSection />}
          </>
        )}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;