
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, APP_MODELS } from "../constants";
import { AcademicResponse, RequestType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAcademicResponse = async (
  prompt: string,
  onUpdate?: (text: string) => void
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: APP_MODELS.RESEARCH,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text;
    return text || "Maaf, sistem tidak dapat menghasilkan respons saat ini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// Helper to parse the custom text format back into structured data
export const parseResponseText = (text: string): AcademicResponse => {
  const lines = text.split('\n');
  let title = "Hasil Riset Akademik";
  let type: RequestType = 'umum';
  let summary = "";
  let mainContent = "";
  let academicNotes = "";

  // Simple heuristic parsing
  const titleMatch = text.match(/^\[(.*?)\]/);
  if (titleMatch) title = titleMatch[1];

  const typeMatch = text.match(/Jenis Permintaan:\s*(.*)/i);
  if (typeMatch) type = typeMatch[1].toLowerCase().trim() as RequestType;

  const summaryMatch = text.match(/Ringkasan Singkat:\s*([\s\S]*?)(?=Isi Utama:|$)/i);
  if (summaryMatch) summary = summaryMatch[1].trim();

  const contentMatch = text.match(/Isi Utama:\s*([\s\S]*?)(?=Catatan Akademik:|$)/i);
  if (contentMatch) mainContent = contentMatch[1].trim();

  const notesMatch = text.match(/Catatan Akademik:\s*([\s\S]*?)$/i);
  if (notesMatch) academicNotes = notesMatch[1].trim();

  return { title, type, summary, mainContent, academicNotes };
};
