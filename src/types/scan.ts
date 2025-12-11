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
  type: 'oct' | 'fundus';
  diseases: Disease[];
  summary: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  scans: ScanAnalysis[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  selectedScanIds: string[];
}

export type ViewMode = 'textual' | 'visual' | 'comparison' | 'visualization';
