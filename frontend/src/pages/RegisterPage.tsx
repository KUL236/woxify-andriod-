import { isNative } from '../config/server';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Wand2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi, getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(form.name, form.email, form.password);
      login(data.token, data.user);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof form) =>
    ({ value: form[name], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [name]: e.target.value })) });

  return (
    <div className="min-h-screen flex bg-surface-950">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-surface-900 to-surface-950 items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-accent-purple/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple to-brand-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Wand2 size={28} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white mb-4">Start Dubbing Today</h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Create your free account and transform your Hindi videos into professional English dubs in minutes.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create account</h1>
          <p className="text-slate-400 mb-8">Get started with AI video dubbing for free</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" required placeholder="John Doe" className="input-field pl-11" {...field('name')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required placeholder="you@example.com" className="input-field pl-11" {...field('email')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  className="input-field pl-11 pr-11"
                  {...field('password')}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="Repeat password" className="input-field pl-11" {...field('confirm')} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
          {isNative() && (
            <p className="text-center mt-4">
              <Link to="/server" className="text-slate-500 hover:text-slate-300 text-xs">⚙ Server Settings</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
