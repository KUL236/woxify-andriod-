export interface VideoInfo {
    duration: number;
    width?: number;
    height?: number;
    codec?: string;
    bitrate?: number;
}
export declare const extractAudio: (videoPath: string, videoId: string) => Promise<string>;
export declare const splitAudioIntoChunks: (audioPath: string, videoId: string, chunkDuration?: number) => Promise<string[]>;
export declare const mergeAudioChunks: (chunks: string[], videoId: string) => Promise<string>;
export declare const mergeAudioWithVideo: (videoPath: string, audioPath: string, videoId: string, quality?: string, speed?: number) => Promise<string>;
export declare const getVideoInfo: (videoPath: string) => Promise<VideoInfo>;
export declare const cleanupFiles: (filePaths: string[]) => void;
//# sourceMappingURL=ffmpeg.service.d.ts.map