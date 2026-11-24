import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getServerUrl, setServerUrl, normalizeServerUrl } from '../config/server';

const ServerSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(getServerUrl().replace(/\/api$/i, ''));
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<'ok' | 'fail' | null>(null);

  const test = async () => {
    const url = normalizeServerUrl(value);
    if (!url) return toast.error('Pehle server URL daalo');
    setTesting(true);
    setResult(null);
    try {
      const res = await axios.get(`${url}/health`, { timeout: 10000 });
      setResult(res.data?.status === 'OK' ? 'ok' : 'fail');
    } catch {
      setResult('fail');
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    const url = setServerUrl(value);
    if (!url) return toast.error('Valid server URL daalo');
    toast.success('Server save ho gaya');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-surface-900 border border-white/[0.07] rounded-2xl p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Server className="text-brand-400" size={22} />
          <h1 className="text-white text-xl font-semibold">Server Settings</h1>
        </div>
        <p className="text-slate-400 text-sm mb-5">
          Apne Woxify backend ka URL daalo (jaise <span className="text-slate-300">https://your-server.com</span> ya
          <span className="text-slate-300"> http://192.168.1.5:5000</span>).
        </p>

        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setResult(null); }}
          placeholder="https://your-backend-url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="url"
          className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-white/10 text-white text-sm outline-none focus:border-brand-500"
        />

        {result === 'ok' && (
          <p className="flex items-center gap-2 text-emerald-400 text-sm mt-3"><CheckCircle2 size={16} /> Server connected ✔</p>
        )}
        {result === 'fail' && (
          <p className="flex items-center gap-2 text-red-400 text-sm mt-3"><XCircle size={16} /> Server tak nahi pahunch paya. URL / internet check karo.</p>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={test} disabled={testing} className="btn-secondary flex-1 justify-center py-3 text-sm">
            {testing ? <Loader2 size={15} className="animate-spin" /> : 'Test Connection'}
          </button>
          <button onClick={save} className="btn-primary flex-1 justify-center py-3 text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ServerSettingsPage;
