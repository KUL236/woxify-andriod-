export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type VideoStatus =
  | 'uploaded'
  | 'extracting_audio'
  | 'transcribing'
  | 'translating'
  | 'generating_speech'
  | 'merging'
  | 'completed'
  | 'failed';

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  timestamp?: string;
  duration?: number;
}

export interface Video {
  id: string;
  original_filename: string;
  status: VideoStatus;
  transcript?: string;
  translated_text?: string;
  source_language: string;
  target_language: string;
  error_message?: string;
  duration?: number;
  file_size?: number;
  processing_steps: ProcessingStep[];
  has_translated_video: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  message: string;
  video: Video;
}

export interface HistoryResponse {
  videos: Video[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiError {
  error: string;
}
