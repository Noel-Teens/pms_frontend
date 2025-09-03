import axios from 'axios';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: 'https://noel-14-pms-server.hf.space', // Backend server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');

    // endpoints that must stay public
    const publicEndpoints = [
      '/auth/login/',
      '/auth/register/',
      '/auth/google/',
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/me/'),
  googleLogin: (idToken) => api.post('/auth/google/', { id_token: idToken }),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin_app/users/'),
  createUser: (userData) => api.post('/admin_app/createusers/', userData),
  updateUserStatus: (username, status) => api.patch(`/admin_app/updateusers/${username}/status/`, { status }),
  assignPaperwork: (paperworkData) => api.post('/admin_app/paperworks/', paperworkData),
  updatePaperworkDeadline: (id, deadline) => api.patch(`/admin_app/paperworks/${id}/deadline/`, { deadline }),
  reviewPaperwork: (id, reviewData) => api.post(`/api/paperworks/${id}/review/`, reviewData),
  getPaperworkById: (id) => api.get(`/api/paperworks/${id}/`),
  getPaperworkVersions: (id) => api.get(`/api/paperworks/${id}/versions/`),
};

// Paperworks API
export const paperworksAPI = {
  getAllPaperworks: () => api.get('/api/paperworks/'),
  getPaperworkById: (id) => api.get(`/api/paperworks/${id}/`),
  createPaperwork: (formData) =>
    api.post('/api/paperworks/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submitVersion: (id, formData) =>
    api.post(`/api/paperworks/${id}/versions/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getVersions: (id) => api.get(`/api/paperworks/${id}/versions/`),
  getVersionDetails: (id, versionId) =>
    api.get(`/api/paperworks/${id}/versions/${versionId}/`),
  getReviews: (id) => api.get(`/api/paperworks/${id}/reviews/`), // ✅ NEW
  downloadFile: (url) =>
    api.get(url, {
      responseType: 'blob',
      headers: { Accept: 'application/octet-stream' },
    }),
};


// Reports API
export const reportsAPI = {
  getSummary: () => api.get('/api/stats/admin/'),
  exportCSV: () => api.get('/api/reports/export-csv/', { responseType: 'blob' }),
};

// Researcher stats API
export const researcherStatsAPI = {
  getSummary: () => api.get('/api/stats/researcher/')
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications/'),
  markAsRead: (notificationId) => api.post(`/api/notifications/${notificationId}/read/`)
};

export default api;