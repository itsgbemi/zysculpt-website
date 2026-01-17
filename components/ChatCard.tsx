
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, MediaPart } from '../services/geminiService.ts';
import { ChatMessage, FileInfo, StagedFile } from '../types.ts';

const INITIAL_MESSAGE: ChatMessage = { 
  role: 'assistant', 
  content: "Hi! I'm **Resume Builder**. Share your **current resume** and the **job description** you're targeting to get started.\n\nYou can upload **documents**, **images**, or paste **text**. I'll generate your optimized resume right here!" 
};

const FormattedText: React.FC<{ text: string; isResume?: boolean; onDownload?: (format: 'pdf' | 'docx') => void }> = ({ text, isResume, onDownload }) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const lines = text.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative group/content">
      {isResume && (
        <div className="flex items-center gap-2 mb-4 p-1 bg-gray-50 rounded-lg w-fit transition-opacity">
          <button onClick={() => {}} title="Quick View" className="p-1.5 hover:bg-white rounded shadow-sm text-gray-500 hover:text-[#1918f0] transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button onClick={handleCopy} title="Copy" className="p-1.5 hover:bg-white rounded shadow-sm text-gray-500 hover:text-[#1918f0] transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)} 
              title="Download" 
              className="p-1.5 hover:bg-white rounded shadow-sm text-gray-500 hover:text-[#1918f0] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            {showDownloadMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-10 py-1 w-24">
                <button onClick={() => { onDownload?.('pdf'); setShowDownloadMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-gray-50 hover:text-[#1918f0]">PDF</button>
                <button onClick={() => { onDownload?.('docx'); setShowDownloadMenu(false); }} className="w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-gray-50 hover:text-[#1918f0]">DOCX</button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className={`space-y-1 ${isResume ? 'leading-normal' : ''}`} style={{ fontFamily: isResume ? "'EB Garamond', serif" : 'inherit' }}>
        {lines.map((line, i) => {
          if (line.startsWith('### ')) return <h4 key={i} className="text-base font-bold mt-3 mb-1">{line.replace('### ', '')}</h4>;
          if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 border-b border-gray-100">{line.replace('## ', '')}</h3>;
          if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-bold mt-5 mb-3">{line.replace('# ', '')}</h2>;
          
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
  <div className={`flex items-center gap-2 p-2 rounded-lg shadow-sm max-w-full relative group transition-all ${variant === 'bubble' ? 'bg-white/10 text-white border border-white/20' : 'bg-white border border-gray-100 text-gray-800'}`}>
    <div className={`p-1.5 rounded flex-shrink-0 ${variant === 'bubble' ? 'bg-white/20' : 'bg-[#1918f0]/5 text-[#1918f0]'}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[11px] font-semibold truncate" title={file.name}>
        {file.name}
      </span>
      <div className={`flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider ${variant === 'bubble' ? 'text-white/60' : 'text-gray-400'}`}>
        <span>{file.type}</span>
        <span>•</span>
        <span>{file.size}</span>
      </div>
    </div>
    {onRemove && (
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

const ChatCard: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyForDownload, setIsReadyForDownload] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [credits, setCredits] = useState(7);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, stagedFiles]);

  const handleDownload = (format: 'pdf' | 'docx') => {
    const lastAiMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || '';
    const cleanContent = lastAiMessage.replace(/\[READY\]/g, '').trim();
    const blob = new Blob([cleanContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Optimized_Resume.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    const newStaged = files.map(file => ({
      file,
      info: {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
      }
    }));
    setStagedFiles(prev => [...prev, ...newStaged]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setIsReadyForDownload(false);
    setStagedFiles([]);
    setInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && stagedFiles.length === 0) || isLoading || credits <= 0) return;

    const currentInput = input;
    const currentStaged = [...stagedFiles];
    setInput('');
    setStagedFiles([]);
    setCredits(prev => Math.max(0, prev - 1));

    const fileInfos = currentStaged.map(s => s.info);
    setMessages(prev => [...prev, { role: 'user', content: currentInput.trim(), files: fileInfos.length > 0 ? fileInfos : undefined }]);
    setIsLoading(true);

    try {
      const mediaParts: MediaPart[] = await Promise.all(
        currentStaged.map(async (staged) => {
          return new Promise<MediaPart>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = (e.target?.result as string).split(',')[1];
              resolve({ data: base64, mimeType: staged.file.type || 'application/octet-stream' });
            };
            reader.readAsDataURL(staged.file);
          });
        })
      );
      const response = await getGeminiResponse(currentInput, mediaParts);
      let finalContent = response;
      if (response.includes('[READY]')) {
        setIsReadyForDownload(true);
        finalContent = response.replace('[READY]', '').trim();
      }
      setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error processing request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[480px] transform hover:scale-[1.01] transition-all duration-300"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,image/*" multiple />

      {/* Header */}
      <div className="bg-[#1918f0] p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"></path></svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Resume Builder</h3>
            <p className="text-white/70 text-[10px] tracking-wider font-semibold">Let's land your dream job</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetConversation} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Reset Conversation">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 1920 1920"><path d="M960 0v112.941c467.125 0 847.059 379.934 847.059 847.059 0 467.125-379.934 847.059-847.059 847.059-467.125 0-847.059-379.934-847.059-847.059 0-267.106 126.607-515.915 338.824-675.727v393.374h112.94V112.941H0v112.941h342.89C127.058 407.38 0 674.711 0 960c0 529.355 430.645 960 960 960s960-430.645 960-960S1489.355 0 960 0" fillRule="evenodd"></path></svg>
          </button>
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 512 512"><path d="M262.203,224.297H257.5h-99.469L78.672,333.438L260.719,512l7.5-7.359L442.75,333.438l-79.344-109.141H262.203 z M345.813,245.75l-14.656,65.109l-51.859-65.109H345.813z M259.984,251.953l56.422,70.797H204.766L259.984,251.953z M240.75,245.75l-50.563,64.844v0.016l-14.563-64.859H240.75z M159.188,259.156L159.188,259.156l14.297,63.594h-60.547 L159.188,259.156z M179.25,341.75l50.063,109.422L117.75,341.75H179.25z M260.719,474.172L200.125,341.75h121.172L260.719,474.172z M292.109,451.172l50.063-109.422h61.484L292.109,451.172z M347.938,322.75l14.313-63.594l0,0l46.234,63.594H347.938z"></path></svg>
            <span className="text-white text-[11px] font-bold leading-none">{credits}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-gray-50/10 no-scrollbar">
        {messages.map((m, i) => {
          const isResume = m.role === 'assistant' && (m.content.includes('# ') || m.content.includes('## '));
          return (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#1918f0] text-white rounded-tr-none shadow-md' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                {m.files && m.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {m.files.map((f, idx) => <div key={idx} className="w-40 flex-shrink-0"><FileBadge file={f} variant={m.role === 'user' ? 'bubble' : 'preview'} /></div>)}
                  </div>
                )}
                {m.content && (m.role === 'assistant' ? <FormattedText text={m.content} isResume={isResume} onDownload={handleDownload} /> : <p className="whitespace-pre-wrap">{m.content}</p>)}
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
              <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-widest">Architecting</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
        {stagedFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2 border-b border-gray-50">
            {stagedFiles.map((s, idx) => <div key={idx} className="flex-shrink-0 w-40"><FileBadge file={s.info} onRemove={() => setStagedFiles(prev => prev.filter((_, i) => i !== idx))} /></div>)}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-2.5 p-1.5 rounded-full text-gray-400 hover:text-[#1918f0] hover:bg-[#1918f0]/5 transition-all" title="Upload Files">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={credits > 0 ? "Type or paste to refine..." : "No credits remaining"} disabled={credits <= 0} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-[#1918f0]/5 focus:border-[#1918f0] transition-all" />
          <button type="submit" disabled={(!input.trim() && stagedFiles.length === 0) || isLoading || credits <= 0} className={`absolute right-2.5 p-1.5 rounded-full text-white transition-all ${((!input.trim() && stagedFiles.length === 0) || isLoading || credits <= 0) ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#1918f0] hover:bg-[#1312cc] active:scale-95 shadow-lg shadow-[#1918f0]/20'}`}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16V8M8 12l4-4 4 4"/></svg>
          </button>
        </form>
        <p className="text-[9px] text-center text-gray-400 mt-2 font-medium">Zysculpt can make mistakes. Check important information.</p>
      </div>
    </div>
  );
};

export default ChatCard;