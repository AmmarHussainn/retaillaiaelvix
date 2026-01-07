import api from './api';

export const phoneNumberService = {
  // Get all phone numbers
  // Get all phone numbers
  getAllPhoneNumbers: async () => {
    const response = await api.get('/phone-numbers');
    return response.data;
  },

  // Create new phone number
  createPhoneNumber: async (data) => {
    const response = await api.post('/phone-numbers', data);
    return response.data;
  },

  // Update phone number (assign agent, etc.)
  // Note: API expects 'number' (e.g. +1415...) as the identifier in URL
  updatePhoneNumber: async (number, data) => {
    const encodedNumber = encodeURIComponent(number);
    const response = await api.patch(`/phone-numbers/${encodedNumber}`, data);
    return response.data;
  },

  // Delete phone number
  deletePhoneNumber: async (number) => {
    const encodedNumber = encodeURIComponent(number);
    const response = await api.delete(`/phone-numbers/${encodedNumber}`);
    return response.data;
  }
};
