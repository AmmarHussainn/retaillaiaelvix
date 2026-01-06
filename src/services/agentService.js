import api from './api';

const agentService = {
  getAllAgents: async () => {
    const response = await api.get('/agents');
    return response.data;
  },

  getAgent: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  createAgent: async (agentData) => {
    const response = await api.post('/agents', agentData);
    return response.data;
  },

  updateAgent: async (id, agentData) => {
    const response = await api.patch(`/agents/${id}`, agentData);
    return response.data;
  },

  deleteAgent: async (id) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },

  publishAgent: async (id) => {
    const response = await api.post(`/agents/${id}/publish`);
    return response.data;
  },

  getAgentVersions: async (id) => {
    const response = await api.get(`/agents/${id}/versions`);
    return response.data;
  }
};

export default agentService;
