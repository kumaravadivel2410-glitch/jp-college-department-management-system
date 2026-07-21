/**
 * JP College ERP - Centralized REST API Service Client
 * Attaches JWT Bearer authentication headers to all backend API requests
 */
class ApiService {
  constructor() {
    this.roleKey = 'jp_dms_role';
    this.tokenKey = 'jp_dms_token';
  }

  getBaseUrl() {
    if (window.APP_CONFIG && typeof window.APP_CONFIG.getApiBaseUrl === 'function') {
      return window.APP_CONFIG.getApiBaseUrl();
    }
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000/api' 
      : 'https://jp-college-department-management-system-1.onrender.com/api';
  }

  async request(endpoint, method = 'GET', body = null) {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/^api\/+/, '');
    const fullUrl = `${baseUrl}/${cleanEndpoint}`;
    const token = localStorage.getItem(this.tokenKey);

    const headers = {
      'Content-Type': 'application/json',
      'x-user-role': localStorage.getItem(this.roleKey) || 'admin'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      console.log(`[API Request] ${method} ${fullUrl}`);
      const response = await fetch(fullUrl, options);
      const contentType = response.headers.get('content-type') || '';

      let json = null;
      if (contentType.includes('application/json')) {
        json = await response.json();
      } else {
        const text = await response.text();
        console.error(`[API Non-JSON Response] ${method} ${fullUrl}:`, text);
        throw new Error('Backend server returned non-JSON response.');
      }

      console.log(`[API Response] ${method} ${fullUrl} [Status ${response.status}]:`, json);

      if (response.status === 401 || response.status === 403) {
        if (cleanEndpoint.startsWith('auth/login')) {
          throw new Error(json?.message || json?.error || 'Invalid credentials');
        }
      }

      if (!response.ok || (json && json.success === false)) {
        const errorMsg = json?.message || json?.error || `HTTP ${response.status} Request Failed`;
        throw new Error(errorMsg);
      }

      return json?.data !== undefined ? json.data : json;
    } catch (err) {
      console.error(`[API Error] ${method} ${fullUrl}:`, err.message);
      throw err;
    }
  }
}

const api = new ApiService();
