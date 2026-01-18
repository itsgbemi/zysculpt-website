
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, MediaPart } from '../services/geminiService.ts';
import { ChatMessage, FileInfo, StagedFile } from '../types.ts';

const INITIAL_MESSAGE: ChatMessage = { 
  role: 'assistant', 
  content: "Hi! I'm **Resume Builder**. Share your **current resume** and the **job description** you're targeting to get started.\n\nYou can upload **documents**, **images**, or paste **text**. I'll generate your optimized resume right here!" 
};

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap z-[60] animate-in fade-in zoom-in duration-200">
          {text}
        </div>
      )}
    </div>
  );
};

const FormattedText: React.FC<{ 
  text: string; 
  isResume?: boolean; 
  onDownload?: (format: 'pdf' | 'docx') => void;
  onQuickView?: (text: string) => void;
}> = ({ text, isResume, onDownload, onQuickView }) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const lines = text.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="relative group/content">
      {isResume && (
        <div className="flex items-center gap-2 mb-4 p-1 bg-gray-50 rounded-lg w-fit">
          <Tooltip text="Quick View">
            <button onClick={() => onQuickView?.(text)} className="p-1.5 hover:bg-white rounded shadow-sm text-gray-500 hover:text-[#1918f0] transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#09244B" strokeWidth="1"><path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" fill-rule="nonzero" fill="#09244B"></path><path d="M9.79289,12.7929 C10.1834,12.4024 10.8166,12.4024 11.2071,12.7929 C11.5675615,13.1533615 11.5952893,13.7206207 11.2902834,14.1128973 L11.2071,14.2071 L6.41421,19 L9,19 C9.55229,19 10,19.4477 10,20 C10,20.51285 9.61396434,20.9355092 9.1166221,20.9932725 L9,21 L4,21 C3.48716857,21 3.06449347,20.613973 3.0067278,20.1166239 L3,20 L3,15 C3,14.4477 3.44772,14 4,14 C4.51283143,14 4.93550653,14.386027 4.9932722,14.8833761 L5,15 L5,17.5858 L9.79289,12.7929 Z M20,3 C20.51285,3 20.9355092,3.38604429 20.9932725,3.88337975 L21,4 L21,9 C21,9.55228 20.5523,10 20,10 C19.48715,10 19.0644908,9.61395571 19.0067275,9.11662025 L19,9 L19,6.41421 L14.2071,11.2071 C13.8166,11.5976 13.1834,11.5976 12.7929,11.2071 C12.4324385,10.8466385 12.4047107,10.2793793 12.7097166,9.88709487 L12.7929,9.79289 L17.5858,5 L15,5 C14.4477,5 14,4.55229 14,4 C14,3.48716857 14.386027,3.06449347 14.8833761,3.0067278 L15,3 L20,3 Z" fill="#09244B"></path></svg>
            </button>
          </Tooltip>
          
          <Tooltip text={isCopied ? "Copied!" : "Copy"}>
            <button onClick={handleCopy} className="p-1.5 hover:bg-white rounded shadow-sm transition-all text-gray-500 hover:text-[#1918f0]">
              {isCopied ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12Z" fill="#10b981"></path><path fillRule="evenodd" clipRule="evenodd" d="M16.5303 8.96967C16.8232 9.26256 16.8232 9.73744 16.5303 10.0303L11.9041 14.6566C11.2207 15.34 10.1126 15.34 9.42923 14.6566L7.46967 12.697C7.17678 12.4041 7.17678 11.9292 7.46967 11.6363C7.76256 11.3434 8.23744 11.3434 8.53033 11.6363L10.4899 13.5959C10.5875 13.6935 10.7458 13.6935 10.8434 13.5959L15.4697 8.96967C15.7626 8.67678 16.2374 8.67678 16.5303 8.96967Z" fill="#10b981"></path></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              )}
            </button>
          </Tooltip>

          <div className="relative">
            <Tooltip text="Export Options">
              <button 
                onClick={() => setShowDownloadMenu(!showDownloadMenu)} 
                className="p-1.5 hover:bg-white rounded shadow-sm text-gray-500 hover:text-[#1918f0] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2-2H5a2 2 0 01-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </Tooltip>
            {showDownloadMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1 w-24">
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
      <Tooltip text="Remove File">
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Tooltip>
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
  const [quickViewContent, setQuickViewContent] = useState<string | null>(null);
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
    <>
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[480px] transform hover:scale-[1.01] transition-all duration-300 z-10"
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
            <Tooltip text="Reset Chat">
              <button onClick={resetConversation} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Reset Conversation">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 1920 1920"><path d="M960 0v112.941c467.125 0 847.059 379.934 847.059 847.059 0 467.125-379.934 847.059-847.059 847.059-467.125 0-847.059-379.934-847.059-847.059 0-267.106 126.607-515.915 338.824-675.727v393.374h112.94V112.941H0v112.941h342.89C127.058 407.38 0 674.711 0 960c0 529.355 430.645 960 960 960s960-430.645 960-960S1489.355 0 960 0" fillRule="evenodd"></path></svg>
              </button>
            </Tooltip>
            <Tooltip text="Remaining Credits">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 512 512"><path d="M262.203,224.297H257.5h-99.469L78.672,333.438L260.719,512l7.5-7.359L442.75,333.438l-79.344-109.141H262.203 z M345.813,245.75l-14.656,65.109l-51.859-65.109H345.813z M259.984,251.953l56.422,70.797H204.766L259.984,251.953z M240.75,245.75l-50.563,64.844v0.016l-14.563-64.859H240.75z M159.188,259.156L159.188,259.156l14.297,63.594h-60.547 L159.188,259.156z M179.25,341.75l50.063,109.422L117.75,341.75H179.25z M260.719,474.172L200.125,341.75h121.172L260.719,474.172z M292.109,451.172l50.063-109.422h61.484L292.109,451.172z M347.938,322.75l14.313-63.594l0,0l46.234,63.594H347.938z"></path></svg>
                <span className="text-white text-[11px] font-bold leading-none">{credits}</span>
              </div>
            </Tooltip>
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
                  {m.content && (
                    <FormattedText 
                      text={m.content} 
                      isResume={isResume} 
                      onDownload={handleDownload} 
                      onQuickView={setQuickViewContent}
                    />
                  )}
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

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
          {stagedFiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2 border-b border-gray-50">
              {stagedFiles.map((s, idx) => <div key={idx} className="flex-shrink-0 w-40"><FileBadge file={s.info} onRemove={() => setStagedFiles(prev => prev.filter((_, i) => i !== idx))} /></div>)}
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Tooltip text="Upload File">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-2.5 p-1.5 rounded-full text-gray-400 hover:text-[#1918f0] hover:bg-[#1918f0]/5 transition-all" title="Upload Files">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </button>
            </Tooltip>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={credits > 0 ? "Type or paste to refine..." : "No credits remaining"} disabled={credits <= 0} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-[#1918f0]/5 focus:border-[#1918f0] transition-all" />
            <Tooltip text="Send Message">
              <button type="submit" disabled={(!input.trim() && stagedFiles.length === 0) || isLoading || credits <= 0} className={`absolute right-2.5 p-1.5 rounded-full text-white transition-all ${((!input.trim() && stagedFiles.length === 0) || isLoading || credits <= 0) ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#1918f0] hover:bg-[#1312cc] active:scale-95 shadow-lg shadow-[#1918f0]/20'}`}>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16V8M8 12l4-4 4 4"/></svg>
              </button>
            </Tooltip>
          </form>
          <p className="text-[9px] text-center text-gray-400 mt-2 font-medium">Zysculpt can make mistakes. Check important information.</p>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl" onClick={() => setQuickViewContent(null)}></div>
          <div className="relative bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-xl font-bold">Quick View - Optimized Resume</h3>
              <button onClick={() => setQuickViewContent(null)} className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-500">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-white">
              <div className="max-w-3xl mx-auto shadow-sm p-12 border border-gray-50 rounded-sm">
                <FormattedText text={quickViewContent} isResume={true} onDownload={handleDownload} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatCard;
