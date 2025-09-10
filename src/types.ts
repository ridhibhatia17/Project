export interface DocumentComparison {
  oldDocument: {
    name: string;
    text: string;
  };
  newDocument: {
    name: string;
    text: string;
  };
  differences: DiffSegment[];
  changes: Change[];
  summary: ChangeSummary;
}

export interface DiffSegment {
  type: 'addition' | 'deletion' | 'unchanged';
  text: string;
}

export interface Change {
  type: 'addition' | 'deletion' | 'modification';
  text: string;
  context: string;
  impact: 'low' | 'medium' | 'high';
  explanation: AIExplanation;
  originalSentence: string;
  modifiedSentence: string;
  originalHighlights: { text: string; type: 'deletion' | 'modification' }[];
  modifiedHighlights: { text: string; type: 'addition' | 'modification' }[];
}

export interface AIExplanation {
  summary: string;
  detail: string;
  impact: 'low' | 'medium' | 'high';
  category: 'financial' | 'termination' | 'liability' | 'rights' | 'date' | 'general';
}

export interface ChangeSummary {
  totalChanges: number;
  additions: number;
  deletions: number;
  modifications: number;
}

export interface UploadedFile {
  file: File;
  name: string;
  type: string;
}