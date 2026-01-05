import api from './api';

export const phoneNumberService = {
  // Get all phone numbers
  getAllPhoneNumbers: async () => {
    const response = await api.get('/phone-numbers');
    return response.data;
  },

  // Assign number to agent
  assignPhoneNumber: async (phoneNumberId, agentId) => {
    const response = await api.post('/phone-numbers/assign', {
      phone_number_id: phoneNumberId,
      agent_id: agentId
    });
    return response.data;
  },

  // Remove/Unassign number
  releasePhoneNumber: async (phoneNumberId) => {
    const response = await api.post('/phone-numbers/release', {
      phone_number_id: phoneNumberId
    });
    return response.data;
  }
};
