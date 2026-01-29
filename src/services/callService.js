import api from "./api";

export const callService = {
  // Create a web call (browser-based)
  createWebCall: async (agentId, metadata = {}, dynamicVariables = {}) => {
    const response = await api.post("/calls/web", {
      agent_id: agentId,
      metadata,
      retell_llm_dynamic_variables: dynamicVariables,
    });
    return response.data;
  },

  // Create an outbound phone call
  createPhoneCall: async (
    fromNumber,
    toNumber,
    agentId,
    metadata = {},
    dynamicVariables = {},
  ) => {
    const response = await api.post("/calls/phone", {
      from_number: fromNumber,
      to_number: toNumber,
      override_agent_id: agentId,
      metadata,
      retell_llm_dynamic_variables: dynamicVariables,
    });
    return response.data;
  },

  // Get call details
  getCallDetails: async (callId) => {
    const response = await api.get(`/calls/${callId}`);
    return response.data;
  },

  // List calls
  listCalls: async (filterCriteria = {}, limit = 50) => {
    const response = await api.post("/calls/list", {
      filter_criteria: filterCriteria,
      sort_order: "descending",
      limit,
    });
    return response.data;
  },

  // End a call
  endCall: async (callId) => {
    const response = await api.post(`/calls/${callId}/end`);
    return response.data;
  },
};
