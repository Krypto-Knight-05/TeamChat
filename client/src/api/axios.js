import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5555',
});

// Inject JWT on every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('tc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
