import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Database } from 'lucide-react';
import knowledgeBaseService from '../services/knowledgeBaseService';
import CreateKnowledgeModal from '../components/knowledge/CreateKnowledgeModal';
import { useToast } from '../context/ToastContext';

const KnowledgeBase = () => {
  const [kbs, setKbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    setIsLoading(true);
    try {
      const data = await knowledgeBaseService.getAllKnowledgeBases();
      // Adjust to handle both direct array or wrapped response
      setKbs(Array.isArray(data) ? data : data.knowledge_bases || []);
    } catch (err) {
      console.error('Error fetching knowledge bases:', err);
      setError('Failed to load knowledge base entries.');
      toast.error('Failed to fetch knowledge base data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreated = (newKb) => {
    setKbs([newKb, ...kbs]);
    setIsModalOpen(false);
    toast.success('Knowledge Base created successfully');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base?')) return;
    try {
      await knowledgeBaseService.deleteKnowledgeBase(id);
      setKbs(kbs.filter(kb => kb.knowledge_base_id !== id));
      toast.success('Knowledge Base deleted');
    } catch (err) {
      console.error('Error deleting KB:', err);
      toast.error('Failed to delete knowledge base');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
           <p className="text-gray-500 mt-1">Manage documents and data for your agents.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Knowledge
        </button>
      </div>

      {/* Knowledge Base Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your knowledge base...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
           <p className="text-red-500 font-medium">{error}</p>
           <button onClick={fetchKnowledgeBases} className="mt-3 text-blue-600 hover:text-blue-800 font-medium underline">Retry Connection</button>
        </div>
      ) : kbs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Database className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No knowledge bases found</h3>
          <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Upload documents or add text content to empower your agents with custom knowledge.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Create Knowledge Base
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kbs.map((kb) => (
            <div key={kb.knowledge_base_id || kb._id || kb.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between h-full group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`
                    px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                    ${kb.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                  `}>
                    {kb.status?.replace('_', ' ') || 'Unknown'}
                  </div>
                  <button 
                    onClick={() => handleDelete(kb.knowledge_base_id)}
                    className="text-gray-300 group-hover:text-red-400 hover:!text-red-600 transition-colors p-1"
                    title="Delete Knowledge Base"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={kb.knowledge_base_name || kb.name}>
                    {kb.knowledge_base_name || kb.name || 'Untitled Knowledge Base'}
                </h3>
                
                <div className="space-y-3">
                    <div className="flex items-center text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <span className="truncate flex-1">ID: {kb.knowledge_base_id}</span>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(kb.knowledge_base_id);
                                toast.success('Copied ID to clipboard');
                            }}
                            className="ml-2 text-blue-500 hover:text-blue-700 font-sans font-medium"
                        >
                            Copy
                        </button>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{kb.sources?.length || 0} Source(s)</span>
                    </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                 <span>Created {new Date(kb.createdAt || Date.now()).toLocaleDateString()}</span>
                 <span>Updated {new Date(kb.updatedAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateKnowledgeModal 
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default KnowledgeBase;
