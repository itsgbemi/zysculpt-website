import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// --- Voice Conversation Helpers ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Data Types ---

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

  const isActive = selected !== 'All Roles' && selected !== 'All';

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
        <span>{label}{isActive ? `: ${selected}` : ''}</span>
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

const AiMockInterview: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [currentAiText, setCurrentAiText] = useState('');
  const [currentUserText, setCurrentUserText] = useState('');
  const [isAiTalking, setIsAiTalking] = useState(false);

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const sessionPromiseRef = useRef<any>(null);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inCtx, output: outCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
            
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(4096)), mimeType: 'audio/pcm;rate=16000' }
              });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setCurrentAiText((prev) => prev + message.serverContent!.outputTranscription!.text);
              setIsAiTalking(true);
            } else if (message.serverContent?.inputTranscription) {
              setCurrentUserText((prev) => prev + message.serverContent!.inputTranscription!.text);
              setIsAiTalking(false);
            }

            if (message.serverContent?.turnComplete) {
              setTranscripts((prev) => {
                const next = [...prev];
                if (currentUserText) next.push({ role: 'user', text: currentUserText });
                if (currentAiText) next.push({ role: 'ai', text: currentAiText });
                return next;
              });
              setCurrentAiText('');
              setCurrentUserText('');
              setIsAiTalking(false);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const outCtx = audioContextRef.current!.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach((s) => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
            stream.getTracks().forEach(t => t.stop());
          },
          onerror: (e) => console.error(e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are an expert interviewer conducting a conversational mock interview. START THE CONVERSATION IMMEDIATELY. Introduce yourself and ask the first question. Ask one professional question at a time. Provide brief constructive feedback if needed. Be professional and encouraging.',
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((s: any) => s.close());
    }
    setIsActive(false);
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#f9f7f2] py-12 px-4 font-['Inter Tight']">
      <div className="max-w-4xl mx-auto space-y-8 h-full flex flex-col">
        <button onClick={stopSession} className="flex items-center gap-2 text-[#1918f0] font-bold text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          back to library
        </button>
        
        <div className="bg-white border-2 border-[#110584]/10 rounded-[32px] p-8 shadow-2xl flex-1 flex flex-col min-h-[600px] overflow-hidden">
          {!isActive ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#1918f0] flex items-center justify-center animate-pulse">
                 <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#110584]">Ready for your interview?</h3>
                <p className="text-[#110584]/60">Start a voice conversation with our expert AI interviewer.</p>
              </div>
              <button 
                onClick={startSession}
                className="bg-[#1918f0] text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-[#1918f0]/20 hover:scale-105 transition-all"
              >
                Start Voice Interview
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#1918f0] flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#110584]">AI Mock Interview</h3>
                    <p className="text-xs font-medium text-green-500">Live & Speaking</p>
                  </div>
                </div>
                {!isAiTalking && (
                  <div className="px-4 py-1.5 bg-[#1918f0]/10 border border-[#1918f0]/20 rounded-full text-[10px] font-bold text-[#1918f0] uppercase tracking-widest animate-pulse">
                    your turn
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-2 no-scrollbar">
                {transcripts.map((t, i) => (
                  <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${t.role === 'user' ? 'bg-[#1918f0]/5 text-[#110584] border border-[#1918f0]/20' : 'bg-gray-50 text-[#110584] border border-gray-100'}`}>
                      <p className="text-sm font-medium leading-relaxed">{t.text}</p>
                    </div>
                  </div>
                ))}
                {(currentAiText || currentUserText) && (
                  <div className={`flex ${currentUserText ? 'justify-end' : 'justify-start'} animate-pulse`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${currentUserText ? 'bg-[#1918f0]/5 text-[#110584] border border-[#1918f0]/20' : 'bg-gray-50 text-[#110584] border border-gray-100'}`}>
                      <p className="text-sm font-medium leading-relaxed italic">
                        {currentUserText || currentAiText}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-[#f9f7f2] rounded-2xl text-center space-y-4">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-6 bg-[#1918f0] rounded-full ${!isAiTalking ? 'animate-bounce' : 'opacity-20'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-sm font-bold text-[#110584]">
                  {isAiTalking ? "AI is speaking..." : "Listening to you..."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestionDetailView: React.FC<{ 
  questions: InterviewQuestion[], 
  selectedIndex: number, 
  onBack: () => void,
  onNavigate: (index: number) => void
}> = ({ questions, selectedIndex, onBack, onNavigate }) => {
  const current = questions[selectedIndex];

  return (
    <div className="min-h-screen bg-[#f9f7f2] py-12 px-4 font-['Inter Tight']">
      <div className="max-w-7xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-[#1918f0] font-bold text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          back to library
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/20 flex flex-col min-h-[400px]">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-3 py-1.5 bg-[#1918f0]/5 text-[#1918f0] rounded-lg text-xs font-medium">
                {current.category}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-[#110584] leading-[1.3] flex-1">
              {current.question}
            </h2>
            
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3">
              <div className="flex items-center gap-2 text-[#1918f0] text-xs font-semibold bg-[#1918f0]/5 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {current.role}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-10 flex flex-col shadow-xl shadow-gray-200/20 min-h-[400px]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-[#1918f0] rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-xs font-semibold text-[#1918f0] tracking-tight">recommended answer</span>
            </div>
            <p className="text-xl font-medium text-[#110584] leading-[1.6] whitespace-pre-wrap flex-1">
              {current.expertAnswer}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 px-4">
          <button 
            onClick={() => onNavigate(Math.max(0, selectedIndex - 1))}
            disabled={selectedIndex === 0}
            className={`flex items-center gap-2 font-bold text-sm transition-all ${selectedIndex === 0 ? 'text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            back
          </button>
          <div className="text-sm font-medium text-[#110584]/40">
            {selectedIndex + 1} of {questions.length}
          </div>
          <button 
            onClick={() => onNavigate(Math.min(questions.length - 1, selectedIndex + 1))}
            disabled={selectedIndex === questions.length - 1}
            className={`flex items-center gap-2 font-bold text-sm transition-all ${selectedIndex === questions.length - 1 ? 'text-[#1918f0]/20' : 'text-[#1918f0] hover:scale-105'}`}
          >
            next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const InterviewPrep: React.FC = () => {
  const [viewMode, setViewMode] = useState<'library' | 'detail' | 'mock_interview'>('library');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [activeCategory, setActiveCategory] = useState('All');

  const roles = ['All Roles', 'Product Manager', 'Software Engineer', 'Financial Analyst', 'Operations Manager', 'Data Scientist'];
  const categories = ['All', 'Behavioral', 'Product Strategy', 'Analytical', 'System Design', 'Technical'];

  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter(q => {
      const roleMatch = selectedRole === 'All Roles' || q.role === selectedRole;
      const catMatch = activeCategory === 'All' || q.category === activeCategory;
      return roleMatch && catMatch;
    });
  }, [selectedRole, activeCategory]);

  if (viewMode === 'mock_interview') return <AiMockInterview onBack={() => setViewMode('library')} />;
  if (viewMode === 'detail') return (
    <QuestionDetailView 
      questions={filteredQuestions} 
      selectedIndex={selectedQuestionIndex} 
      onBack={() => setViewMode('library')} 
      onNavigate={setSelectedQuestionIndex}
    />
  );

  return (
    <div className="bg-white font-['Inter Tight'] min-h-screen">
      <section className="bg-gray-50 border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-semibold text-[#110584] leading-[1.15] tracking-[-0.04em]">Interview Library</h1>
              <p className="text-[#110584]/60 max-w-lg">Master the most frequent interview questions with expert answers and structured study tools.</p>
            </div>
            <button 
              onClick={() => setViewMode('mock_interview')}
              className="flex items-center gap-2 bg-[#1918f0] text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-[#1918f0]/20 hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Practice with AI
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <FilterDropdown
                label="Role"
                options={roles}
                selected={selectedRole}
                onSelect={setSelectedRole}
              />
              <FilterDropdown
                label="Category"
                options={categories}
                selected={activeCategory}
                onSelect={setActiveCategory}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredQuestions.map((q, index) => (
            <div 
              key={q.id}
              onClick={() => { setSelectedQuestionIndex(index); setViewMode('detail'); }}
              className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/20 hover:shadow-2xl transition-all group flex flex-col cursor-pointer hover:-translate-y-1"
            >
              <h3 className="text-xl font-bold text-[#110584] mb-8 leading-[1.4] flex-1">
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
                   <div className="flex items-center gap-2 text-sm font-bold text-[#110584] group-hover:text-[#1918f0] transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                     {q.answerCount} answers
                   </div>
                </div>
              </div>
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
              onClick={() => { setSelectedRole('All Roles'); setActiveCategory('All'); }}
              className="text-[#1918f0] font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

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