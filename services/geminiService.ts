import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

export const generatePersona = async (industry: string): Promise<string> => {
  try {
    const prompt = `Create a brief User Persona for a buyer in the "${industry}" industry looking for commercial tables from TableX.
    Include:
    1. Job Title
    2. Key Pain Points (related to ordering furniture)
    3. What they value most (e.g., durability, design, price)
    Keep it under 150 words.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const breakDownTask = async (taskName: string): Promise<string> => {
  try {
    const prompt = `I am a Project Manager for the TableX website redesign (a commercial table manufacturer). 
    We are in the Discovery & Framing phase.
    
    Please break down the task: "${taskName}" into 3-5 specific, actionable sub-tasks or key questions we need to answer. 
    Keep it concise and suitable for a to-do list.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const draftStatusEmail = async (completedCount: number, totalCount: number): Promise<string> => {
  try {
    const prompt = `Write a professional, concise project update email to Brian Craig (VP Sales at TableX).
    
    Context:
    - Project: Custom Website Design (Discovery Phase)
    - Date: Jan 29, 2026
    - Status: We have completed ${completedCount} out of ${totalCount} immediate next steps.
    
    Key Highlights to mention:
    - We are finalizing the sitemap based on his funnel feedback.
    - We are ready to schedule stakeholder interviews.
    - We are setting up the shared drive for his data artifacts.
    
    Tone: Collaborative, professional, and forward-looking.
    Sign off: The ClearPH Team.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};