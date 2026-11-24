import { openDownload } from '../../utils/download';
import React, { useRef, useState } from 'react';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';

interface Props {
  src: string;
  filename?: string;
  downloadUrl?: string;
  className?: string;
}

export const VideoPreview: React.FC<Props> = ({ src, filename, downloadUrl, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(p => !p);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(m => !m);
  };

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    setProgress(duration ? (currentTime / duration) * 100 : 0);
  };

  const onEnded = () => setPlaying(false);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  return (
    <div className={`bg-surface-950 rounded-2xl overflow-hidden border border-white/[0.08] ${className}`}>
      {/* Video */}
      <div className="relative group aspect-video bg-black">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={toggle}
        >
          {!playing && (
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
              <Play size={22} className="text-white ml-1" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 space-y-2">
        {/* Seek bar */}
        <div
          className="h-1.5 bg-white/10 rounded-full cursor-pointer group/seek"
          onClick={seek}
        >
          <div
            className="h-full bg-brand-500 rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity -translate-x-1/2" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <div className="flex-1 truncate">
            <p className="text-xs text-slate-500 truncate">{filename || 'Translated video'}</p>
          </div>
          {downloadUrl && (
            <a
              href={downloadUrl}
              onClick={(e) => { e.preventDefault(); openDownload(downloadUrl); }}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium transition-colors border border-emerald-500/20"
            >
              <Download size={12} /> Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
