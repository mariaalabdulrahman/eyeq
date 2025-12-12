export interface Disease {
  name: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedFrom?: 'fundus' | 'oct' | 'both';
  justification?: string;
  references?: string[];
}

export interface ScanAnalysis {
  id: string;
  name: string;
  imageUrl: string;
  uploadedAt: Date;
  type: 'fundus';
  diseases: Disease[];
  summary: string;
  linkedOctId?: string; // Optional linked OCT scan
  linkedOctUrl?: string;
  linkedOctName?: string;
  eyeSide?: 'left' | 'right'; // Which eye the scan is from
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
