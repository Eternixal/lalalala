
export type RequestType = 'pencarian jurnal' | 'ringkasan jurnal' | 'laporan praktikum' | 'penjelasan konsep' | 'umum';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AcademicResponse {
  title: string;
  type: RequestType;
  summary: string;
  mainContent: string;
  academicNotes: string;
  sources?: GroundingChunk[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  parsedResponse?: AcademicResponse;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}
