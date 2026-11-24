import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Upload, Search, Filter, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, Film, AlertCircle
} from 'lucide-react';
import { useVideoHistory } from '../hooks/useVideo';
import { VideoCard } from '../components/video/VideoCard';
import { VideoStatus } from '../types';
import { videoApi, getApiError } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_FILTERS: { label: string; value: VideoStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Processing', value: 'transcribing' },
  { label: 'Failed', value: 'failed' },
];

const HistoryPage: React.FC = () => {
  const { videos, total, loading, error, refetch } = useVideoHistory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VideoStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const handleRetry = useCallback(async (id: string) => {
    try {
      await videoApi.retry(id);
      toast.success('Processing restarted!');
      refetch();
    } catch (err) {
      toast.error(getApiError(err));
    }
  }, [refetch]);

  const filtered = videos.filter(v => {
    const matchesSearch = !search ||
      v.original_filename.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'transcribing'
        ? !['completed', 'failed', 'uploaded'].includes(v.status)
        : v.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white flex items-center gap-3">
            <History size={28} className="text-brand-400" />
            Video History
          </h1>
          <p className="text-slate-400 mt-1">
            {total} video{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            className="btn-secondary py-2.5 px-4 text-sm"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/upload" className="btn-primary py-2.5 px-5 text-sm">
            <Upload size={15} />
            Upload New
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10 h-10 text-sm"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center bg-surface-900 border border-white/[0.07] rounded-xl p-1 gap-1">
          <Filter size={13} className="text-slate-500 ml-2 shrink-0" />
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setStatusFilter(value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${statusFilter === value
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-brand-400 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading your videos...</p>
          </div>
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 bg-surface-900 border border-white/[0.07] rounded-2xl">
          <Film size={40} className="text-slate-700 mx-auto mb-4" />
          {videos.length === 0 ? (
            <>
              <h3 className="font-display font-semibold text-white text-lg mb-2">No videos yet</h3>
              <p className="text-slate-400 text-sm mb-6">Upload your first Hindi video to start dubbing</p>
              <Link to="/upload" className="btn-primary inline-flex">
                <Upload size={16} /> Upload Video
              </Link>
            </>
          ) : (
            <>
              <h3 className="font-display font-semibold text-white text-lg mb-2">No results found</h3>
              <p className="text-slate-400 text-sm">Try adjusting your search or filter</p>
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="btn-secondary mt-4 inline-flex text-sm"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(v => (
              <VideoCard
                key={v.id}
                video={v}
                onRetry={handleRetry}
                onDelete={async (id) => {
                  if (!window.confirm("Delete this video permanently?")) return;

                  try {
                    await videoApi.delete(id);
                    toast.success("Video deleted successfully");
                    refetch();
                  } catch (err) {
                    toast.error(getApiError(err));
                  }
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-slate-400 text-sm">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="text-slate-600 px-1">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === p
                            ? 'bg-brand-500 text-white shadow'
                            : 'border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
