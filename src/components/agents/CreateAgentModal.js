import React, { useState, useEffect } from 'react';
import { X, Mic, Brain, Database, Volume2 } from 'lucide-react';
import agentService from '../../services/agentService';
import llmService from '../../services/llmService';
import knowledgeBaseService from '../../services/knowledgeBaseService';

const CreateAgentModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    agent_name: '',
    response_engine: {
      type: 'retell-llm',
      llm_id: ''
    },
    voice_id: '11labs-Adrian',
    voice_model: 'eleven_turbo_v2_5',
    knowledge_base_ids: [],
    enable_backchannel: true,
    backchannel_frequency: 0.8,
    ambient_sound: 'coffee-shop',
    ambient_sound_volume: 0.5,
    responsiveness: 1.0,
    interruption_sensitivity: 1.0,
    voice_speed: 1.0, 
    volume: 1.0,
    voice_temperature: 1.0,
    language: 'en-US',
  });

  const [llms, setLlms] = useState([]);
  const [kbs, setKbs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch LLMs and KBs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [llmsData, kbsData] = await Promise.all([
          llmService.getAllLLMs(),
          knowledgeBaseService.getAllKnowledgeBases()
        ]);
        setLlms(Array.isArray(llmsData) ? llmsData : []);
        setKbs(Array.isArray(kbsData) ? kbsData : []);
      } catch (err) {
        console.error('Error fetching dependencies:', err);
        setError('Failed to load required data (LLMs or Knowledge Bases).');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'llm_id') {
      setFormData(prev => ({
        ...prev,
        response_engine: { ...prev.response_engine, llm_id: value }
      }));
    } else if (name === 'enable_backchannel') {
       setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'range') {
       setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKBToggle = (kbId) => {
    setFormData(prev => {
      const currentIds = prev.knowledge_base_ids || [];
      if (currentIds.includes(kbId)) {
        return { ...prev, knowledge_base_ids: currentIds.filter(id => id !== kbId) };
      } else {
        return { ...prev, knowledge_base_ids: [...currentIds, kbId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Construct strict payload for Retell API
      const payload = {
        agent_name: formData.agent_name,
        response_engine: {
          type: 'retell-llm',
          llm_id: formData.response_engine.llm_id
        },
        voice_id: formData.voice_id,
        voice_model: formData.voice_model,
        enable_backchannel: formData.enable_backchannel,
        backchannel_frequency: formData.backchannel_frequency,
        responsiveness: formData.responsiveness,
        interruption_sensitivity: formData.interruption_sensitivity,
        voice_speed: formData.voice_speed,
        volume: formData.volume,
        voice_temperature: formData.voice_temperature,
        language: formData.language,
        knowledge_base_ids: formData.knowledge_base_ids
      };

      // Handle ambient sound - remove if 'null' or empty
      if (formData.ambient_sound && formData.ambient_sound !== 'null') {
        payload.ambient_sound = formData.ambient_sound;
        payload.ambient_sound_volume = formData.ambient_sound_volume;
      }

      const newAgent = await agentService.createAgent(payload);
      onCreated(newAgent);
    } catch (err) {
      console.error('Failed to create agent:', err);
      setError(err.response?.data?.message || 'Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
           <p className="mt-4 text-gray-600">Loading configuration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Agent</h2>
            <p className="text-sm text-gray-500">Configure your voice agent's brain and personality</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Basic Info & LLM */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                name="agent_name"
                value={formData.agent_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Sales Representative"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-blue-600" />
                Select LLM Brain
              </label>
              <select
                name="llm_id"
                value={formData.response_engine.llm_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Select an LLM Configuration --</option>
                {llms.map(llm => {
                  // Try to find the correct Retell ID field
                  const retellId = llm.llm_id || llm.retell_llm_id;
                  const value = (retellId && retellId.startsWith('llm_')) ? retellId : (llm._id || llm.id);
                  const isRetellId = value && value.startsWith('llm_');
                  
                  return (
                   <option key={llm._id || llm.id} value={value}>
                     {llm.model} - {llm.general_prompt?.substring(0, 30)}... {!isRetellId ? '(Invalid ID)' : ''}
                   </option>
                  );
                })}
              </select>
              {llms.length === 0 && (
                <p className="text-sm text-red-500 mt-2">No LLMs found. Please create an LLM first.</p>
              )}
              {formData.response_engine.llm_id && !formData.response_engine.llm_id.startsWith('llm_') && (
                 <p className="text-xs text-amber-600 mt-1">
                   Warning: Selected LLM doest not appear to have a valid Retell ID (should start with "llm_").
                 </p>
              )}
            </div>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Database className="w-4 h-4 mr-2 text-green-600" />
                Knowledge Base (Optional)
              </label>
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-2">
                {kbs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No knowledge bases available.</p>
                ) : (
                  kbs.map(kb => (
                    <label key={kb._id || kb.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.knowledge_base_ids.includes(kb._id || kb.id)}
                        onChange={() => handleKBToggle(kb._id || kb.id)}
                        className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{kb.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Voice & Audio Settings */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Mic className="w-4 h-4 mr-2 text-purple-600" />
                Voice Settings
              </label>
              <select
                name="voice_id"
                value={formData.voice_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="11labs-Adrian">11Labs - Adrian</option>
                <option value="openai-Alloy">OpenAI - Alloy</option>
                <option value="openai-Echo">OpenAI - Echo</option>
                <option value="openai-Shimmer">OpenAI - Shimmer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Responsiveness
                </label>
                <input
                  type="range"
                  name="responsiveness"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.responsiveness}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-xs text-gray-500 font-medium">{formData.responsiveness}</div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                   Interruption
                </label>
                <input
                  type="range"
                  name="interruption_sensitivity"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.interruption_sensitivity}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                 <div className="text-right text-xs text-gray-500 font-medium">{formData.interruption_sensitivity}</div>
              </div>
            </div>

             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                 <Volume2 className="w-4 h-4 mr-2 text-amber-600" />
                 Ambient Sound
               </label>
               <select
                 name="ambient_sound"
                 value={formData.ambient_sound}
                 onChange={handleChange}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               >
                 <option value="null">None</option>
                 <option value="coffee-shop">Coffee Shop</option>
                 <option value="convention-hall">Convention Hall</option>
                 <option value="summer-outdoor">Summer Outdoor</option>
                 <option value="mountain-outdoor">Mountain Outdoor</option>
               </select>
             </div>

             <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input 
                  type="checkbox"
                  name="enable_backchannel"
                  checked={formData.enable_backchannel}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  Enable Backchanneling
                  <span className="block text-xs text-gray-500 font-normal">Allows the agent to say "mhm", "uh-huh" while listening.</span>
                </label>
             </div>
          </div>

          <div className="lg:col-span-2 pt-6 border-t border-gray-200 flex justify-end space-x-3">
             <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Creating Agent...' : 'Create Agent'}
            </button>
          </div>

          {error && (
            <div className="lg:col-span-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default CreateAgentModal;
