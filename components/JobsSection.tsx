import React, { useState, useRef, useEffect } from 'react';

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

const JobCard: React.FC<{ job: any }> = ({ job }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[#1918f0]/10 hover:-translate-y-1 flex flex-col h-full">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
        <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" />
      </div>
      <div>
        <h3 className="font-bold text-[#110584] text-lg leading-tight">{job.title}</h3>
        <p className="text-[#110584]/60 text-sm font-medium">{job.company}</p>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
      <span className="px-3 py-1 bg-gray-50 text-[#110584]/60 rounded-lg text-xs font-bold">{job.location}</span>
      <span className="px-3 py-1 bg-gray-50 text-[#110584]/60 rounded-lg text-xs font-bold">{job.experience}</span>
      <span className="px-3 py-1 bg-gray-50 text-[#110584]/60 rounded-lg text-xs font-bold">{job.salary}</span>
    </div>

    <button className="w-full primary-btn py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#1918f0]/10">
      Apply Now
    </button>
  </div>
);

const JobsSection: React.FC = () => {
  const [location, setLocation] = useState('All');
  const [experience, setExperience] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [role, setRole] = useState('All');

  const locations = ['All', 'Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Austin'];
  const experiences = ['All', 'Entry Level', 'Mid Level', 'Senior Level', 'Lead'];
  const industries = ['All', 'Technology', 'Finance', 'Healthcare', 'E-commerce', 'SaaS'];
  const roles = ['All', 'Frontend Engineer', 'Backend Engineer', 'Product Manager', 'UX Designer', 'Marketing Lead'];

  const jobs = [
    {
      title: "Senior Frontend Engineer",
      company: "Linear",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Linear_logo.svg",
      location: "Remote",
      experience: "Senior",
      salary: "$160k - $210k",
      industry: "Technology"
    },
    {
      title: "Product Designer",
      company: "Stripe",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
      location: "San Francisco",
      experience: "Mid Level",
      salary: "$140k - $190k",
      industry: "Finance"
    },
    {
      title: "Backend Engineer (Go)",
      company: "PostHog",
      logo: "https://posthog.com/brand/posthog-logo.svg",
      location: "Remote",
      experience: "Senior",
      salary: "$150k - $200k",
      industry: "Technology"
    },
    {
      title: "Marketing Manager",
      company: "Loom",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/Loom_Logo.svg",
      location: "London",
      experience: "Mid Level",
      salary: "£60k - £85k",
      industry: "SaaS"
    },
    {
      title: "Engineering Lead",
      company: "Vercel",
      logo: "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
      location: "Remote",
      experience: "Lead",
      salary: "$200k - $280k",
      industry: "Technology"
    },
    {
      title: "Data Analyst",
      company: "Healthcare Inc",
      logo: "https://www.gstatic.com/images/branding/product/2x/healthcare_64dp.png",
      location: "New York",
      experience: "Entry Level",
      salary: "$90k - $120k",
      industry: "Healthcare"
    }
  ];

  const filteredJobs = jobs.filter(job => {
    return (location === 'All' || job.location === location) &&
           (experience === 'All' || job.experience === experience || (experience === 'Entry Level' && job.experience === 'Entry Level')) &&
           (industry === 'All' || job.industry === industry) &&
           (role === 'All' || job.title.toLowerCase().includes(role.toLowerCase()));
  });

  return (
    <div className="bg-white font-['Inter Tight'] min-h-screen">
      <section className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl lg:text-6xl font-semibold text-[#110584] leading-[1.15] tracking-[-0.04em] mb-6">
              Find your next career move.
            </h1>
            <p className="text-lg text-[#110584]/60 max-w-xl">
              Discover opportunities at the world's most innovative companies. Filter by location, role, and industry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown label="Location" options={locations} selected={location} onSelect={setLocation} />
            <FilterDropdown label="Experience" options={experiences} selected={experience} onSelect={setExperience} />
            <FilterDropdown label="Industry" options={industries} selected={industry} onSelect={setIndustry} />
            <FilterDropdown label="Role" options={roles} selected={role} onSelect={setRole} />
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job, i) => (
              <JobCard key={i} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-[#110584]">No jobs found matching your criteria</h3>
            <p className="text-[#110584]/60 mt-2">Try adjusting your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobsSection;