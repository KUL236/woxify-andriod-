import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface Action {
  label: string;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: Action[];
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description, actions }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-surface-900 border border-white/[0.07] rounded-2xl">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
      <Icon size={28} className="text-slate-600" />
    </div>
    <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
    {description && <p className="text-slate-400 text-sm mb-6 max-w-sm">{description}</p>}
    {actions && actions.length > 0 && (
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {actions.map(({ label, to, onClick, variant = 'primary' }) =>
          to ? (
            <Link
              key={label}
              to={to}
              className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
            >
              {label}
            </Link>
          ) : (
            <button
              key={label}
              onClick={onClick}
              className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
            >
              {label}
            </button>
          )
        )}
      </div>
    )}
  </div>
);
