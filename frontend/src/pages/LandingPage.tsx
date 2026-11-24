import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Zap, Globe, Shield, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Logo from "../assets/logo.svg";

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Powered by Groq Whisper & LLaMA 3.3 70B for near-instant transcription and translation.' },
  { icon: Globe, title: 'Natural Dubbing', desc: 'Free Google TTS voices deliver clear English dubbing that preserves emotion and tone.' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT authentication, encrypted storage, and your videos are never shared.' },
];

const steps = [
  { n: '01', title: 'Upload Your Video', desc: 'Drag & drop any Hindi MP4 or MOV file up to 500MB.' },
  { n: '02', title: 'AI Transcribes', desc: 'Groq Whisper accurately converts Hindi speech to text.' },
  { n: '03', title: 'AI Translates', desc: 'LLaMA 3.3 70B translates with preserved meaning and emotion.' },
  { n: '04', title: 'Voice Generated', desc: 'Google TTS creates English audio from the translation.' },
  { n: '05', title: 'Download Result', desc: 'Get your fully dubbed English video instantly.' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 lg:px-12 border-b border-white/[0.06] bg-surface-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
            <Wand2 size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">AI Video Translator</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-purple/10 rounded-full blur-[100px]" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <Zap size={12} />
            <span>🌍 AI Video Translation • 50+ Languages • HD Export</span>
          </div>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={Logo}
              alt="Woxify"
              className="w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-300 hover:scale-110"
            />
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6">

            <span
              className="
      bg-gradient-to-r
      from-[#ff6ad5]
      via-[#8b5cff]
      to-[#22d3ee]
      bg-clip-text
      text-transparent
    "
            >
              WOXIFY
            </span>

            <br />

            <span className="gradient-text">
              Videos into 50+ Languages
            </span>

          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any video, choose from 50+ languages, select your preferred AI voice, speed and quality, and download a professionally translated video in minutes.
            AI-powered transcription, translation, and voice synthesis — all in one pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-brand-500/25 text-base group"
            >
              Start Dubbing Free
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl transition-all duration-200 text-base"
            >
              <Play size={16} className="text-brand-400" />
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
            {[
              { v: '< 5min', l: 'Per video' },
              { v: '99%', l: 'Accuracy' },
              { v: '500MB', l: 'Max size' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="font-display font-bold text-2xl text-white">{v}</div>
                <div className="text-slate-500 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg">Professional dubbing powered by cutting-edge AI models</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-surface-900 border border-white/[0.07] rounded-2xl p-8 hover:border-brand-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-5 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={22} className="text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 lg:px-12 bg-surface-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">5-step AI pipeline from Hindi to English dubbing</p>
          </div>
          <div className="space-y-4">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="flex items-start gap-5 bg-surface-900 border border-white/[0.06] rounded-2xl p-6">
                <div className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                  {n}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-white mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <CheckCircle2 size={18} className="text-accent-emerald shrink-0 mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-4xl mb-5">Ready to Dub Your First Video?</h2>
          <p className="text-slate-400 text-lg mb-8">Join thousands of creators dubbing content with AI</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-brand-500/25 text-base"
          >
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wand2 size={14} className="text-brand-400" />
          <span className="text-white font-medium">AI Video Translator</span>
        </div>
        <p>© {new Date().getFullYear()} — Powered by KV</p>
      </footer>
    </div>
  );
};

export default LandingPage;
