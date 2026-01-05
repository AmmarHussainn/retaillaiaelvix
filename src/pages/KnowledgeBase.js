import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Database } from 'lucide-react';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import CreateKnowledgeModal from '../components/knowledge/CreateKnowledgeModal'; // We'll create this next

const KnowledgeBase = () => {
  const [kbs, setKbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    setIsLoading(true);
    try {
      const data = await knowledgeBaseService.getAllKnowledgeBases();
      setKbs(Array.isArray(data) ? data : data.knowledge_bases || []);
    } catch (err) {
      console.error('Error fetching knowledge bases:', err);
      setError('Failed to load knowledge base entries.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreated = (newKb) => {
    setKbs([newKb, ...kbs]);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base?')) return;
    try {
      await knowledgeBaseService.deleteKnowledgeBase(id);
      setKbs(kbs.filter(kb => kb._id !== id && kb.id !== id));
    } catch (err) {
      console.error('Error deleting KB:', err);
      alert('Failed to delete knowledge base.');
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

      {/* List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading knowledge base...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg border border-red-100">
           <p className="text-red-500">{error}</p>
           <button onClick={fetchKnowledgeBases} className="mt-2 text-blue-600 hover:underline">Retry</button>
        </div>
      ) : kbs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Database className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No knowledge bases yet</h3>
          <p className="text-gray-500 mt-1 mb-6">Upload documents or add text for your agents to use.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Add Knowledge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {kbs.map((kb) => (
            <div key={kb._id || kb.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{kb.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{kb.content ? kb.content.substring(0, 100) + '...' : 'No preview available'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleDelete(kb._id || kb.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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
