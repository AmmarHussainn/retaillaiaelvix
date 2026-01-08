import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquare, MoreVertical, Trash2, Edit } from 'lucide-react';
import llmService from '../services/llmService';
import CreateLLMModal from '../components/llms/CreateLLMModal';
import UpdateLLMModal from '../components/llms/UpdateLLMModal';
import { useToast } from '../context/ToastContext';

const LLMs = () => {
  const [llms, setLlms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchLLMs = async () => {
    try {
      const data = await llmService.getAllLLMs();
      setLlms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching LLMs:', error);
      toast.error('Failed to load LLMs');
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
        toast.success('LLM deleted successfully');
      } catch (error) {
        console.error('Error deleting LLM:', error);
        toast.error('Failed to delete LLM');
      }
    }
  };

  const handleEdit = (llm) => {
    setSelectedLLM(llm);
    setShowUpdateModal(true);
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

      {/* LLMs Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredLLMs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No LLMs found</h3>
          <p className="text-gray-500 mt-2 mb-6">Get started by creating your first LLM configuration.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Create LLM
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLLMs.map((llm) => {
             // Use _id for react keys
             const dbId = llm._id || llm.id;
             // Use llm_id for operations (Delete/Update)
             const displayId = llm.llm_id || llm.retell_llm_id || 'N/A';
             
             return (
              <div key={dbId} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between h-full group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-blue-50 text-blue-700">
                      {llm.model || 'Unknown Model'}
                    </span>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-300 hover:text-blue-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                     {llm.llm_websocket_url ? 'Custom LLM' : (llm.model || 'Untitled LLM')}
                  </h3>

                  <div className="space-y-3 mt-4">
                    {/* Prompt Preview */}
                    <div className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100 italic">
                        "{llm.general_prompt || 'No system prompt configured...'}"
                    </div>

                    {/* First Message */}
                    <div className="flex items-center text-sm text-gray-500">
                       <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                       <span className="truncate">{llm.begin_message || 'No greeting message'}</span>
                    </div>

                    {/* ID Display */}
                    <div className="flex items-center text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 group-hover:border-blue-100 transition-colors">
                        <span className="truncate flex-1">ID: {displayId}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(displayId);
                                toast.success('LLM ID copied');
                            }}
                            className="ml-2 text-blue-500 hover:text-blue-700 font-sans font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Copy
                        </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex space-x-2 w-full">
                      <button 
                        onClick={() => handleEdit(llm)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            // MUST use displayId (Retell LLM ID) for the backend delete endpoint
                            await handleDelete(displayId);
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors" 
                          title="Delete LLM"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateLLMModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchLLMs}
        />
      )}

      {showUpdateModal && selectedLLM && (
        <UpdateLLMModal
          llm={selectedLLM}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedLLM(null);
          }}
          onSuccess={fetchLLMs}
        />
      )}
    </div>
  );
};

export default LLMs;
