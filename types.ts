
export type Language = 'en' | 'zh';

export interface ImageItem {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
  prompt: string;
}

export interface ProcessingHistory {
  timestamp: number;
  items: ImageItem[];
}
