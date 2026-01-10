import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, FileText, Trash2, Database, 
  Clock, CheckCircle2, AlertCircle, Loader2, 
  ExternalLink, Copy, MoreHorizontal, Filter,
  ArrowUpDown, Calendar
} from 'lucide-react';
import knowledgeBaseService from '../services/knowledgeBaseService';
import CreateKnowledgeModal from '../components/knowledge/CreateKnowledgeModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useToast } from '../context/ToastContext';

const KnowledgeBase = () => {
  const [kbs, setKbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [kbToDelete, setKbToDelete] = useState(null);

  const toast = useToast();

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
      toast.error('Failed to fetch knowledge base data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredKbs = useMemo(() => {
    return kbs.filter(kb => 
      (kb.knowledge_base_name || kb.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kb.knowledge_base_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kbs, searchQuery]);

  const handleCreated = (newKb) => {
    setKbs([newKb, ...kbs]);
    setIsModalOpen(false);
    toast.success('Knowledge Base created successfully');
  };

  const handleDeleteClick = (id) => {
    setKbToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!kbToDelete) return;
    try {
      await knowledgeBaseService.deleteKnowledgeBase(kbToDelete);
      setKbs(kbs.filter(kb => kb.knowledge_base_id !== kbToDelete));
      toast.success('Knowledge Base deleted');
    } catch (err) {
      console.error('Error deleting KB:', err);
      toast.error('Failed to delete knowledge base');
    } finally {
      setIsDeleteModalOpen(false);
      setKbToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tight">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tight">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-tight">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-tight">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-gray-500 font-medium">Empower your agents with custom documentation and data sources.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-bold text-sm shadow-lg shadow-gray-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Knowledge
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                <ArrowUpDown className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-bold text-gray-500">Retrieving knowledge bases...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="max-w-md text-center p-8 bg-red-50 rounded-2xl border border-red-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-sm text-red-600 mb-6 font-medium">{error}</p>
            <button 
              onClick={fetchKnowledgeBases}
              className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : filteredKbs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px] bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="text-center max-w-sm px-6">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
               <Database className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
                {searchQuery ? 'No results found' : 'No knowledge bases'}
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                {searchQuery 
                    ? `We couldn't find any knowledge base matching "${searchQuery}".`
                    : 'Start by uploading documents or adding URLs to create your first knowledge base.'
                }
            </p>
            <button
              onClick={() => { searchQuery ? setSearchQuery('') : setIsModalOpen(true) }}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              {searchQuery ? 'Clear Search' : 'Create Knowledge Base'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredKbs.map((kb) => (
            <div 
              key={kb.knowledge_base_id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col group overflow-hidden"
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Database className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(kb.status)}
                    <button className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors">
                       <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-[15px] font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {kb.knowledge_base_name || kb.name || 'Untitled'}
                </h3>
                
                <div className="flex items-center text-[10px] font-mono text-gray-400 bg-gray-50/50 px-2 py-1 rounded-lg border border-gray-100/50 w-fit mb-4">
                    <span className="truncate max-w-[120px]">ID: {kb.knowledge_base_id}</span>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(kb.knowledge_base_id);
                            toast.success('Copied ID');
                        }}
                        className="ml-2 hover:text-blue-500"
                    >
                        <Copy className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            <span className="font-semibold">Sources</span>
                        </div>
                        <span className="font-bold text-gray-900">{kb.sources?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            <span className="font-semibold">Last Sync</span>
                        </div>
                        <span className="font-medium">{new Date(kb.updatedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="text-xs font-bold text-gray-600 hover:text-blue-600 flex items-center">
                    View Details
                    <ExternalLink className="w-3 h-3 ml-1" />
                 </button>
                 <button 
                    onClick={() => handleDeleteClick(kb.knowledge_base_id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                 >
                    <Trash2 className="w-4 h-4" />
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Knowledge Base"
        message="Are you sure you want to delete this knowledge base? This action cannot be undone."
        confirmText="Delete Knowledge Base"
        isDestructive={true}
      />
    </div>
  );
};

export default KnowledgeBase;
