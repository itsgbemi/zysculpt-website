
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, MediaPart } from '../services/geminiService.ts';
import { ChatMessage, FileInfo, StagedFile } from '../types.ts';

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
};

const FileBadge: React.FC<{ file: FileInfo; variant?: 'bubble' | 'preview'; onRemove?: () => void }> = ({ file, variant = 'preview', onRemove }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg shadow-sm max-w-full relative group ${variant === 'bubble' ? 'bg-white/10 text-white border border-white/20' : 'bg-white border border-gray-100 text-gray-800'}`}>
    <div className={`p-1.5 rounded ${variant === 'bubble' ? 'bg-white/20' : 'bg-[#1918f0]/5 text-[#1918f0]'}`}>
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
        onClick={onRemove}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

const ChatCard: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Hi! I'm **Resume Builder**. To build your perfect resume, I need your **current resume** and the **job description** you're targeting.\n\nYou can upload **documents**, **images**, or paste **text**. I'll handle the analysis and bridge the gap immediately." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyForDownload, setIsReadyForDownload] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const newStaged = files.map(file => ({
      file,
      info: {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
      }
    }));

    setStagedFiles(prev => [...prev, ...newStaged]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && stagedFiles.length === 0) || isLoading) return;

    const currentInput = input;
    const currentStaged = [...stagedFiles];
    setInput('');
    setStagedFiles([]);

    const fileInfos = currentStaged.map(s => s.info);
    const userDisplayContent = currentInput.trim() || (currentStaged.length > 0 ? `Uploaded ${currentStaged.length} file(s)` : '');
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userDisplayContent, 
      files: fileInfos.length > 0 ? fileInfos : undefined 
    }]);
    
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

      const response = await getGeminiResponse(currentInput || "Analyze the provided files for resume optimization.", mediaParts);
      
      let finalContent = response;
      if (response.includes('[READY]')) {
        setIsReadyForDownload(true);
        finalContent = response.replace('[READY]', '').trim();
      }

      setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'pdf' | 'docx') => {
    const content = `ATS Optimized Resume - Generated by Zysculpt AI\nFormat: ${format.toUpperCase()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zysculpt_Resume.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col h-[480px] transform hover:scale-[1.01] transition-all duration-300 font-['Outfit',sans-serif]">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,image/*"
        multiple
      />

      {/* Header */}
      <div className="bg-[#1918f0] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Resume Builder</h3>
            <p className="text-white/70 text-[10px] tracking-wider font-semibold">Let's land your dream job</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white/80 text-xs font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-gray-50/10"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-[#1918f0] text-white rounded-tr-none shadow-md shadow-[#1918f0]/10' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm whitespace-pre-wrap'
              }`}
            >
              {m.files && m.files.length > 0 && (
                <div className="space-y-2 mb-2">
                  {m.files.map((file, idx) => (
                    <div key={idx} className="w-48">
                      <FileBadge file={file} variant={m.role === 'user' ? 'bubble' : 'preview'} />
                    </div>
                  ))}
                </div>
              )}
              {m.content && (
                m.role === 'assistant' ? <FormattedText text={m.content} /> : m.content
              )}
            </div>
          </div>
        ))}
        
        {isReadyForDownload && (
          <div className="flex flex-col items-center gap-3 py-4 animate-in zoom-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Download Ready</p>
            <div className="flex gap-2 w-full px-4">
              <button 
                onClick={() => handleDownload('pdf')}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1918f0] text-white px-4 py-3 rounded-2xl font-bold hover:bg-[#1312cc] transition-all shadow-lg shadow-[#1918f0]/20"
              >
                PDF
              </button>
              <button 
                onClick={() => handleDownload('docx')}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-[#1918f0] text-[#1918f0] px-4 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-lg"
              >
                DOCX
              </button>
            </div>
          </div>
        )}

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
      <div className="p-4 bg-white border-t border-gray-100">
        {/* Staged Files Preview (only before sending) */}
        {stagedFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2 border-b border-gray-50">
            {stagedFiles.map((staged, idx) => (
              <div key={idx} className="flex-shrink-0 w-44">
                <FileBadge file={staged.info} onRemove={() => removeStagedFile(idx)} />
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-2 p-2 rounded-xl text-gray-400 hover:text-[#1918f0] hover:bg-[#1918f0]/5 transition-all"
            title="Upload Files"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or paste job description..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-[#1918f0]/5 focus:border-[#1918f0] transition-all"
          />
          
          <button
            type="submit"
            disabled={(!input.trim() && stagedFiles.length === 0) || isLoading}
            className={`absolute right-2 p-2 rounded-xl text-white transition-all ${((!input.trim() && stagedFiles.length === 0) || isLoading) ? 'bg-gray-200 cursor-not-allowed grayscale' : 'bg-[#1918f0] hover:bg-[#1312cc] active:scale-95 shadow-lg shadow-[#1918f0]/20'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
          Personalized data is handled securely & optimized for industry standards.
        </p>
      </div>
    </div>
  );
};

export default ChatCard;
