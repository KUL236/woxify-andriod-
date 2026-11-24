export interface WhisperResult {
    transcript: string;
    language: string;
}
export declare function transcribeAudio(audioPath: string): Promise<WhisperResult>;
//# sourceMappingURL=whisper.service.d.ts.map