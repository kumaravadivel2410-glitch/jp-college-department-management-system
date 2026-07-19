/**
 * JP College DMS - Centralized REST API Service Client
 * Connects all CRUD operations directly to configured backend REST endpoints
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
      : '/api';
  }

  // Centralized Request Handler with robust error & HTML response handling
  async request(endpoint, method = 'GET', body = null) {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.replace(/^\//, '');
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
        const textOutput = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${textOutput.slice(0, 100)}`);
      }

      if (!response.ok || (json && json.success === false)) {
        const errorMsg = json?.error || json?.message || `HTTP ${response.status} Request Failed`;
        throw new Error(errorMsg);
      }

      return json.data !== undefined ? json.data : json;
    } catch (err) {
      console.error(`API Request Error [${method} ${fullUrl}]:`, err.message);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error(`Unable to connect to backend server (${baseUrl}). Please verify the backend server is running and CORS is enabled.`);
      }
      throw err;
    }
  }
}

const api = new ApiService();
