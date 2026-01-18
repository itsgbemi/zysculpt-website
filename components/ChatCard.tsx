
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, MediaPart } from '../services/geminiService.ts';
import { ChatMessage, FileInfo, StagedFile } from '../types.ts';

const INITIAL_RESUME_CONTENT = "Hi! I'm **Resume Builder**. Share your **current resume** and the **job description** you're targeting to get started.\n\nYou can upload **documents**, **images**, or paste **text**. I'll generate your optimized resume right here!";

const TOOLTIP_STYLES = "absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-[#0f172a] text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap z-[100] animate-in fade-in zoom-in duration-200";

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsVisible(false), 2000);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="relative inline-flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && <div className={TOOLTIP_STYLES}>{text}</div>}
    </div>
  );
};

const FormattedText: React.FC<{ 
  text: string; 
  isResume?: boolean; 
  onDownload?: (format: 'pdf' | 'docx') => void;
}> = ({ text, isResume, onDownload }) => {
  const lines = text.split('\n');

  return (
    <div className="relative group/content">
      {isResume && (
        <div className="flex items-center gap-2 mb-4 p-1.5 bg-gray-100/50 rounded-xl w-fit border border-gray-200">
          <button 
            onClick={() => onDownload?.('pdf')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-lg shadow-sm text-[#0f172a] hover:text-[#1918f0] transition-all border border-gray-200"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6m-3 3l3 3 3-3"/>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tight">PDF</span>
          </button>
          
          <button 
            onClick={() => onDownload?.('docx')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-lg shadow-sm text-[#0f172a] hover:text-[#1918f0] transition-all border border-gray-200"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tight">DOCX</span>
          </button>
        </div>
      )}
      <div className={`space-y-1 ${isResume ? 'leading-relaxed' : ''} text-black`} style={{ fontFamily: isResume ? "'EB Garamond', serif" : "'Work Sans', sans-serif" }}>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{trimmed.replace('# ', '')}</h1>;
          if (trimmed.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-3 mb-1 border-b border-gray-200 uppercase tracking-wide">{trimmed.replace('## ', '')}</h2>;
          if (trimmed.startsWith('### ')) return <h3 key={i} className="text-md font-bold mt-2 mb-1">{trimmed.replace('### ', '')}</h3>;
          
          const boldParts = line.split(/(\*\*.*?\*\*)/g);
          const renderedLine = boldParts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-black">{part.slice(2, -2)}</strong>;
            }
            return part;
          });
          return <p key={i} className="min-h-[1em]">{renderedLine}</p>;
        })}
      </div>
    </div>
  );
};

const FileBadge: React.FC<{ file: FileInfo; variant?: 'bubble' | 'preview'; onRemove?: () => void }> = ({ file, variant = 'preview', onRemove }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg shadow-sm max-w-full relative group transition-all ${variant === 'bubble' ? 'bg-white/10 text-white border border-white/20' : 'bg-white border border-gray-100 text-[#0f172a]'}`}>
    <div className={`p-1.5 rounded flex-shrink-0 ${variant === 'bubble' ? 'bg-white/20' : 'bg-[#1918f0]/5 text-[#1918f0]'}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[11px] font-semibold truncate">{file.name}</span>
      <div className={`flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider ${variant === 'bubble' ? 'text-white/60' : 'text-[#64748b]'}`}>
        <span>{file.type}</span>
        <span>•</span>
        <span>{file.size}</span>
      </div>
    </div>
    {onRemove && (
      <Tooltip text="Remove File">
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </Tooltip>
    )}
  </div>
);

interface ChatCardProps {
  mode: 'resume' | 'cover_letter' | 'resignation';
}

const ChatCard: React.FC<ChatCardProps> = ({ mode }) => {
  const getInitialMessage = () => {
    switch(mode) {
      case 'cover_letter': return "Hi! I'm your **Cover Letter Architect**. Share your background and the job you're eyeing to craft a compelling story.";
      case 'resignation': return "Hi! I'm your **Resignation Guide**. I'll help you write a professional and graceful exit letter.";
      default: return INITIAL_RESUME_CONTENT;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`zysculpt_chat_${mode}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([{ role: 'assistant', content: getInitialMessage() }]);
      }
    } else {
      setMessages([{ role: 'assistant', content: getInitialMessage() }]);
    }
    setStagedFiles([]);
    setInput('');
  }, [mode]);

  // Persist to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`zysculpt_chat_${mode}`, JSON.stringify(messages));
    }
  }, [messages, mode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, stagedFiles]);

  const handleDownload = (format: 'pdf' | 'docx') => {
    const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || '';
    const cleanContent = lastAiMessage.replace(/\[READY\]/g, '').trim();
    const blob = new Blob([cleanContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zysculpt_${mode}.${format === 'pdf' ? 'txt' : 'docx'}`; 
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newStaged = files.map(file => ({
      file,
      info: { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', type: file.name.split('.').pop()?.toUpperCase() || 'FILE' }
    }));
    setStagedFiles(prev => [...prev, ...newStaged]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && stagedFiles.length === 0) || isLoading) return;

    const currentInput = input;
    const currentStaged = [...stagedFiles];
    setInput('');
    setStagedFiles([]);

    const fileInfos = currentStaged.map(s => s.info);
    setMessages(prev => [...prev, { role: 'user', content: currentInput.trim(), files: fileInfos.length > 0 ? fileInfos : undefined }]);
    setIsLoading(true);

    try {
      const mediaParts: MediaPart[] = await Promise.all(
        currentStaged.map(async (staged) => {
          return new Promise<MediaPart>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ data: (e.target?.result as string).split(',')[1], mimeType: staged.file.type || 'application/octet-stream' });
            reader.readAsDataURL(staged.file);
          });
        })
      );
      const response = await getGeminiResponse(currentInput, mode, mediaParts);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error processing request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col h-[480px] transform hover:scale-[1.01] transition-all duration-300 z-10 font-['Work_Sans']">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,image/*" multiple />

      {/* Header */}
      <div className="bg-[#1918f0] p-4 flex items-center justify-between flex-shrink-0 relative rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"></path></svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight capitalize tracking-tight">{mode.replace('_', ' ')}</h3>
            <p className="text-white/70 text-[10px] font-semibold">Architecting your future</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-gray-50/10 no-scrollbar">
        {messages.map((m, i) => {
          const isDoc = m.role === 'assistant' && (m.content.includes('# ') || m.content.includes('## '));
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#1918f0] text-black rounded-tr-none shadow-md' : 'bg-white text-black rounded-tl-none border border-gray-100 shadow-sm'}`}>
                {m.files && m.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {m.files.map((f, idx) => <div key={idx} className="w-40 flex-shrink-0"><FileBadge file={f} variant={m.role === 'user' ? 'bubble' : 'preview'} /></div>)}
                  </div>
                )}
                {m.content && <FormattedText text={m.content} isResume={isDoc} onDownload={handleDownload} />}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-[#1918f0] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#1918f0] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-[#1918f0] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-[10px] text-[#64748b] font-bold ml-2 uppercase tracking-widest">Architecting</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 rounded-b-3xl">
        {stagedFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2 border-b border-gray-50">
            {stagedFiles.map((s, idx) => <div key={idx} className="flex-shrink-0 w-40"><FileBadge file={s.info} onRemove={() => setStagedFiles(prev => prev.filter((_, i) => i !== idx))} /></div>)}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Tooltip text="Upload File">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-2.5 p-1.5 rounded-full text-[#64748b] hover:text-[#1918f0] hover:bg-[#1918f0]/5 transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </button>
          </Tooltip>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste to refine..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-[#1918f0]/5 focus:border-[#1918f0] transition-all text-[#0f172a]" />
          <Tooltip text="Send Message">
            <button type="submit" disabled={(!input.trim() && stagedFiles.length === 0) || isLoading} className={`absolute right-2.5 p-1.5 rounded-full text-white transition-all ${((!input.trim() && stagedFiles.length === 0) || isLoading) ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#1918f0] hover:bg-[#1312cc] active:scale-95 shadow-lg shadow-[#1918f0]/20'}`}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 16V8M8 12l4-4 4 4"/></svg>
            </button>
          </Tooltip>
        </form>
        <p className="text-[9px] text-center text-[#64748b] mt-2 font-medium tracking-tight">Zysculpt can make mistakes. Check important information.</p>
      </div>
    </div>
  );
};

export default ChatCard;