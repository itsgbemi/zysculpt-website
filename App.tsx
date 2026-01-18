
import React, { useState } from 'react';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import Footer from './components/Footer.tsx';

type Mode = 'resume' | 'cover_letter' | 'resignation';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<Mode>('resume');

  const navItems: { label: string; value: Mode }[] = [
    { label: 'For resume', value: 'resume' },
    { label: 'For cover letter', value: 'cover_letter' },
    { label: 'For resignation', value: 'resignation' }
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#1918f0]/10 selection:text-[#1918f0] text-[#0f172a] tracking-tight-custom">
      <Header onNavigate={setActiveMode} />
      
      {/* Inner Navigation */}
      <nav className="bg-white border-b border-gray-200 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start overflow-x-auto no-scrollbar gap-1 -mb-px">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => setActiveMode(item.value)}
                className={`px-6 py-2.5 rounded-t-xl rounded-b-none text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 border-t border-l border-r ${
                  activeMode === item.value 
                  ? 'bg-[#e0f2fe] text-[#1918f0] border-gray-200' 
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-gray-50 border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Hero mode={activeMode} />
      </main>
      <Footer onNavigate={setActiveMode} />
    </div>
  );
};

export default App;