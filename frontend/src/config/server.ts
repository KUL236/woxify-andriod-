import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();

const KEY = 'woxify_server_url';

/** User ka diya hua URL ko clean karke `.../api` format me convert karta hai */
export const normalizeServerUrl = (raw: string): string => {
  let url = raw.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  url = url.replace(/\/+$/, '');
  if (!/\/api$/i.test(url)) url += '/api';
  return url;
};

export const getServerUrl = (): string => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
  } catch { /* ignore */ }
  const env = (import.meta.env.VITE_API_URL as string | undefined) || '';
  if (env) return normalizeServerUrl(env);
  // Web (browser) build: same-origin /api (vite proxy / nginx / netlify)
  return isNative() ? '' : '/api';
};

export const setServerUrl = (raw: string): string => {
  const url = normalizeServerUrl(raw);
  try {
    if (url) localStorage.setItem(KEY, url);
    else localStorage.removeItem(KEY);
  } catch { /* ignore */ }
  return url;
};

export const isServerConfigured = (): boolean => getServerUrl() !== '';

/** Backend ka origin (bina /api ke) */
export const getServerOrigin = (): string => getServerUrl().replace(/\/api$/i, '');
