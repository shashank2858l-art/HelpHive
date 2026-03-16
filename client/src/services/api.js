import axios from 'axios';

const getApiBase = () => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  // Ensure it doesn't have a space at the start (already handled by .trim(), but for clarity)
  // Ensure it ends with /api
  if (!url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.replace(/\/+$/, '') + '/api';
  }
  return url;
};

const API_BASE = getApiBase();
console.log('--- HelpHive API Base Configured as:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ngo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
