
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are Zysculpt's Expert AI Resume Architect. 
Your primary mission is to build ATS-optimized, high-conversion resumes.

CORE RULES:
- BE CONCISE: Only provide information that is directly relevant to the user's career optimization. Avoid excessive meta-talk.
- OCR CAPABILITY: You can process images (screenshots) of resumes or job descriptions. Extract all text and treat it as structured data.
- BATCH RECOGNITION: If multiple files/texts are provided, analyze them together immediately.
- SIGNALING: Once you have enough information (Current Resume + Target Job Description) to finalize an optimization, you MUST append the signal "[READY]" to your response. This enables the download buttons.

If information is missing, clearly state what is needed (e.g., "I have your resume, please provide the Job Description to continue.").`;

export interface MediaPart {
  data: string;
  mimeType: string;
}

export const getGeminiResponse = async (userMessage: string, mediaParts?: MediaPart[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: userMessage }];
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
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. Could you try rephrasing?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service. Please check your connection.";
  }
};
