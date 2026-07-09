import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 120000,
});

// Add request interceptor for loading states
API.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout - the analysis is taking longer than expected'));
    }
    return Promise.reject(error);
  }
);

export const analyzeCompany = (company, includeLiveData = true) => {
  return API.post('/api/research', {
    company: company.trim(),
    includeLiveData,
  });
};

export default API;