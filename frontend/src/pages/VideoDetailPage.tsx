import { openDownload } from '../utils/download';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, RefreshCw, FileText, Languages,
  Loader2, AlertCircle, CheckCircle2, Copy
} from 'lucide-react';
import { useVideoStatus } from '../hooks/useVideo';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ProcessingTimeline } from '../components/video/ProcessingTimeline';
import { videoApi, getApiError } from '../services/api';
import toast from 'react-hot-toast';

const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { video, error } = useVideoStatus(id || null);

  const handleRetry = async () => {
    if (!id) return;
    try {
      await videoApi.retry(id);
      toast.success('Retry started!');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (error) return (
    <div className="text-center py-16">
      <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
      <p className="text-red-400 font-medium">{error}</p>
      <Link to="/history" className="btn-secondary mt-4 inline-flex">Back to History</Link>
    </div>
  );

  if (!video) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-brand-400" />
    </div>
  );

  const isProcessing = !['completed', 'failed'].includes(video.status);
  const progressMap = {
    uploaded: 5,
    extracting_audio: 20,
    transcribing: 40,
    translating: 60,
    generating_speech: 80,
    merging: 95,
    completed: 100,
    failed: 100,
  };

  const progress =
    progressMap[video.status as keyof typeof progressMap] || 0;
  const etaMap = {
    uploaded: "3-5 min",
    extracting_audio: "2-4 min",
    transcribing: "1-3 min",
    translating: "30-60 sec",
    generating_speech: "30-60 sec",
    merging: "10-30 sec",
    completed: "Completed",
    failed: "--",
  };

  const eta =
    etaMap[video.status as keyof typeof etaMap];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back + header */}
      <div>
        <Link to="/history" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-4">
          <ArrowLeft size={16} /> Back to History
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white break-all">{video.original_filename}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StatusBadge status={video.status} />
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-xs text-brand-400 animate-pulse">
                  <Loader2 size={11} className="animate-spin" /> Auto-refreshing...
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {video.status === 'completed' && video.has_translated_video && (
              <a
                href={videoApi.getDownloadUrl(video.id)}
                onClick={(e) => { e.preventDefault(); openDownload(videoApi.getDownloadUrl(video.id)); }}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Download size={16} /> Download Dubbed Video
              </a>
            )}
            {video.status === 'failed' && (
              <button onClick={handleRetry} className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all">
                <RefreshCw size={16} /> Retry
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Overall Progress */}

      <div className="flex justify-between mt-4 text-xs">

        <span className="text-slate-400">

          Estimated Time

        </span>

        <span className="text-brand-300 font-medium">

          {eta}

        </span>

      </div>

      <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-6">

        <div className="flex justify-between mb-3">

          <span className="text-white font-semibold">

            Overall Progress

          </span>

          <span className="text-brand-400 font-bold">

            {progress}%

          </span>

        </div>

        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">

          <div

            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-700"

            style={{ width: `${progress}%` }}

          />

        </div>

      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Processing timeline */}
        <div>
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center">
              <Loader2 size={12} className="text-brand-400" />
            </div>
            Processing Pipeline
          </h2>
          <ProcessingTimeline currentStatus={video.status} processingSteps={video.processing_steps} />
          {isProcessing && (

            <div className="mt-4 rounded-xl bg-brand-500/10 border border-brand-500/20 p-4">

              <p className="text-xs text-brand-300 uppercase mb-1">

                Current Step

              </p>

              <p className="text-white font-semibold">

                {video.status.replace(/_/g, " ")}

              </p>

            </div>

          )}

          {video.status === 'completed' && (
            <div className="mt-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 font-medium text-sm">Dubbing Complete!</p>
                <p className="text-emerald-400/60 text-xs mt-0.5">Your dubbed video is ready to download.</p>
              </div>
            </div>
          )}
          <div className="mt-5 bg-surface-900 border border-white/[0.07] rounded-2xl p-4">

            <h3 className="text-white font-semibold mb-3">

              🎥 Video Preview

            </h3>

            <video

              controls

              className="rounded-xl w-full"

              src={videoApi.getDownloadUrl(video.id)}

            >

            </video>

          </div>

          {video.status === 'failed' && video.error_message && (
            <div className="mt-4 bg-red-500/8 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium text-sm">Processing Failed</p>
                <p className="text-red-400/70 text-xs mt-1 break-words">{video.error_message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Transcript & Translation */}
        <div className="space-y-5">
          {video.transcript && (
            <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <FileText size={14} className="text-blue-400" /> Hindi Transcript
                </h3>
                <button
                  onClick={() => copyToClipboard(video.transcript!, 'Transcript')}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Copy size={13} />
                </button>
              </div>
              <div className="bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed">{video.transcript}</p>
              </div>
            </div>
          )}

          {video.translated_text && (
            <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <Languages size={14} className="text-purple-400" /> English Translation
                </h3>
                <button
                  onClick={() => copyToClipboard(video.translated_text!, 'Translation')}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Copy size={13} />
                </button>
              </div>
              <div className="bg-white/5 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed">{video.translated_text}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5">
            <h3 className="font-display font-semibold text-white text-sm mb-3">Video Details</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Video ID', val: video.id.slice(0, 8) + '...' },
                { label: 'Source Language', val: video.source_language?.toUpperCase() },
                { label: 'Target Language', val: video.target_language?.toUpperCase() },
                { label: 'Duration', val: video.duration ? `${Math.floor(video.duration / 60)}m ${Math.floor(video.duration % 60)}s` : '—' },
                { label: 'File Size', val: video.file_size ? `${(video.file_size / (1024 * 1024)).toFixed(1)} MB` : '—' },
                { label: 'Created', val: new Date(video.created_at).toLocaleString() },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-300 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;
