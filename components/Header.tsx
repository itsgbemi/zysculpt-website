
import React, { useState } from 'react';
import Dropdown from './Dropdown.tsx';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navData = [
    {
      label: 'Resume',
      items: ['AI Resume Builder', 'ATS Scorer', 'Resume Examples', 'Resume Templates']
    },
    {
      label: 'Cover Letter',
      items: ['AI Cover Letter Builder', 'Cover Letter Examples', 'Cover Letter Templates']
    },
    {
      label: 'Resignation Letter',
      items: ['AI Resignation Letter Builder', 'Resignation Letter Examples', 'Resignation Letter Templates']
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 font-['Work_Sans']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center group cursor-pointer">
            <svg className="w-8 h-8 text-[#0f172a] transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"></path>
              <path d="M5 3L6 5L8 6L6 7L5 9L4 7L2 6L4 5L5 3Z"></path>
              <path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z"></path>
            </svg>
            <span className="ml-2 text-2xl font-bold lowercase text-[#0f172a] tracking-tighter">zysculpt</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-4">
            {navData.map((nav, index) => (
              <Dropdown key={index} label={nav.label} items={nav.items} />
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button className="px-5 py-2.5 text-sm font-semibold text-[#475569] hover:text-[#0f172a] transition-colors tracking-tight">
              Log In
            </button>
            <button className="primary-btn px-6 py-2.5 rounded-full text-sm font-semibold tracking-tight">
              Create account
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-[#475569] hover:text-[#0f172a] hover:bg-gray-100"
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
              <div className="font-bold text-[#0f172a] px-2 tracking-tight">{nav.label}</div>
              <div className="grid grid-cols-1 gap-1 pl-4">
                {nav.items.map((item, idx) => (
                  <a key={idx} href="#" className="py-2 text-sm text-[#64748b] hover:text-[#1918f0] tracking-tight">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <button className="w-full py-3 text-center font-semibold text-[#475569] border border-gray-200 rounded-xl tracking-tight">
              Log In
            </button>
            <button className="w-full primary-btn py-3 text-center font-semibold rounded-xl tracking-tight">
              Create account
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;