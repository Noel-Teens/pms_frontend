import axios from 'axios';

// Simple in-memory cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create axios instance with base URL
export const api = axios.create({
  baseURL: 'http://localhost:8000',  // https://neurostack-in-pms-server.hf.space
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Cache helper functions
const getCacheKey = (config) => `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
const isCacheable = (config) => config.method?.toLowerCase() === 'get';
const isStale = (timestamp) => Date.now() - timestamp > CACHE_DURATION;

// Add request interceptor to include auth token and handle caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');

    // endpoints that must stay public
    const publicEndpoints = [
      '/auth/login/',
      '/auth/register/',
      '/auth/google/',
      '/admin_app/verify-invite/',
      '/admin_app/accept-invite/'
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check cache for GET requests
    if (isCacheable(config)) {
      const cacheKey = getCacheKey(config);
      const cached = cache.get(cacheKey);
      
      if (cached && !isStale(cached.timestamp)) {
        // Return cached response
        config.adapter = () => Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: cached.headers || {},
          config,
          request: {}
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (isCacheable(response.config) && response.status === 200) {
      const cacheKey = getCacheKey(response.config);
      cache.set(cacheKey, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    // Clear cache on auth errors
    if (error.response?.status === 401) {
      cache.clear();
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
    return Promise.reject(error);
  }
);

// Cache management utilities
export const clearCache = () => cache.clear();
export const clearCachePattern = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/me/'),
  googleLogin: (idToken) => api.post('/auth/google/', { id_token: idToken }),
};

// Admin API - Optimized with selective caching
export const adminAPI = {
  getUsers: () => api.get('/admin_app/users/'),
  createUser: (userData) => {
    clearCachePattern('/admin_app/users');
    return api.post('/admin_app/createusers/', userData);
  },
  updateUserStatus: (username, status) => {
    clearCachePattern('/admin_app/users');
    return api.patch(`/admin_app/updateusers/${username}/status/`, { status });
  },
  assignPaperwork: (paperworkData) => {
    clearCachePattern('/api/paperworks');
    return api.post('/admin_app/paperworks/', paperworkData);
  },
  updatePaperworkDeadline: (id, deadline) => {
    clearCachePattern('/api/paperworks');
    return api.patch(`/admin_app/paperworks/${id}/deadline/`, { deadline });
  },
  reviewPaperwork: (id, reviewData) => {
    clearCachePattern('/api/paperworks');
    return api.post(`/api/paperworks/${id}/review/`, reviewData);
  },
  getPaperworkById: (id) => api.get(`/api/paperworks/${id}/`),
  getPaperworkVersions: (id) => api.get(`/api/paperworks/${id}/versions/`),
  // Invitation system
  inviteUser: (inviteData) => {
    clearCachePattern('/admin_app/users');
    clearCachePattern('/admin_app/pending-invitations');
    return api.post('/admin_app/invite/', inviteData);
  },
  retryInvite: (token) => {
    clearCachePattern('/admin_app/pending-invitations');
    return api.post(`/admin_app/retry-invite/${token}/`);
  },
  getPendingInvitations: () => api.get('/admin_app/pending-invitations/'),
  verifyInvite: (token) => api.get(`/admin_app/verify-invite/${token}/`),
  acceptInvite: (token, userData) => api.post(`/admin_app/accept-invite/${token}/`, userData),
};

// Paperworks API - Optimized
export const paperworksAPI = {
  getAllPaperworks: () => api.get('/api/paperworks/'),
  getPaperworkById: (id) => api.get(`/api/paperworks/${id}/`),
  createPaperwork: (formData) => {
    clearCachePattern('/api/paperworks');
    return api.post('/api/paperworks/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, // 30 second timeout for file uploads
    });
  },
  submitVersion: (id, formData) => {
    clearCachePattern('/api/paperworks');
    return api.post(`/api/paperworks/${id}/versions/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },
  getVersions: (id) => api.get(`/api/paperworks/${id}/versions/`),
  getVersionDetails: (id, versionId) => api.get(`/api/paperworks/${id}/versions/${versionId}/`),
  getReviews: (id) => api.get(`/api/paperworks/${id}/reviews/`),
  downloadFile: (url) =>
    api.get(url, {
      responseType: 'blob',
      headers: { Accept: 'application/octet-stream' },
      timeout: 60000, // 1 minute for downloads
    }),
};

// Reports API
export const reportsAPI = {
  getSummary: () => api.get('/api/stats/admin/'),
  exportCSV: () => api.get('/api/reports/export-csv/', { 
    responseType: 'blob',
    timeout: 30000
  }),
};

// Researcher stats API
export const researcherStatsAPI = {
  getSummary: () => api.get('/api/stats/researcher/')
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications/'),
  markAsRead: (notificationId) => {
    clearCachePattern('/api/notifications');
    return api.post(`/api/notifications/${notificationId}/read/`);
  }
};

export default api;