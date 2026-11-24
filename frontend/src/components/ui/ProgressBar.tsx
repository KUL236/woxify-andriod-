import React from 'react';

interface Props {
  value: number; // 0–100
  label?: string;
  color?: 'brand' | 'emerald' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const COLOR_MAP = {
  brand: 'from-brand-500 to-accent-purple',
  emerald: 'from-emerald-500 to-teal-400',
  amber: 'from-amber-500 to-orange-400',
  red: 'from-red-500 to-rose-400',
};

const SIZE_MAP = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<Props> = ({
  value,
  label,
  color = 'brand',
  size = 'md',
  showLabel = false,
  animated = false,
}) => {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showLabel && <span className="text-xs text-slate-400 font-mono">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${SIZE_MAP[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${COLOR_MAP[color]} rounded-full transition-all duration-500 ease-out ${
            animated && pct > 0 && pct < 100 ? 'progress-pulse' : ''
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
