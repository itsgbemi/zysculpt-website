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

      const combinedText = `RESUME CONTENT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`;
      const analysis = await analyzeAtsScore(
        combinedText,
        "Analyze the provided resume against the job description.",
        [...jdMediaParts, ...resumeMediaParts]
      );
      setResults(analysis);
      setStep(4);
    } catch (err) {
      console.error(err);
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

  const ChoiceOption = ({ label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
        active 
        ? 'border-[#1918f0] bg-[#1918f0]/5' 
        : 'border-gray-100 bg-white hover:border-[#1918f0]/30 hover:bg-gray-50'
      }`}
    >
      <span className={`flex-1 font-normal transition-colors ${active ? 'text-[#1918f0]' : 'text-[#110584]'}`}>{label}</span>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-[#1918f0] bg-[#1918f0]' : 'border-gray-200'}`}>
        {active && <div className="w-2 h-2 bg-white rounded-full" />}
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

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg 
      className={`w-4 h-4 text-[#110584]/40 transition-transform duration-300 ${expanded ? 'rotate-0' : '-rotate-90'}`} 
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

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
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3">
                  <ChevronIcon expanded={!jdInputType} />
                  <h2 className="text-lg font-semibold text-[#110584]">How would you like to provide the Job Description?</h2>
                  {jdInputType && (
                    <button 
                      onClick={() => { setJdInputType(null); setJobDescription(''); setJdFiles([]); }} 
                      className="ml-auto text-xs font-bold text-[#1918f0] hover:underline"
                    >
                      Change method
                    </button>
                  )}
                </div>
                
                {!jdInputType ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <ChoiceOption 
                      label="Paste Job Text"
                      active={jdInputType === 'text'}
                      onClick={() => setJdInputType('text')}
                    />
                    <ChoiceOption 
                      label="Upload Job File (PDF/DOCX/Image)"
                      active={jdInputType === 'file'}
                      onClick={() => setJdInputType('file')}
                    />
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in duration-300">
                    {jdInputType === 'text' && (
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste job details here..."
                        className="w-full h-64 bg-gray-50 border border-gray-200 rounded-3xl p-6 text-sm focus:outline-none focus:border-[#1918f0] transition-all"
                      />
                    )}
                    {jdInputType === 'file' && (
                      <div 
                        onClick={() => jdFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center cursor-pointer hover:border-[#1918f0]/50 hover:bg-[#1918f0]/5 transition-all"
                      >
                        <input type="file" ref={jdFileInputRef} className="hidden" onChange={(e) => setJdFiles(Array.from(e.target.files || []))} accept="image/*,.pdf,.doc,.docx,.txt" />
                        <div className="w-16 h-16 bg-[#1918f0]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-[#1918f0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <h4 className="font-bold text-[#110584] mb-2">{jdFiles.length > 0 ? jdFiles[0].name : "Select job description file"}</h4>
                        <p className="text-xs text-[#110584]/40 uppercase tracking-widest font-bold">PDF, DOCX, or Image</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3">
                  <ChevronIcon expanded={!resumeInputType} />
                  <h2 className="text-lg font-semibold text-[#110584]">How would you like to provide your Resume?</h2>
                  {resumeInputType && (
                    <button 
                      onClick={() => { setResumeInputType(null); setResumeText(''); setResumeFiles([]); }} 
                      className="ml-auto text-xs font-bold text-[#1918f0] hover:underline"
                    >
                      Change method
                    </button>
                  )}
                </div>
                
                {!resumeInputType ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <ChoiceOption 
                      label="Paste Resume Text"
                      active={resumeInputType === 'text'}
                      onClick={() => setResumeInputType('text')}
                    />
                    <ChoiceOption 
                      label="Upload Resume File (PDF/DOCX)"
                      active={resumeInputType === 'file'}
                      onClick={() => setResumeInputType('file')}
                    />
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in duration-300">
                    {resumeInputType === 'text' && (
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste resume content here..."
                        className="w-full h-64 bg-gray-50 border border-gray-200 rounded-3xl p-6 text-sm focus:outline-none focus:border-[#1918f0] transition-all"
                      />
                    )}
                    {resumeInputType === 'file' && (
                      <div 
                        onClick={() => resumeFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center cursor-pointer hover:border-[#1918f0]/50 hover:bg-[#1918f0]/5 transition-all"
                      >
                        <input type="file" ref={resumeFileInputRef} className="hidden" onChange={(e) => setResumeFiles(Array.from(e.target.files || []))} accept=".pdf,.doc,.docx,.txt" />
                        <div className="w-16 h-16 bg-[#1918f0]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-[#1918f0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h4 className="font-bold text-[#110584] mb-2">{resumeFiles.length > 0 ? resumeFiles[0].name : "Select resume file"}</h4>
                        <p className="text-xs text-[#110584]/40 uppercase tracking-widest font-bold">PDF or DOCX</p>
                      </div>
                    )}
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
                  <p className="text-[#110584]/60 max-sm mx-auto">We've gathered all your information. Click below to start the scan.</p>
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
                  <button onClick={() => { setStep(1); setResults(null); setJdInputType(null); setResumeInputType(null); }} className="text-sm font-bold text-[#1918f0] hover:underline">Start New Analysis</button>
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