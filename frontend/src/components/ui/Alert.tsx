import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type Variant = 'success' | 'error' | 'warning' | 'info';

interface Props {
  variant: Variant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const CONFIG: Record<Variant, { icon: React.ReactNode; bg: string; border: string; title: string; text: string }> = {
  success: {
    icon: <CheckCircle2 size={16} />,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    title: 'text-emerald-300',
    text: 'text-emerald-400/80',
  },
  error: {
    icon: <XCircle size={16} />,
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    title: 'text-red-300',
    text: 'text-red-400/80',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    title: 'text-amber-300',
    text: 'text-amber-400/80',
  },
  info: {
    icon: <Info size={16} />,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/25',
    title: 'text-blue-300',
    text: 'text-blue-400/80',
  },
};

export const Alert: React.FC<Props> = ({ variant, title, message, onDismiss, className = '' }) => {
  const c = CONFIG[variant];
  return (
    <div className={`flex items-start gap-3 ${c.bg} border ${c.border} rounded-xl p-4 ${className}`}>
      <span className={`${c.title} shrink-0 mt-0.5`}>{c.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${c.title} mb-0.5`}>{title}</p>}
        <p className={`text-xs leading-relaxed ${c.text}`}>{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className={`${c.title} opacity-60 hover:opacity-100 transition-opacity shrink-0`}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};
