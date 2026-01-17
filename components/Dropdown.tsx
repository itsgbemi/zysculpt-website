
import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  label: string;
  items: string[];
}

const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
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

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
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
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transform origin-top animate-in fade-in slide-in-from-top-1">
          <div className="py-2">
            {items.map((item, idx) => (
              <a
                key={idx}
                href="#"
                className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#1918f0] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
