import { useState, useEffect, useCallback, useRef } from 'react';
import { videoApi } from '../services/api';
import { Video, VideoStatus } from '../types';

const POLLING_STATUSES: VideoStatus[] = [
  'uploaded', 'extracting_audio', 'transcribing', 'translating', 'generating_speech', 'merging'
];

export const useVideoStatus = (videoId: string | null, initialVideo?: Video) => {
  const [video, setVideo] = useState<Video | null>(initialVideo || null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!videoId) return;
    try {
      const data = await videoApi.getStatus(videoId);
      setVideo(data);
      if (!POLLING_STATUSES.includes(data.status)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (err: any) {
      setError(err.message);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    fetchStatus();
    if (video && !POLLING_STATUSES.includes(video.status)) return;
    intervalRef.current = setInterval(fetchStatus, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [videoId, fetchStatus]);

  return { video, error, refetch: fetchStatus };
};

export const useVideoHistory = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await videoApi.getHistory();
      setVideos(data.videos);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { videos, total, loading, error, refetch: fetchHistory };
};
