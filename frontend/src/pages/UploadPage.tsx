import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, X, AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { videoApi, getApiError } from '../services/api';
import toast from 'react-hot-toast';
import LanguageSelector from "../components/LanguageSelector";

const MAX_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED = { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'], 'video/x-msvideo': ['.avi'], 'video/webm': ['.webm'] };

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [speed, setSpeed] = useState(1.0);
  const [quality, setQuality] = useState('1080p');

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') {
        toast.error('File too large. Maximum size is 500MB.');
      } else if (err.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload MP4, MOV, AVI, or WebM.');
      } else {
        toast.error(err.message);
      }
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await videoApi.upload(file, sourceLanguage, targetLanguage, speed, quality, setUploadProgress);
      toast.success('Video uploaded! Processing started.');
      navigate(`/video/${result.video.id}`);
    } catch (err) {
      toast.error(getApiError(err));
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Upload Video</h1>
        <p className="text-slate-400">Upload a Hindi video file to start the AI dubbing pipeline</p>
      </div>

      {/* Language Selection */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <LanguageSelector
          label="Source Language"
          value={sourceLanguage}
          onChange={setSourceLanguage}
        />

        <LanguageSelector
          label="Target Language"
          value={targetLanguage}
          onChange={setTargetLanguage}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Video Speed
            </label>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full rounded-xl bg-surface-900 border border-white/10 p-3 text-white"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x (Normal)</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Video Quality
            </label>

            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full rounded-xl bg-surface-900 border border-white/10 p-3 text-white"
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
            </select>
          </div>

        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200 mb-6
          ${isDragActive ? 'border-brand-500 bg-brand-500/8 drop-zone-active' : 'border-white/15 hover:border-white/30 bg-surface-900'}
          ${uploading ? 'cursor-not-allowed opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? 'bg-brand-500/20 scale-110' : 'bg-white/5'
            }`}>
            {isDragActive
              ? <Zap size={28} className="text-brand-400" />
              : <Upload size={28} className="text-slate-400" />
            }
          </div>
          <div>
            <p className="font-display font-semibold text-white text-lg mb-1">
              {isDragActive ? 'Drop your video here' : 'Drop video here or click to browse'}
            </p>
            <p className="text-slate-400 text-sm">MP4, MOV, AVI, WebM — max 500MB</p>
          </div>
        </div>
      </div>

      {/* Selected file */}
      {file && !uploading && (
        <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
              <FileVideo size={20} className="text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline info */}
      {!uploading && (
        <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5 mb-6">
          <h3 className="font-display font-semibold text-white mb-4 text-sm">Processing Pipeline</h3>
          <div className="space-y-2">
            {[
              { step: '01', label: 'Extract Audio', sub: 'FFmpeg extracts audio from your video', color: 'text-amber-400' },
              { step: '02', label: 'Transcribe Hindi', sub: 'Groq Whisper converts speech to text', color: 'text-blue-400' },
              { step: '03', label: 'Translate', sub: 'LLaMA 3.3 70B translates to natural English', color: 'text-purple-400' },
              { step: '04', label: 'Generate Voice', sub: 'Google TTS synthesizes English speech', color: 'text-pink-400' },
              { step: '05', label: 'Merge & Export', sub: 'FFmpeg combines dubbed audio with video', color: 'text-emerald-400' },
            ].map(({ step, label, sub, color }) => (
              <div key={step} className="flex items-start gap-3 text-xs">
                <span className={`font-mono font-bold ${color} shrink-0 mt-0.5`}>{step}</span>
                <div>
                  <span className="text-slate-300 font-medium">{label}</span>
                  <span className="text-slate-600 ml-2">— {sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="bg-surface-900 border border-brand-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 size={18} className="text-brand-400 animate-spin" />
            <span className="text-white font-medium text-sm">
              {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload complete, starting pipeline...'}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-accent-purple rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Warnings */}
      {file && !uploading && (
        <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 mb-6">
          <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300 text-xs leading-relaxed">
            Processing time depends on video length. A 5-minute video typically takes 2–4 minutes. Do not close the browser during processing.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary w-full justify-center text-base py-4"
      >
        {uploading ? (
          <><Loader2 size={18} className="animate-spin" /> Processing...</>
        ) : (
          <><Zap size={18} /> Start AI Dubbing</>
        )}
      </button>
    </div>
  );
};

export default UploadPage;
