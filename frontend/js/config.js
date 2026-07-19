/**
 * JP College DMS - Central API & Environment Configuration
 * Handles dynamic API routing for Localhost development and Render / Netlify cloud deployments
 */
window.APP_CONFIG = {
  // Configured Render Backend Server URL (can also be dynamically overridden via Settings page)
  RENDER_BACKEND_URL: localStorage.getItem('jp_dms_backend_url') || 'https://jp-college-dms-backend.onrender.com',

  // Returns the fully qualified API base URL
  getApiBaseUrl() {
    // 1. Check window.VITE_API_URL or process environment variable
    if (window.VITE_API_URL) {
      return window.VITE_API_URL.replace(/\/$/, '') + '/api';
    }

    // 2. Check Localhost / 127.0.0.1 development
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'http://localhost:5000/api';
    }

    // 3. Same-origin (e.g. Render serving static files)
    if (window.location.origin && window.location.origin.includes('onrender.com')) {
      return `${window.location.origin}/api`;
    }

    // 4. Netlify or external frontend domain -> Render backend URL
    const targetUrl = localStorage.getItem('jp_dms_backend_url') || this.RENDER_BACKEND_URL;
    return `${targetUrl.replace(/\/$/, '')}/api`;
  }
};
