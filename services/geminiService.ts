
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are Zysculpt's Expert AI Resume Architect. 
Your primary mission is to build ATS-optimized, high-conversion resumes.

INPUT RECOGNITION:
- If a user provides "USER RESUME:", analyze their history and skills.
- If a user provides "TARGET JOB DESCRIPTION:", extract keywords and requirements.

FOLLOW THIS PROTOCOL:
1. GREET: If it's a new conversation, ask for the target JOB DESCRIPTION or their current RESUME.
2. ANALYZE: Compare the resume with the job description. Identify gaps.
3. ADVISE: Provide 2-3 specific, high-impact bullet points as examples of how to bridge gaps.
4. FINALIZE: Once you have enough context to tailor the content, notify the user.
5. SIGNAL: When the resume is complete and ready for export, you MUST include the text "[READY]" at the very end of your response.

Keep responses professional, concise, and focused on ATS compatibility.`;

export const getGeminiResponse = async (userMessage: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
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
