import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, X, CheckCircle2, Zap } from 'lucide-react';

interface Props {
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
}

const MAX_SIZE = 500 * 1024 * 1024;
const ACCEPTED = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm'],
};

const fmt = (b: number) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

export const UploadCard: React.FC<Props> = ({ file, onFile, disabled }) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: disabled || !!file,
  });

  const rejection = fileRejections[0]?.errors[0];

  if (file) {
    return (
      <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <FileVideo size={22} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{file.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{fmt(file.size)}</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-400" />
          {!disabled && (
            <button
              onClick={() => onFile(null)}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-brand-500 bg-brand-500/8 scale-[1.01]'
            : 'border-white/15 hover:border-white/30 bg-surface-900 hover:bg-surface-900/80'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            isDragActive ? 'bg-brand-500/20' : 'bg-white/5'
          }`}>
            {isDragActive
              ? <Zap size={24} className="text-brand-400 animate-pulse" />
              : <Upload size={24} className="text-slate-500" />
            }
          </div>
          <div>
            <p className="font-semibold text-white mb-1">
              {isDragActive ? 'Drop your video here!' : 'Drag & drop video here'}
            </p>
            <p className="text-slate-500 text-sm">or <span className="text-brand-400 underline">browse files</span></p>
          </div>
          <p className="text-slate-600 text-xs mt-1">MP4 · MOV · AVI · WebM — max 500MB</p>
        </div>
      </div>
      {rejection && (
        <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
          <span>⚠</span>
          {rejection.code === 'file-too-large'
            ? 'File too large (max 500MB)'
            : rejection.code === 'file-invalid-type'
            ? 'Invalid type — use MP4, MOV, AVI, or WebM'
            : rejection.message}
        </p>
      )}
    </div>
  );
};
