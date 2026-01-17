
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Resume',
      links: ['AI Resume Builder', 'ATS Scorer', 'Resume Examples', 'Resume Templates']
    },
    {
      title: 'Cover Letter',
      links: ['AI Cover Letter Builder', 'Cover Letter Examples', 'Cover Letter Templates']
    },
    {
      title: 'Resignation Letter',
      links: ['AI Resignation Letter Builder', 'Resignation Letter Examples', 'Resignation Letter Templates']
    },
    {
      title: 'Company',
      links: ['About Us', 'Contact Us', 'Privacy Policy', 'Terms of Service']
    }
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 mb-16">
          {footerLinks.map((column, idx) => (
            <div key={idx}>
              <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-6">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a href="#" className="text-gray-500 hover:text-[#1918f0] text-sm transition-colors">
                      {link}
                    </a>
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
          <div className="flex items-center group cursor-pointer">
            <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"></path>
            </svg>
            <span className="ml-2 text-xl font-bold lowercase tracking-tight">zysculpt</span>
          </div>

          <p className="text-gray-400 text-sm">
            © {currentYear} Zysculpt All Rights Reserved.
          </p>

          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-black">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-black">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
