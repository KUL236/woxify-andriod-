import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

export const LoadingSpinner: React.FC<Props> = ({
  size = 'md',
  color = 'border-brand-500',
  className = '',
}) => (
  <div
    className={`${SIZE_MAP[size]} ${color} border-t-transparent rounded-full animate-spin ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export const FullPageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-950 z-50 gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-slate-400 text-sm animate-pulse">{message}</p>
  </div>
);
