import axios from 'axios';

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '/api';
  if (typeof url === 'string' && url.endsWith('/') && url.length > 1) {
    url = url.slice(0, -1);
  }
  return url;
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jpc_token');
    const userRole = localStorage.getItem('jpc_user_role');
    const userName = localStorage.getItem('jpc_user_name');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userRole) {
      config.headers['x-user-role'] = userRole;
    }
    if (userName) {
      config.headers['x-user-name'] = userName;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API Request Failed';
    console.error('[API Error]:', message);
    return Promise.reject(new Error(message));
  }
);

export default API;
