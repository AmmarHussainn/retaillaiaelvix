import api from './api';

const knowledgeBaseService = {
  getAllKnowledgeBases: async () => {
    const response = await api.get('/kbs');
    return response.data;
  },

  getKnowledgeBase: async (id) => {
    const response = await api.get(`/kbs/${id}`);
    return response.data;
  },

  createKnowledgeBase: async (formData) => {
    // formData should be an instance of FormData for multipart/form-data
    const response = await api.post('/kbs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteKnowledgeBase: async (id) => {
    const response = await api.delete(`/kbs/${id}`);
    return response.data;
  },

  deleteSource: async (kbId, sourceId) => {
    const response = await api.delete(`/kbs/${kbId}/sources/${sourceId}`);
    return response.data;
  }
};

export default knowledgeBaseService;
