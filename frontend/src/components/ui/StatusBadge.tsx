import React from 'react';
import { VideoStatus } from '../../types';
import { CheckCircle2, XCircle, Clock, Loader2, Zap } from 'lucide-react';

const STATUS_CONFIG: Record<VideoStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  uploaded: { label: 'Queued', color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/20', icon: <Clock size={12} /> },
  extracting_audio: { label: 'Extracting Audio', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/20', icon: <Loader2 size={12} className="animate-spin" /> },
  transcribing: { label: 'Transcribing', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/20', icon: <Loader2 size={12} className="animate-spin" /> },
  translating: { label: 'Translating', color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/20', icon: <Loader2 size={12} className="animate-spin" /> },
  generating_speech: { label: 'Generating Voice', color: 'text-pink-400', bg: 'bg-pink-500/15 border-pink-500/20', icon: <Loader2 size={12} className="animate-spin" /> },
  merging: { label: 'Merging Video', color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/20', icon: <Zap size={12} className="animate-pulse" /> },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/20', icon: <XCircle size={12} /> },
};

interface Props {
  status: VideoStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.uploaded;
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${config.color} ${config.bg} ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'}`}>
      {config.icon}
      {config.label}
    </span>
  );
};
