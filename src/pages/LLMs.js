
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MessageSquare, MoreVertical, Trash2, Wrench, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import llmService from '../services/llmService';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../context/ToastContext';

const LLMs = () => {
  const navigate = useNavigate();
  const [llms, setLlms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, llmId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const fetchLLMs = useCallback(async () => {
    try {
      const data = await llmService.getAllLLMs();
      setLlms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching LLMs:', error);
      toast.error('Failed to load LLMs');
    } finally {
      setLoading(false);
    }
  }, [toast.error]);

  useEffect(() => {
    fetchLLMs();
  }, [fetchLLMs]);

  const handleInitiateDelete = (id) => {
    setDeleteModalState({ isOpen: true, llmId: id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.llmId) return;

    setIsDeleting(true);
    try {
      await llmService.deleteLLM(deleteModalState.llmId);
      await fetchLLMs();
      toast.success('LLM deleted successfully');
      setDeleteModalState({ isOpen: false, llmId: null });
    } catch (error) {
      console.error('Error deleting LLM:', error);
      toast.error('Failed to delete LLM');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (llm) => {
    const displayId = llm.llm_id || llm.retell_llm_id;
    navigate(`/llms/edit/${displayId}`);
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
          onClick={() => navigate('/llms/create')}
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
            onClick={() => navigate('/llms/create')}
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
              <div key={dbId} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        {llm.model || 'Unknown'}
                      </span>
                      {llm.s2s_model && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                          S2S Enabled
                        </span>
                      )}
                      {(llm.knowledge_base_ids?.length > 0) && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                          RAG
                        </span>
                      )}
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                     {llm.llm_websocket_url ? 'Custom WebSocket' : (llm.model || 'Standard Engine')}
                  </h3>

                  <div className="space-y-4">
                    {/* Prompt Preview */}
                    <div className="text-sm text-gray-600 line-clamp-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 italic leading-relaxed">
                        "{llm.general_prompt || 'No system prompt configured...'}"
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <Wrench className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-gray-700">{llm.general_tools?.length || 0} Tools</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-gray-700">{llm.states?.length || 0} States</span>
                      </div>
                    </div>

                    {/* ID & Copy */}
                    <div className="flex items-center justify-between p-2.5 bg-gray-900 rounded-xl text-white">
                        <span className="text-[10px] font-mono opacity-60 truncate mr-2">ID: {displayId}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(displayId);
                                toast.success('ID Copied');
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                   <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEdit(llm)}
                        className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                      >
                        Configure
                      </button>
                      <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleInitiateDelete(displayId);
                          }}
                          className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-all border border-red-100" 
                          title="Delete LLM"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}



      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, llmId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete LLM"
        message="Are you sure you want to delete this LLM? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LLMs;
