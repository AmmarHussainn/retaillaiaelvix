import api from './api';

export const phoneNumberService = {
  // Get all phone numbers
  // Get all phone numbers
  getAllPhoneNumbers: async () => {
    const response = await api.get('/phones');
    return response.data;
  },

  // Create new phone number
  createPhoneNumber: async (data) => {
    const response = await api.post('/phones', data);
    return response.data;
  },

  // Update phone number (assign agent, etc.)
  // Note: API expects 'number' (e.g. +1415...) as the identifier in URL
  updatePhoneNumber: async (number, data) => {
    const encodedNumber = encodeURIComponent(number);
    const response = await api.patch(`/phones/${encodedNumber}`, data);
    return response.data;
  },

  // Delete phone number
  deletePhoneNumber: async (number) => {
    const encodedNumber = encodeURIComponent(number);
    const response = await api.delete(`/phones/${encodedNumber}`);
    return response.data;
  }
};
