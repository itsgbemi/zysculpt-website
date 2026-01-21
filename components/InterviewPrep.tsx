import React, { useState, useMemo } from 'react';

interface InterviewQuestion {
  id: number;
  question: string;
  company: string;
  companyLogo: string;
  role: string;
  category: string;
  answerCount: number;
  expertAnswer: string;
}

const QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    question: "Tell me about a time when you had to deal with conflicting priorities with your stakeholders and how you secured alignment with them.",
    company: "Meta (Facebook)",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    role: "Product Manager",
    category: "Behavioral",
    answerCount: 6,
    expertAnswer: "To answer this, use the STAR method. Focus on a specific conflict. **Situation**: Mention a project where two leads wanted different outcomes. **Task**: Explain your responsibility to balance both needs. **Action**: Describe the meeting where you used data to find a middle ground. **Result**: Mention that the project launched on time with both stakeholders satisfied."
  },
  {
    id: 2,
    question: "How would you improve the Amazon Prime delivery experience for rural areas?",
    company: "Amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    role: "Operations Manager",
    category: "Product Strategy",
    answerCount: 12,
    expertAnswer: "Identify pain points first (long lead times, high cost). Propose solutions like local micro-hubs, drone testing, or partnerships with local post offices. Evaluate the trade-offs between delivery speed and operational cost."
  },
  {
    id: 3,
    question: "Design a high-concurrency URL shortener like bit.ly.",
    company: "Google",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg",
    role: "Software Engineer",
    category: "System Design",
    answerCount: 24,
    expertAnswer: "Key components: Load Balancer, Web Servers, Database (NoSQL vs SQL), Caching (Redis). Explain the hash generation (Base62) and how to handle 100k requests/sec using sharding."
  },
  {
    id: 4,
    question: "Walk me through the three main financial statements and how they are linked.",
    company: "Goldman Sachs",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
    role: "Financial Analyst",
    category: "Technical",
    answerCount: 8,
    expertAnswer: "Income Statement, Balance Sheet, and Cash Flow Statement. Net income from IS flows into RE on the Balance Sheet and starts the Cash Flow Statement. Depreciation on the IS affects the BS (PP&E) and CF (non-cash add-back)."
  },
  {
    id: 5,
    question: "Tell me about a time you made a mistake. How did you handle it?",
    company: "Microsoft",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    role: "Project Manager",
    category: "Behavioral",
    answerCount: 15,
    expertAnswer: "Be honest. Pick a genuine mistake, describe the immediate steps you took to fix it, what you learned, and how you ensured it never happened again. Vulnerability + Growth is key."
  },
  {
    id: 6,
    question: "How would you measure the success of a new 'Stories' feature for a professional networking app?",
    company: "LinkedIn",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
    role: "Data Scientist",
    category: "Analytical",
    answerCount: 9,
    expertAnswer: "Focus on North Star metrics (User Retention, DAU). Track feature-specific metrics: Story creation rate, views per user, and cross-pollination to the main feed."
  }
];

const FlashcardQuiz: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Keeping the simplified flashcard logic from previous version but updating colors
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const currentCard = QUESTIONS[currentIndex % QUESTIONS.length];

  return (
    <div className="min-h-screen bg-[#f9f7f2] py-12 px-4 font-['Work_Sans']">
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-[#1918f0] font-bold text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          Back to Library
        </button>
        <div className="bg-white border-4 border-black rounded-[40px] p-10 shadow-[12px_12px_0_0_#000]">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className={`relative w-full h-80 cursor-pointer transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          >
            <div className="absolute inset-0 bg-[#dbeafe] border-4 border-black rounded-3xl p-10 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
              <span className="mb-4 px-4 py-1 border-2 border-black rounded-full text-[10px] font-black uppercase tracking-widest bg-white">{currentCard.category}</span>
              <h3 className="text-2xl font-black text-[#110584]">{currentCard.question}</h3>
              <p className="mt-4 text-xs font-bold text-[#110584]/40 uppercase">Click to flip</p>
            </div>
            <div className="absolute inset-0 bg-[#1918f0] border-4 border-black rounded-3xl p-10 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <p className="text-white font-bold leading-relaxed">{currentCard.expertAnswer}</p>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} className="px-6 py-3 border-4 border-black font-black bg-white rounded-2xl shadow-[4px_4px_0_0_#000]">Prev</button>
            <button onClick={() => setCurrentIndex(prev => prev + 1)} className="px-6 py-3 border-4 border-black font-black bg-[#1918f0] text-white rounded-2xl shadow-[4px_4px_0_0_#000]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InterviewPrep: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const roles = ['All Roles', 'Product Manager', 'Software Engineer', 'Financial Analyst', 'Operations Manager', 'Data Scientist'];
  const companies = ['All Companies', 'Meta (Facebook)', 'Amazon', 'Google', 'Goldman Sachs', 'Microsoft', 'LinkedIn'];
  const categories = ['All', 'Behavioral', 'Product Strategy', 'Analytical', 'System Design', 'Technical'];

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      const roleMatch = selectedRole === 'All Roles' || q.role === selectedRole;
      const companyMatch = selectedCompany === 'All Companies' || q.company === selectedCompany;
      const catMatch = activeCategory === 'All' || q.category === activeCategory;
      return roleMatch && companyMatch && catMatch;
    });
  }, [selectedRole, selectedCompany, activeCategory]);

  if (showQuiz) return <FlashcardQuiz onBack={() => setShowQuiz(false)} />;

  return (
    <div className="bg-white font-['Work_Sans'] min-h-screen">
      {/* Search & Filter Hero */}
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-[#110584] tracking-tight">Interview Library</h1>
              <p className="text-[#110584]/60 max-w-lg">Master the most frequent interview questions with expert answers and structured study tools.</p>
            </div>
            <button 
              onClick={() => setShowQuiz(true)}
              className="flex items-center gap-2 bg-[#1918f0] text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-[#1918f0]/20 hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Practice with Flashcards
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              {/* Role Dropdown */}
              <div className="relative">
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold text-sm text-[#1918f0] focus:ring-2 focus:ring-[#1918f0]/20 outline-none pr-10 shadow-sm"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1918f0]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Company Dropdown */}
              <div className="relative">
                <select 
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold text-sm text-[#110584]/70 focus:ring-2 focus:ring-[#1918f0]/20 outline-none pr-10 shadow-sm"
                >
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                    activeCategory === cat 
                    ? 'bg-[#110584] text-white border-[#110584]' 
                    : 'bg-white text-[#110584]/60 border-gray-200 hover:border-[#1918f0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Questions Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredQuestions.map((q) => (
            <div 
              key={q.id}
              className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/20 hover:shadow-2xl transition-all group flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <img src={q.companyLogo} className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" alt={q.company} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Asked at {q.company}</span>
              </div>

              <h3 className="text-xl font-bold text-[#110584] mb-8 leading-snug flex-1">
                {q.question}
              </h3>

              <div className="flex flex-wrap items-center gap-4 border-t border-gray-50 pt-6">
                <div className="flex items-center gap-2 text-[#1918f0] text-xs font-bold bg-[#1918f0]/5 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  {q.role}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-lg">
                  {q.category}
                </div>
                <div className="ml-auto flex items-center gap-4">
                   <button className="text-gray-400 hover:text-[#1918f0] transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                   </button>
                   <button 
                     onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                     className="flex items-center gap-2 text-sm font-bold text-[#110584] hover:text-[#1918f0] transition-colors"
                   >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                     {q.answerCount} answers
                   </button>
                </div>
              </div>

              {expandedId === q.id && (
                <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-[#1918f0] rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[11px] font-black uppercase text-[#1918f0] tracking-widest">Our Recommended Answer</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#110584]/80 whitespace-pre-wrap">
                    {q.expertAnswer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[#110584]">No questions found</h3>
            <p className="text-[#110584]/40">Try adjusting your filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSelectedRole('All Roles'); setSelectedCompany('All Companies'); setActiveCategory('All'); }}
              className="text-[#1918f0] font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="bg-[#110584] py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
           <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Master your next interview with Zysculpt.</h2>
           <p className="text-white/60 text-lg">Download our mobile app to practice mock interviews on the go.</p>
           <div className="flex flex-wrap justify-center gap-4 pt-4">
             <button className="bg-white text-[#110584] px-10 py-4 rounded-full font-bold shadow-2xl transition-all hover:bg-gray-100">App Store</button>
             <button className="bg-transparent border-2 border-white/20 text-white px-10 py-4 rounded-full font-bold hover:bg-white/5 transition-all">Play Store</button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default InterviewPrep;