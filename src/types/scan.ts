export interface Disease {
  name: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ScanAnalysis {
  id: string;
  name: string;
  imageUrl: string;
  uploadedAt: Date;
  type: 'eye' | 'ultrasound';
  diseases: Disease[];
  summary: string;
  chatHistory: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type ViewMode = 'textual' | 'visual' | 'comparison' | 'visualization';
