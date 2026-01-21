import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are Zysculpt's Expert AI Career Architect. 
Your goal is to build and refine ATS-optimized career documents (Resumes, Cover Letters, or Resignation Letters).

STRICT OPERATING GUIDELINES:
1. NO CONVERSATIONAL FILLER IN DOCUMENTS: The document content (Markdown) must NEVER contain meta-talk, instructions, or requests for more info. 
2. STRUCTURE: Use standard Markdown headers: # for Name/Title, ## for Section Headings (like EXPERIENCE), ### for Sub-headings.
3. ISOLATION: If you need to ask for more info or explain something, do it BEFORE or AFTER the Markdown document, never inside it.
4. SIGNALING: Append "[READY]" at the very end of your response ONLY when a full document has been generated.
5. ATS OPTIMIZATION: Use clear, industry-standard headings.

If information is missing, do not hallucinate placeholders. Instead, ask the user concisely in a separate paragraph.`;

const INTERVIEW_SYSTEM_INSTRUCTION = `You are an expert Interviewer. 
Your goal is to conduct a professional, conversational mock interview. 
Guidelines:
1. Start by asking a relevant interview question.
2. Wait for the user's response.
3. Provide very brief, constructive feedback on their answer.
4. Ask a follow-up or a new question.
5. Keep the tone professional and encouraging.
6. Always end your message with a question for the candidate.`;

export interface MediaPart {
  data: string;
  mimeType: string;
}

export const getGeminiResponse = async (userMessage: string, mode: string, mediaParts?: MediaPart[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contextPrompt = `Context: This user is specifically building a ${mode.replace('_', ' ')}. 
    Current Input: ${userMessage || "Generate/Update the document based on provided files."}`;

    const parts: any[] = [{ text: contextPrompt }];
    if (mediaParts && mediaParts.length > 0) {
      mediaParts.forEach(m => {
        parts.push({
          inlineData: {
            data: m.data,
            mimeType: m.mimeType
          }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-09-2025',
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};

export const getMockInterviewResponse = async (history: { role: 'user' | 'assistant', content: string }[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-09-2025',
      contents: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
      config: {
        systemInstruction: INTERVIEW_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || "Let's continue the interview. What else would you like to share?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a bit of trouble connecting to our systems. Could you repeat that?";
  }
};