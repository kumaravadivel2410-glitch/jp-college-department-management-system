/**
 * JP College DMS - Central API & Environment Configuration
 * Connects Netlify Frontend to Render Backend Cloud Database
 */
window.APP_CONFIG = {
  // Production Render Backend URL
  RENDER_BACKEND_URL: localStorage.getItem('jp_dms_backend_url') || 'https://jp-college-department-management-system-1.onrender.com',

  // Returns fully qualified clean API base URL without duplicate /api slashes
  getApiBaseUrl() {
    let baseUrl = '';

    // 1. Environment variable override (e.g. VITE_API_URL)
    if (window.VITE_API_URL) {
      baseUrl = window.VITE_API_URL;
    } else {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || host === '') {
        baseUrl = 'http://localhost:5000';
      } else if (window.location.origin && window.location.origin.includes('onrender.com')) {
        baseUrl = window.location.origin;
      } else {
        baseUrl = localStorage.getItem('jp_dms_backend_url') || this.RENDER_BACKEND_URL;
      }
    }

    // Clean trailing slashes & prevent /api/api duplication
    const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
    if (cleanUrl.endsWith('/api')) {
      return cleanUrl;
    }
    return `${cleanUrl}/api`;
  }
};
