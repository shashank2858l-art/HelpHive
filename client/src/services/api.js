import axios from 'axios';

const getApiBase = () => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/^\s+|\s+$/g, '');
  
  // Extra safety: strip everything before the first 'http' in case of weird invisible prefix
  const httpIdx = url.indexOf('http');
  if (httpIdx > 0) url = url.substring(httpIdx);

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
