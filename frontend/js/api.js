/**
 * JP College DMS - Pure MongoDB REST API Service Client
 * Directly connects all CRUD operations to backend MongoDB REST endpoints
 */
class ApiService {
  constructor() {
    this.baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5000/api' 
      : '/api';
  }

  // Universal API Request Wrapper connecting directly to Express / MongoDB backend
  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': localStorage.getItem('jp_dms_role') || 'Faculty/Admin'
      }
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, options);
      const json = await response.json();

      if (!response.ok || (json.success === false)) {
        throw new Error(json.error || json.message || `API HTTP ${response.status} Error`);
      }

      return json.data !== undefined ? json.data : json;
    } catch (err) {
      console.error(`API Request Error [${method} /api/${endpoint}]:`, err.message);
      throw err;
    }
  }
}

const api = new ApiService();
