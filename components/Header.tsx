import React, { useState } from 'react';
import Dropdown from './Dropdown.tsx';

interface HeaderProps {
  onNavigate: (mode: 'resume' | 'cover_letter' | 'resignation') => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navData = [
    {
      label: 'Resume',
      items: [
        { label: 'AI Resume Builder', mode: 'resume' },
        { label: 'ATS Scorer', path: 'https://app.zysculpt.com' },
        { label: 'Resume Examples', path: 'https://app.zysculpt.com' },
        { label: 'Resume Templates', scrollTo: 'resume-templates' }
      ]
    },
    {
      label: 'Cover Letter',
      items: [
        { label: 'AI Cover Letter Builder', mode: 'cover_letter' },
        { label: 'Cover Letter Examples', path: 'https://app.zysculpt.com' },
        { label: 'Cover Letter Templates', path: 'https://app.zysculpt.com' }
      ]
    },
    {
      label: 'Resignation Letter',
      items: [
        { label: 'AI Resignation Letter Builder', mode: 'resignation' },
        { label: 'Resignation Letter Examples', path: 'https://app.zysculpt.com' },
        { label: 'Resignation Letter Templates', path: 'https://app.zysculpt.com' }
      ]
    }
  ];

  const handleItemClick = (label: string, category: any) => {
    const item = category.items.find((i: any) => i.label === label);
    if (item.scrollTo) {
      const el = document.getElementById(item.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    } else if (item.mode) {
      onNavigate(item.mode);
      setIsMobileMenuOpen(false);
    } else if (item.path) {
      window.location.href = item.path;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 font-['Inter Tight']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button onClick={() => onNavigate('resume')} className="flex items-center group cursor-pointer focus:outline-none">
            <img 
              src="https://res.cloudinary.com/dqhawdcol/image/upload/v1768764769/gyemhl4rh70wly1hm0zi.svg" 
              className="w-10 h-10 transition-transform group-hover:rotate-12" 
              alt="Zysculpt Logo" 
            />
            <span className="ml-2 text-2xl font-bold lowercase text-[#1918f0] tracking-tighter">zysculpt</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-4">
            {navData.map((nav, index) => (
              <Dropdown 
                key={index} 
                label={nav.label} 
                items={nav.items.map(i => i.label)} 
                onItemClick={(label) => handleItemClick(label, nav)} 
              />
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a 
              href="https://app.zysculpt.com" 
              className="px-5 py-2.5 text-sm font-semibold text-[#110584]/70 hover:text-[#110584] transition-colors tracking-tight"
            >
              Log In
            </a>
            <a 
              href="https://app.zysculpt.com" 
              className="primary-btn px-6 py-2.5 rounded-full text-sm font-semibold tracking-tight"
            >
              Create account
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-[#475569] hover:text-[#110584] hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 animate-in slide-in-from-top-2">
          {navData.map((nav, index) => (
            <div key={index} className="space-y-2">
              <div className="font-bold text-[#110584] px-2 tracking-tight">{nav.label}</div>
              <div className="grid grid-cols-1 gap-1 pl-4">
                {nav.items.map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleItemClick(item.label, nav)}
                    className="py-2 text-sm text-left text-[#110584]/60 hover:text-[#1918f0] tracking-tight"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <a href="https://app.zysculpt.com" className="w-full py-3 text-center font-semibold text-[#110584]/70 border border-gray-200 rounded-xl tracking-tight">
              Log In
            </a>
            <a href="https://app.zysculpt.com" className="w-full primary-btn py-3 text-center font-semibold rounded-xl tracking-tight">
              Create account
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;