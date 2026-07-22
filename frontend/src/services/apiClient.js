import axios from 'axios';

const getApiBaseUrl = () => {
  const host = window.location.hostname;
  const port = window.location.port;

  if (port === '5000' || window.location.origin.includes(':5000')) {
    return `${window.location.origin.replace(/\/+$/, '')}/api`;
  }
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  if (window.location.origin.includes('onrender.com')) {
    return `${window.location.origin}/api`;
  }
  return '/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jp_dms_token');
  const role = localStorage.getItem('jp_dms_role');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (role) {
    config.headers['x-user-role'] = role;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (!window.location.pathname.includes('/login')) {
        console.warn('Unauthorized request - Token expired');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
