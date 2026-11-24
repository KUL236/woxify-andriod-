import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, History, CheckCircle2, Clock, XCircle, Film, ArrowRight, Loader2 } from 'lucide-react';
import { useVideoHistory } from '../hooks/useVideo';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/video/VideoCard';
import { videoApi, getApiError } from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { videos, total, loading, refetch } = useVideoHistory();

  const stats = {
    total: videos.length,
    completed: videos.filter(v => v.status === 'completed').length,
    processing: videos.filter(v => !['completed', 'failed'].includes(v.status)).length,
    failed: videos.filter(v => v.status === 'failed').length,
  };

  const handleRetry = async (id: string) => {
    try {
      await videoApi.retry(id);
      toast.success('Retry started!');
      refetch();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-400 mt-1">Manage your AI video dubbing projects</p>
      </div>

      {/* Quick action */}
      <Link
        to="/upload"
        className="flex items-center gap-4 p-5 bg-gradient-to-r from-brand-500/20 to-accent-purple/10 border border-brand-500/25 rounded-2xl hover:border-brand-500/40 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <Upload size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-display font-semibold text-white">Upload New Video</div>
          <div className="text-sm text-slate-400">Drag & drop a Hindi MP4 or MOV file to start dubbing</div>
        </div>
        <ArrowRight size={18} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Videos', value: total, icon: Film, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Processing', value: stats.processing, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-surface-900 border border-white/[0.07] rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="font-display font-bold text-2xl text-white">{loading ? '—' : value}</div>
            <div className="text-slate-500 text-sm mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-xl text-white">Recent Videos</h2>
          <Link to="/history" className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors">
            <History size={14} /> View all
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-400" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 bg-surface-900 border border-white/[0.07] rounded-2xl">
            <Film size={36} className="text-slate-700 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-white mb-2">No videos yet</h3>
            <p className="text-slate-400 text-sm mb-5">Upload your first Hindi video to get started</p>
            <Link to="/upload" className="btn-primary inline-flex">
              <Upload size={16} /> Upload Video
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.slice(0, 6).map(v => (
              <VideoCard key={v.id} video={v} onRetry={handleRetry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
