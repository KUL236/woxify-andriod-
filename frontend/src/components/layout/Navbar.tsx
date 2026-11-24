import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from "../../assets/logo.svg";

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/');
    setOpen(false);
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 lg:px-12 transition-all duration-200 ${scrolled ? 'bg-surface-950/90 backdrop-blur-xl border-b border-white/[0.06]' : ''
      }`}>
      <Link
        to="/"
        className="flex items-center gap-3 flex-shrink-0 group"
      >
        <img
          src={Logo}
          alt="Woxify"
          className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
        />

        <span
          className="
      font-display
      text-2xl
      font-extrabold
      tracking-tight
      bg-gradient-to-r
      from-[#ff6ad5]
      via-[#8b5cff]
      to-[#22d3ee]
      bg-clip-text
      text-transparent
    "
        >
          Woxify
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="ml-auto hidden sm:flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium transition-colors px-3 py-2">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary py-2 px-4 text-sm"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition-colors px-3 py-2">
              <LogIn size={15} /> Sign In
            </Link>
            <Link to="/register" className="btn-primary py-2 px-4 text-sm">
              <UserPlus size={15} /> Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="ml-auto sm:hidden text-slate-400 hover:text-white" onClick={() => setOpen(p => !p)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 inset-x-0 bg-surface-900/95 backdrop-blur-xl border-b border-white/[0.07] p-4 flex flex-col gap-2 sm:hidden">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm text-left">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm">
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary justify-center text-sm">
                <UserPlus size={15} /> Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
