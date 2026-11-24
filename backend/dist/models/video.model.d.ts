export type VideoStatus = 'uploaded' | 'extracting_audio' | 'transcribing' | 'translating' | 'generating_speech' | 'merging' | 'completed' | 'failed';
export interface ProcessingStep {
    step: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    message?: string;
    timestamp?: string;
    duration?: number;
}
export interface Video {
    id: string;
    user_id: string;
    original_filename: string;
    original_video: string;
    translated_video?: string;
    transcript?: string;
    translated_text?: string;
    source_language: string;
    target_language: string;
    voice?: string;
    speed?: number;
    quality?: string;
    status: VideoStatus;
    error_message?: string;
    duration?: number;
    file_size?: number;
    processing_steps: ProcessingStep[];
    created_at: Date;
    updated_at: Date;
}
export interface CreateVideoDto {
    user_id: string;
    original_filename: string;
    original_video: string;
    file_size?: number;
    source_language?: string;
    target_language?: string;
    voice?: string;
    speed?: number;
    quality?: string;
}
export declare class VideoModel {
    static create(data: CreateVideoDto): Promise<Video>;
    static findById(id: string): Promise<Video | null>;
    static findByIdAndUser(id: string, userId: string): Promise<Video | null>;
    static findByUser(userId: string, limit?: number, offset?: number): Promise<Video[]>;
    static updateStatus(id: string, status: VideoStatus, extra?: Partial<Video>): Promise<Video | null>;
    static addProcessingStep(id: string, step: ProcessingStep): Promise<void>;
    static countByUser(userId: string): Promise<number>;
    static delete(id: string): Promise<void>;
}
//# sourceMappingURL=video.model.d.ts.map