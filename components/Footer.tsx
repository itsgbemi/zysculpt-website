import React from 'react';

interface FooterProps {
  onNavigate: (mode: 'resume' | 'cover_letter' | 'resignation' | 'interview_prep') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Resume',
      links: [
        { label: 'AI Resume Builder', mode: 'resume' },
        { label: 'ATS Scorer', path: 'https://app.zysculpt.com' },
        { label: 'Resume Examples', path: 'https://app.zysculpt.com' },
        { label: 'Resume Templates', scrollTo: 'resume-templates' }
      ]
    },
    {
      title: 'Cover Letter',
      links: [
        { label: 'AI Cover Letter Builder', mode: 'cover_letter' },
        { label: 'Cover Letter Examples', path: 'https://app.zysculpt.com' },
        { label: 'Cover Letter Templates', path: 'https://app.zysculpt.com' }
      ]
    },
    {
      title: 'Resignation Letter',
      links: [
        { label: 'AI Resignation Letter Builder', mode: 'resignation' },
        { label: 'Resignation Letter Examples', path: 'https://app.zysculpt.com' },
        { label: 'Resignation Letter Templates', path: 'https://app.zysculpt.com' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Interview Prep', mode: 'interview_prep' },
        { label: 'Career Blog', path: '#' },
        { label: 'Privacy Policy', path: 'https://app.zysculpt.com' },
        { label: 'Terms of Service', path: 'https://app.zysculpt.com' }
      ]
    }
  ];

  const handleLinkClick = (link: any) => {
    if (link.scrollTo) {
      const el = document.getElementById(link.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (link.mode) {
      onNavigate(link.mode);
    } else if (link.path) {
      if (link.path === '#') return;
      window.location.href = link.path;
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 font-['Work_Sans']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 mb-16">
          {footerLinks.map((column, idx) => (
            <div key={idx}>
              <h4 className="text-sm font-bold text-[#110584] uppercase tracking-widest mb-6">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <button 
                      onClick={() => handleLinkClick(link)}
                      className="text-[#110584]/60 hover:text-[#1918f0] text-sm transition-colors tracking-tight text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-100 w-full mb-8" />

        {/* Bottom Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <button onClick={() => onNavigate('resume')} className="flex items-center group cursor-pointer focus:outline-none">
            <img 
              src="https://res.cloudinary.com/dqhawdcol/image/upload/v1768764769/gyemhl4rh70wly1hm0zi.svg" 
              className="w-8 h-8 transition-transform group-hover:scale-110" 
              alt="Zysculpt Logo" 
            />
            <span className="ml-2 text-xl font-bold lowercase tracking-tighter text-[#1918f0]">zysculpt</span>
          </button>

          <p className="text-[#110584]/40 text-sm tracking-tight">
            © {currentYear} Zysculpt All Rights Reserved.
          </p>

          <div className="flex gap-6 text-[#110584]/40">
            <a href="#" className="hover:text-[#110584] transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="hover:text-[#110584] transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239-5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;