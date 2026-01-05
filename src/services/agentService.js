import api from './api';

export const agentService = {
  // Get all agents
  getAllAgents: async () => {
    const response = await api.get('/agents');
    return response.data;
  },

  // Get single agent
  getAgent: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  // Create new agent
  createAgent: async (agentData) => {
    const response = await api.post('/agents', {
      ...agentData,
      type: 'voice', // Hardcoded as per requirements
    });
    return response.data;
  },

  // Update agent
  updateAgent: async (id, agentData) => {
    const response = await api.patch(`/agents/${id}`, agentData);
    return response.data;
  },

  // Delete agent
  deleteAgent: async (id) => {
    const response = await api.delete(`/agents/${id}`);
    return response.data;
  },
};
