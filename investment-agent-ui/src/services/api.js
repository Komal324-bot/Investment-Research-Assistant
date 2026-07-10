import axios from 'axios';

const TOKEN_KEY = 'ira_token';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 120000,
});

// Add request interceptor for loading states + JWT attachment
API.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = 'application/json';
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
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
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      // Session expired or token invalid - notify AuthContext to clear state.
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginRequest = (username, password) => {
  return API.post('/auth/login', { username, password });
};

export const registerRequest = (username, password) => {
  return API.post('/auth/register', { username, password });
};

export const analyzeCompany = (company, includeLiveData = true) => {
  return API.post('/api/research', {
    company: company.trim(),
    includeLiveData,
  });
};

export const getChart = (company, interval = '1day', outputsize = '30') => {
  return API.get('/api/chart', {
    params: { company: company.trim(), interval, outputsize },
  });
};

export const getNews = (company) => {
  return API.get('/api/news', {
    params: { company: company.trim() },
  });
};

export default API;