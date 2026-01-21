import React, { useState, useRef, useEffect } from 'react';

const DOCX_URL = "https://res.cloudinary.com/dqhawdcol/raw/upload/v1769011536/aca5qrzrtc0x9cvm7vlp.docx";
const GOOGLE_DOCS_URL = "https://docs.google.com/document/d/1DQXStZxWl41ofAb_4daxCUEMI-2GOJNBaFtgW7NlHj0/edit?usp=drivesdk";
const TEMPLATE_PREVIEW = "https://res.cloudinary.com/dqhawdcol/image/upload/v1769012378/r7fa7wsqdrd9akyskyxx.png";

interface TemplateCardProps {
  name: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ name }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#1918f0]/10 hover:-translate-y-1">
      <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
        <img 
          src={TEMPLATE_PREVIEW} 
          alt={name} 
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[#110584]/0 group-hover:bg-[#110584]/5 transition-colors duration-300" />
      </div>

      <div className="p-5 space-y-4">
        <h3 className="font-bold text-[#110584] text-sm tracking-tight truncate">{name}</h3>
        
        <div className="relative" ref={dropdownRef}>
          <div className="flex">
            <button 
              onClick={() => window.open(GOOGLE_DOCS_URL, '_blank')}
              className="flex-1 bg-[#1918f0] text-white text-[12px] font-bold py-3 px-4 rounded-l-xl hover:bg-[#1312cc] transition-colors"
            >
              Get this template
            </button>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-[#1918f0] text-white px-3 border-l border-white/10 rounded-r-xl hover:bg-[#1312cc] transition-colors"
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {showDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <a 
                href={DOCX_URL}
                className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#110584] hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>
                Download as Docx
              </a>
              <a 
                href={GOOGLE_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#110584] hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 00 2 2h12a2 2 0 00 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>
                Edit in Google Docs
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = selected !== 'All' && options.includes(selected);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all ${
          isOpen || isActive
            ? 'bg-[#1918f0] text-white border-[#1918f0] shadow-lg shadow-[#1918f0]/20'
            : 'bg-white text-[#110584] border-[#110584]/20 hover:border-[#1918f0]/50'
        }`}
      >
        <span>{label}{selected !== 'All' ? `: ${selected}` : ''}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2">
          <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${
                  selected === option
                    ? 'bg-[#1918f0]/5 text-[#1918f0]'
                    : 'text-[#110584]/60 hover:bg-gray-50 hover:text-[#1918f0]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ResumeTemplatesSection: React.FC = () => {
  const [exp, setExp] = useState('All');
  const [industry, setIndustry] = useState('Marketing');

  const expTypes = ['All', 'Zero Experience', 'Entry Level', 'Mid Level', 'Senior Level'];
  const industries = ['All', 'Marketing', 'Customer Service', 'Product Management', 'Design', 'Sales', 'Finance', 'Engineering'];

  const currentTemplates = [
    { name: `${exp === 'All' ? 'Entry' : exp} ${industry === 'All' ? 'Business' : industry} Resume` },
    { name: `${exp === 'All' ? 'Mid' : exp} ${industry === 'All' ? 'Business' : industry} Resume` },
    { name: `${exp === 'All' ? 'Senior' : exp} ${industry === 'All' ? 'Business' : industry} Resume` },
    { name: `${exp === 'All' ? 'Executive' : exp} ${industry === 'All' ? 'Business' : industry} Resume` },
    { name: `${exp === 'All' ? 'Professional' : exp} ${industry === 'All' ? 'Business' : industry} Resume` },
    { name: `${exp === 'All' ? 'Creative' : exp} ${industry === 'All' ? 'Business' : industry} Resume` },
  ];

  return (
    <section id="resume-templates" className="py-24 bg-white font-['Work_Sans']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#110584] tracking-tight">Resume Templates</h2>
          <p className="text-[#110584]/60 text-lg max-w-2xl mx-auto">
            Choose from our professionally designed, ATS-optimized templates. Every layout is engineered to pass recruiter filters.
          </p>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 mb-12 pb-8 border-b border-gray-100">
          <FilterDropdown
            label="Experience Level"
            options={expTypes}
            selected={exp}
            onSelect={setExp}
          />
          <FilterDropdown
            label="Industry"
            options={industries}
            selected={industry}
            onSelect={setIndustry}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {currentTemplates.map((tmp, i) => (
            <TemplateCard key={i} name={tmp.name} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-10 py-4 border-2 border-[#1918f0] text-[#1918f0] rounded-full font-bold text-sm hover:bg-[#1918f0] hover:text-white transition-all shadow-xl shadow-[#1918f0]/10">
            View All 200+ Templates
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResumeTemplatesSection;