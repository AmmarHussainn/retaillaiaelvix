import api from './api';

export const settingsService = {
  // Get user/account settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update settings (e.g. webhook)
  updateSettings: async (data) => {
    const response = await api.patch('/settings', data);
    return response.data;
  },

  // Get API Keys
  getApiKeys: async () => {
    const response = await api.get('/api-keys');
    return response.data;
  },

  // Create API Key
  createApiKey: async (name) => {
    const response = await api.post('/api-keys', { name });
    return response.data;
  },

  // Delete API Key
  deleteApiKey: async (id) => {
    const response = await api.delete(`/api-keys/${id}`);
    return response.data;
  }
};
