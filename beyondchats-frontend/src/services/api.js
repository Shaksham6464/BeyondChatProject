import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Articles API
export const articlesAPI = {
  // Get all articles
  getAll: async () => {
    const response = await api.get('/api/articles');
    return response.data;
  },

  // Get single article by ID
  getById: async (id) => {
    const response = await api.get(`/api/articles/${id}`);
    return response.data;
  },

  // Get latest article
  getLatest: async () => {
    const response = await api.get('/api/articles/latest');
    return response.data;
  },

  // Create article
  create: async (articleData) => {
    const response = await api.post('/api/articles', articleData);
    return response.data;
  },

  // Update article
  update: async (id, articleData) => {
    const response = await api.put(`/api/articles/${id}`, articleData);
    return response.data;
  },

  // Delete article
  delete: async (id) => {
    const response = await api.delete(`/api/articles/${id}`);
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;