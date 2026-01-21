import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  label: string;
  items: string[];
  onItemClick?: (item: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, items, onItemClick }) => {
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

  const handleItemClick = (item: string) => {
    if (onItemClick) onItemClick(item);
    setIsOpen(false);
  };

  return (
    <div 
      className="relative group font-['Onest']" 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#475569] hover:text-[#0f172a] transition-colors tracking-tight"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-0 pt-2 w-56 bg-transparent z-50">
          <div className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden transform origin-top animate-in fade-in slide-in-from-top-1">
            <div className="py-2">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left block px-4 py-2.5 text-sm text-[#64748b] hover:bg-gray-50 hover:text-[#1918f0] transition-colors tracking-tight"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;