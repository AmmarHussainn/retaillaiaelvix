import api from './api';

const llmService = {
  getAllLLMs: async () => {
    const response = await api.get('/llms');
    return response.data;
  },

  getLLM: async (id) => {
    const response = await api.get(`/llms/${id}`);
    return response.data;
  },

  createLLM: async (llmData) => {
    const response = await api.post('/llms', llmData);
    return response.data;
  },

  updateLLM: async (id, llmData) => {
    const response = await api.patch(`/llms/${id}`, llmData);
    return response.data;
  },

  deleteLLM: async (id) => {
    const response = await api.delete(`/llms/${id}`);
    return response.data;
  }
};

export default llmService;
