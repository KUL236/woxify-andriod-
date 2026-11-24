import { openDownload } from '../../utils/download';
import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import {
  Download,
  Eye,
  RefreshCw,
  FileVideo,
  Clock,
  Trash2
} from 'lucide-react';

import toast from 'react-hot-toast';
import { getApiError } from '../../services/api';
import { videoApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  video: Video;
  onRetry?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const VideoCard: React.FC<Props> = ({ video, onRetry, onDelete }) => {
  return (
    <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <FileVideo size={18} className="text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate" title={video.original_filename}>
            {video.original_filename}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
            <Clock size={11} />
            <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        <StatusBadge status={video.status} size="sm" />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <div className="text-slate-500 mb-0.5">Duration</div>
          <div className="text-slate-300 font-medium">{formatDuration(video.duration)}</div>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <div className="text-slate-500 mb-0.5">Size</div>
          <div className="text-slate-300 font-medium">{formatFileSize(video.file_size)}</div>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <div className="text-slate-500 mb-0.5">Source</div>
          <div className="text-slate-300 font-medium uppercase">{video.source_language}</div>
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2">
          <div className="text-slate-500 mb-0.5">Target</div>
          <div className="text-slate-300 font-medium uppercase">{video.target_language}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          to={`/video/${video.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/[0.07] transition-all"
        >
          <Eye size={13} /> View Details
        </Link>
        {video.status === 'completed' && video.has_translated_video && (
          <a
            href={videoApi.getDownloadUrl(video.id)}
            onClick={(e) => { e.preventDefault(); openDownload(videoApi.getDownloadUrl(video.id)); }}
            className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
          >
            <Download size={13} /> Download
          </a>
        )}
        {video.status === 'failed' && onRetry && (
          <button
            onClick={() => onRetry(video.id)}
            className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
          >
            <RefreshCw size={13} /> Retry
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(video.id)}
            className="flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
};
