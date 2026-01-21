import React, { useState, useRef } from 'react';
import { analyzeAtsScore, MediaPart } from '../services/geminiService.ts';

type InputType = 'text' | 'file' | null;

const AtsScorer: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Job Description State
  const [jdInputType, setJdInputType] = useState<InputType>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jdFiles, setJdFiles] = useState<File[]>([]);
  
  // Resume State
  const [resumeInputType, setResumeInputType] = useState<InputType>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);

  const jdFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const jdMediaParts: MediaPart[] = await Promise.all(
        jdFiles.map(async (file) => {
          return new Promise<MediaPart>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ 
              data: (e.target?.result as string).split(',')[1], 
              mimeType: file.type || 'application/octet-stream' 
            });
            reader.readAsDataURL(file);
          });
        })
      );

      const resumeMediaParts: MediaPart[] = await Promise.all(
        resumeFiles.map(async (file) => {
          return new Promise<MediaPart>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ 
              data: (e.target?.result as string).split(',')[1], 
              mimeType: file.type || 'application/octet-stream' 
            });
            reader.readAsDataURL(file);
          });
        })
      );

      // Combine text and media context
      const analysis = await analyzeAtsScore(
        `RESUME:\n${resumeText}\n\nJOB:\n${jobDescription}`,
        "Combined analysis request",
        [...jdMediaParts, ...resumeMediaParts]
      );
      setResults(analysis);
      setStep(4);
    } catch (err) {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const ScoreCircle = ({ score, label }: { score: number, label: string }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-gray-100 stroke-current"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-[#1918f0] stroke-current transition-all duration-1000 ease-out"
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-[#110584]">{score}%</span>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#110584]/60">{label}</span>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#1918f0] text-white' : 'bg-gray-200 text-gray-400'}`}>
            {s}
          </div>
          {s < 3 && <div className={`w-12 h-0.5 mx-2 transition-all ${step > s ? 'bg-[#1918f0]' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  const ChoiceCard = ({ icon, label, sublabel, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex-1 p-8 rounded-3xl border-2 transition-all text-left space-y-4 ${
        active 
        ? 'border-[#1918f0] bg-[#1918f0]/5 shadow-xl shadow-[#1918f0]/5' 
        : 'border-gray-100 bg-white hover:border-[#1918f0]/30 hover:bg-gray-50'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-[#1918f0] text-white' : 'bg-gray-100 text-[#110584]/40'}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-[#110584]">{label}</h4>
        <p className="text-xs text-[#110584]/40 font-medium">{sublabel}</p>
      </div>
    </button>
  );

  const isNextDisabled = () => {
    if (step === 1) {
      if (!jdInputType) return true;
      if (jdInputType === 'text' && !jobDescription.trim()) return true;
      if (jdInputType === 'file' && jdFiles.length === 0) return true;
    }
    if (step === 2) {
      if (!resumeInputType) return true;
      if (resumeInputType === 'text' && !resumeText.trim()) return true;
      if (resumeInputType === 'file' && resumeFiles.length === 0) return true;
    }
    return false;
  };

  return (
    <div className="bg-white font-['Inter Tight'] min-h-screen">
      <section className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-semibold text-[#110584] leading-[1.15] tracking-[-0.04em] mb-6">
              ATS Resume Scorer
            </h1>
            <p className="text-lg text-[#110584]/60 max-w-xl">
              Our step-by-step scanner analyzes your documents against specific job requirements using advanced AI.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-4xl mx-auto px-4">
        {step < 4 && <StepIndicator />}

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-10 flex-1">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#110584]">Target Job</h2>
                  <p className="text-[#110584]/60">How would you like to share the job description?</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <ChoiceCard 
                    label="Paste Text"
                    sublabel="Copy-paste job requirements"
                    active={jdInputType === 'text'}
                    onClick={() => setJdInputType('text')}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                  />
                  <ChoiceCard 
                    label="Upload File"
                    sublabel="Screenshot, PDF, or Word"
                    active={jdInputType === 'file'}
                    onClick={() => setJdInputType('file')}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  />
                </div>

                {jdInputType === 'text' && (
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job details here..."
                    className="w-full h-48 bg-gray-50 border border-gray-200 rounded-3xl p-6 text-sm focus:outline-none focus:border-[#1918f0] animate-in fade-in slide-in-from-top-2"
                  />
                )}

                {jdInputType === 'file' && (
                  <div 
                    onClick={() => jdFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center cursor-pointer hover:border-[#1918f0]/50 hover:bg-[#1918f0]/5 transition-all animate-in fade-in slide-in-from-top-2"
                  >
                    <input type="file" ref={jdFileInputRef} className="hidden" onChange={(e) => setJdFiles(Array.from(e.target.files || []))} accept="image/*,.pdf,.doc,.docx,.txt" />
                    <h4 className="font-bold text-[#110584] mb-2">{jdFiles.length > 0 ? jdFiles[0].name : "Click to upload job context"}</h4>
                    <p className="text-xs text-[#110584]/40 uppercase tracking-widest font-bold">Screenshots supported</p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#110584]">Your Resume</h2>
                  <p className="text-[#110584]/60">Choose your preferred way to provide your resume.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <ChoiceCard 
                    label="Paste Text"
                    sublabel="Copy-paste your CV content"
                    active={resumeInputType === 'text'}
                    onClick={() => setResumeInputType('text')}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                  />
                  <ChoiceCard 
                    label="Upload File"
                    sublabel="PDF or Word document"
                    active={resumeInputType === 'file'}
                    onClick={() => setResumeInputType('file')}
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
                  />
                </div>

                {resumeInputType === 'text' && (
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume content here..."
                    className="w-full h-48 bg-gray-50 border border-gray-200 rounded-3xl p-6 text-sm focus:outline-none focus:border-[#1918f0] animate-in fade-in slide-in-from-top-2"
                  />
                )}

                {resumeInputType === 'file' && (
                  <div 
                    onClick={() => resumeFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center cursor-pointer hover:border-[#1918f0]/50 hover:bg-[#1918f0]/5 transition-all animate-in fade-in slide-in-from-top-2"
                  >
                    <input type="file" ref={resumeFileInputRef} className="hidden" onChange={(e) => setResumeFiles(Array.from(e.target.files || []))} accept=".pdf,.doc,.docx,.txt" />
                    <h4 className="font-bold text-[#110584] mb-2">{resumeFiles.length > 0 ? resumeFiles[0].name : "Upload your resume file"}</h4>
                    <p className="text-xs text-[#110584]/40 uppercase tracking-widest font-bold">Standard formats only</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-12 py-10 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[#1918f0]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-[#1918f0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-[#110584]">Ready for Analysis</h2>
                  <p className="text-[#110584]/60 max-w-sm mx-auto">We've gathered all your information. Click below to start the scan.</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={runAnalysis}
                    disabled={isLoading}
                    className="primary-btn px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-[#1918f0]/20 min-w-[200px] flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Scan Resume
                      </>
                    )}
                  </button>
                  <p className="text-[10px] font-bold text-[#110584]/30 uppercase tracking-widest">Takes about 10-15 seconds</p>
                </div>
              </div>
            )}

            {step === 4 && results && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center justify-between gap-6 pb-8 border-b border-gray-50">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-[#110584]">Analysis Result</h3>
                    <p className="text-sm font-medium text-[#110584]/60">{results.summary}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-[#1918f0]">{results.overallScore}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#110584]/40">Overall Match</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <ScoreCircle score={results.overallScore} label="Match" />
                  <ScoreCircle score={results.keywordScore} label="Keywords" />
                  <ScoreCircle score={results.formattingScore} label="Format" />
                </div>

                <div className="space-y-6">
                  {results.findings.missingKeywords.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-500">Critical Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.findings.missingKeywords.map((word: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">+ {word}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#110584]/60">Formatting Feedback</h4>
                      <ul className="space-y-2">
                        {results.findings.formattingIssues.map((issue: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm text-[#110584]/80 font-medium">
                            <span className="text-red-500">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#1918f0]">Action Items</h4>
                      <ul className="space-y-2">
                        {results.findings.improvementSuggestions.map((tip: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm text-[#110584]/80 font-medium">
                            <span className="text-[#1918f0] font-black">→</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50 flex justify-center">
                  <button onClick={() => { setStep(1); setResults(null); }} className="text-sm font-bold text-[#1918f0] hover:underline">Start New Analysis</button>
                </div>
              </div>
            )}
          </div>

          {step < 4 && (
            <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className={`text-sm font-bold transition-all ${step === 1 ? 'text-gray-300 pointer-events-none' : 'text-[#110584] hover:text-[#1918f0]'}`}
              >
                Back
              </button>
              {step < 3 && (
                <button 
                  onClick={() => setStep(s => Math.min(3, s + 1))}
                  disabled={isNextDisabled()}
                  className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${isNextDisabled() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'primary-btn shadow-lg'}`}
                >
                  Next Step
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#110584] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
           <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Passing the screen is only the first step.</h2>
           <p className="text-white/60 text-lg">Use our AI Builder to automatically integrate these keywords into your professional profile.</p>
           <button 
             onClick={() => window.location.hash = '#resume'}
             className="bg-white text-[#110584] px-12 py-4 rounded-full font-bold shadow-2xl transition-all hover:bg-gray-100 hover:scale-105"
           >
             Open AI Builder
           </button>
        </div>
      </section>
    </div>
  );
};

export default AtsScorer;