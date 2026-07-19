/**
 * JP College DMS - Centralized REST API Service Client
 * Connects all CRUD operations directly to backend MongoDB REST endpoints
 */
class ApiService {
  constructor() {
    this.roleKey = 'jp_dms_role';
  }

  // Get current active API Base URL
  getBaseUrl() {
    if (window.APP_CONFIG && typeof window.APP_CONFIG.getApiBaseUrl === 'function') {
      return window.APP_CONFIG.getApiBaseUrl();
    }
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000/api' 
      : 'https://jp-college-department-management-system-1.onrender.com/api';
  }

  // Centralized Request Handler with robust error handling and duplicate path prevention
  async request(endpoint, method = 'GET', body = null) {
    const baseUrl = this.getBaseUrl();
    // Strip leading slashes and leading "api/" to avoid /api/api duplication
    const cleanEndpoint = endpoint.replace(/^\/+/, '').replace(/^api\/+/, '');
    const fullUrl = `${baseUrl}/${cleanEndpoint}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': localStorage.getItem(this.roleKey) || 'Faculty/Admin'
      }
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(fullUrl, options);
      const contentType = response.headers.get('content-type') || '';

      let json = null;
      if (contentType.includes('application/json')) {
        json = await response.json();
      } else {
        await response.text();
        throw new Error('Backend server is currently unavailable. Please try again.');
      }

      if (!response.ok || (json && json.success === false)) {
        const errorMsg = json?.error || json?.message || `HTTP ${response.status} Request Failed`;
        throw new Error(errorMsg);
      }

      return json.data !== undefined ? json.data : json;
    } catch (err) {
      console.error(`API Request Error [${method} ${fullUrl}]:`, err.message);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('non-JSON response') || err.message.includes('HTTP 502') || err.message.includes('HTTP 503')) {
        throw new Error('Server connection failed. Please check your internet connection.');
      }
      throw err;
    }
  }
}

const api = new ApiService();
