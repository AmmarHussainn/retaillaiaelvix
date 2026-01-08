import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import llmService from '../../services/llmService';

const UpdateLLMModal = ({ llm, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    model: 'gpt-4o',
    model_temperature: 0.7,
    general_prompt: '',
    begin_message: '',
    start_speaker: 'agent',
    general_tools: []
  });

  useEffect(() => {
    if (llm) {
      setFormData({
        model: llm.model || 'gpt-4o',
        model_temperature: llm.model_temperature || 0.7,
        general_prompt: llm.general_prompt || '',
        begin_message: llm.begin_message || '',
        start_speaker: llm.start_speaker || 'agent',
        general_tools: llm.general_tools || []
      });
    }
  }, [llm]);

  const availableTools = [
    { name: 'end_call', description: 'End the call' },
    // { name: 'transfer_call', description: 'Transfer the call' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'model_temperature' ? parseFloat(value) : value
    }));
  };

  const handleToolToggle = (toolName) => {
    setFormData(prev => {
      const currentTools = prev.general_tools || [];
      const toolExists = currentTools.find(t => t.name === toolName);
      
      if (toolExists) {
        return { ...prev, general_tools: currentTools.filter(t => t.name !== toolName) };
      } else {
        const toolDef = availableTools.find(t => t.name === toolName);
        const newTool = {
            type: toolDef.name,
            name: toolDef.name,
            description: toolDef.description
        };
        if (toolName === 'transfer_call') {
            newTool.name = 'transfer_to_manager';
        }
        return { ...prev, general_tools: [...currentTools, newTool] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the Retell ID for update, as the backend likely passes this to the Retell SDK
      const llmId = llm.llm_id || llm.retell_llm_id || llm.id; 
      await llmService.updateLLM(llmId, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating LLM:', error);
      alert('Failed to update LLM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Update LLM</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4.1">GPT-4.1</option>
                <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                <option value="gpt-4.1-nano">GPT-4.1 Nano</option>
                <option value="gpt-5">GPT-5</option>
                <option value="gpt-5.1">GPT-5.1</option>
                <option value="gpt-5.2">GPT-5.2</option>
                <option value="gpt-5-mini">GPT-5 Mini</option>
                <option value="gpt-5-nano">GPT-5 Nano</option>
                <option value="claude-4.0-sonnet">Claude 4.0 Sonnet</option>
                <option value="claude-4.5-sonnet">Claude 4.5 Sonnet</option>
                <option value="claude-3.7-sonnet">Claude 3.7 Sonnet</option>
                <option value="claude-3.5-haiku">Claude 3.5 Haiku</option>
                <option value="claude-4.5-haiku">Claude 4.5 Haiku</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                <option value="gemini-3.0-flash">Gemini 3.0 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature ({formData.model_temperature})
              </label>
              <input
                type="range"
                name="model_temperature"
                min="0"
                max="1"
                step="0.1"
                value={formData.model_temperature}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Prompt
            </label>
            <textarea
              name="general_prompt"
              rows={4}
              value={formData.general_prompt}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="You are a helpful assistant..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Begin Message
            </label>
            <textarea
              name="begin_message"
              rows={2}
              value={formData.begin_message}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hello, how can I help you today?"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tools
            </label>
            <div className="space-y-2">
              {availableTools.map(tool => (
                <label key={tool.name} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.general_tools?.some(t => t.name === tool.name) || false}
                    onChange={() => handleToolToggle(tool.name)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{tool.name}</div>
                    <div className="text-sm text-gray-500">{tool.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateLLMModal;
