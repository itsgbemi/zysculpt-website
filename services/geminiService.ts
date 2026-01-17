
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are Zysculpt's Expert AI Resume Architect. 
Your goal is to build and refine ATS-optimized resumes based on user input (text, docs, or screenshots).

STRICT OPERATING GUIDELINES:
1. NO META-TALK: Do not describe your processing steps (e.g., "I am now performing OCR", "I am analyzing"). Just provide the result.
2. CONTENT FIRST: When you have enough data, output the FULL resume draft directly in Markdown format. Users should see their new resume in the chat.
3. ITERATIVE EDITS: Users will ask for changes (e.g., "Make the summary shorter"). Always provide the updated full resume or the specific section they asked for.
4. SIGNALING: Append "[READY]" ONLY when you have produced a complete, optimized resume draft. This enables the user's download functionality.
5. OCR: Automatically extract and use all text found in images provided.

If you are missing either the Current Resume or Target Job Description, briefly ask for the missing item and nothing else.`;

export interface MediaPart {
  data: string;
  mimeType: string;
}

export const getGeminiResponse = async (userMessage: string, mediaParts?: MediaPart[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: userMessage || "Analyze the provided information and generate/update the resume." }];
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
        temperature: 0.4, // Lower temperature for more stable resume formatting
      },
    });

    return response.text || "I'm sorry, I couldn't process that. Could you try rephrasing?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service. Please check your connection.";
  }
};
