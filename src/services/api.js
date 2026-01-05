import axios from 'axios';

const api = axios.create({
  baseURL: 'https://aelvix-ai-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // TODO: storing token in localStorage is standard for this scope
    // Modify this if a different auth mechanism is intended
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Assuming Bearer token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
