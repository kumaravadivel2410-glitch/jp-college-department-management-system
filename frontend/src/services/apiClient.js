import axios from 'axios';

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
  if (typeof url === 'string' && url.endsWith('/') && url.length > 1) {
    url = url.slice(0, -1);
  }
  return url;
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jpc_token') || localStorage.getItem('jp_dms_token');
  const role = localStorage.getItem('jpc_user_role') || localStorage.getItem('jp_dms_role');
  const name = localStorage.getItem('jpc_user_name');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (role) {
    config.headers['x-user-role'] = role;
  }
  if (name) {
    config.headers['x-user-name'] = name;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => {
    // Return response.data if present and holds success property, else response
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (!window.location.pathname.includes('/login')) {
        console.warn('Unauthorized request - Token expired or invalid');
      }
    }
    const message = error.response?.data?.message || error.message || 'API Request Failed';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
