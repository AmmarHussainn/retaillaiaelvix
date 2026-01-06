import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquare, MoreVertical, Trash2, Edit } from 'lucide-react';
import llmService from '../services/llmService';
import CreateLLMModal from '../components/llms/CreateLLMModal';

const LLMs = () => {
  const [llms, setLlms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLLMs = async () => {
    try {
      const data = await llmService.getAllLLMs();
      setLlms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching LLMs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLLMs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this LLM?')) {
      try {
        await llmService.deleteLLM(id);
        fetchLLMs();
      } catch (error) {
        console.error('Error deleting LLM:', error);
      }
    }
  };

  const filteredLLMs = llms.filter(llm => 
    llm.general_prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    llm.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLMs</h1>
          <p className="text-gray-500 mt-1">Manage your Large Language Models and prompts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create LLM
        </button>
      </div>

      <div className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg w-96">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search LLMs..."
          className="flex-1 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredLLMs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No LLMs found</h3>
          <p className="text-gray-500 mt-2">Get started by creating your first LLM configuration.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Message</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLLMs.map((llm) => (
                <tr key={llm._id || llm.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {llm.model}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                      {llm.general_prompt}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {llm.begin_message || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(llm._id || llm.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <CreateLLMModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchLLMs}
        />
      )}
    </div>
  );
};

export default LLMs;
