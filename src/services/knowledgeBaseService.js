import api from './api';

export const knowledgeBaseService = {
  // Get all knowledge bases
  getAllKnowledgeBases: async () => {
    const response = await api.get('/knowledge-base');
    return response.data;
  },

  // Create knowledge base
  createKnowledgeBase: async (data) => {
    // data should contain { name, content } or similar
    const response = await api.post('/knowledge-base', data);
    return response.data;
  },

  // Delete knowledge base
  deleteKnowledgeBase: async (id) => {
    const response = await api.delete(`/knowledge-base/${id}`);
    return response.data;
  },
  
  // Get single KB (optional, for editing)
  getKnowledgeBase: async (id) => {
    const response = await api.get(`/knowledge-base/${id}`);
    return response.data;
  }
};
