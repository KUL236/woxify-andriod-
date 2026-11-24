import axios, { AxiosInstance, AxiosError } from 'axios';
import { Video, HistoryResponse, UploadResponse } from '../types';
import { getServerUrl, isNative } from '../config/server';

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getServerUrl(),
    timeout: 300000, // 5 minutes for large uploads
  });

  instance.interceptors.request.use((config) => {
    // Server URL runtime me change ho sakta hai (Settings page)
    config.baseURL = getServerUrl();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError<{ error: string }>) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (isNative()) window.location.hash = '#/login';
        else window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createAxiosInstance();

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }).then(r => r.data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  getProfile: () =>
    api.get('/auth/me').then(r => r.data),
};

export const videoApi = {
  upload: (file: File, sourceLanguage = 'hi', targetLanguage = 'en', speed = 1.0, quality = '1080p', onProgress?: (pct: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('source_language', sourceLanguage);
    formData.append('target_language', targetLanguage);
    formData.append('speed', speed.toString());
    formData.append('quality', quality);

    return api.post('/video/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    }).then(r => r.data);
  },

  getStatus: (id: string): Promise<Video> =>
    api.get(`/video/status/${id}`).then(r => r.data),

  getHistory: (limit = 20, offset = 0): Promise<HistoryResponse> =>
    api.get('/video/history', { params: { limit, offset } }).then(r => r.data),

  getDownloadUrl: (id: string) => `${getServerUrl()}/video/download/${id}`,

  retry: (id: string) =>
    api.post(`/video/retry/${id}`).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/video/${id}`).then(r => r.data),
};

export const getApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'Request failed';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};
