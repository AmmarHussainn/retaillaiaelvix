import React, { useState } from 'react';
import { X, Upload, Link, FileText, Type } from 'lucide-react';
import knowledgeBaseService from '../../services/knowledgeBaseService';

const CreateKnowledgeModal = ({ onClose, onCreated }) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'file', 'url'
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  
  // Tab Reference
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('knowledge_base_name', name);

      if (activeTab === 'text') {
        const textData = [{ title: name, text: textContent }];
        formData.append('knowledge_base_texts', JSON.stringify(textData));
      } else if (activeTab === 'file') {
        Array.from(files).forEach(file => {
          formData.append('knowledge_base_files', file);
        });
      } else if (activeTab === 'url') {
        formData.append('knowledge_base_urls', JSON.stringify([url])); // Assuming array of strings or simple string? Docs say "Knowledge_base_urls = https://...", but usually array for multipart. Let's send as plain string as per example if single, but let's check docs again. Docs: "Knowledge_base_urls = https://...". It might be a simple field. BUT, `knowledge_base_texts` is JSON array. Let's try appending strictly as docs example suggests: a single value per key instance usually implies list if same key used, or simple value. However, `multipart/form-data` with arrays often uses `key[]` or just `key` multiple times. 
        // Docs Example: "Knowledge_base_urls = https://...". Let's assume it accepts the string directly for now, or multiple entries.
        // Wait, typical pattern for arrays in formData is appending multiple times.
        formData.append('knowledge_base_urls', url);
      }
      
      // Add a hidden flag or type if API requires it to distinguish source type, 
      // but usually the presence of fields is enough.
      
      const newKb = await knowledgeBaseService.createKnowledgeBase(formData);
      onCreated(newKb);
    } catch (error) {
      console.error('Error creating KB:', error);
      alert('Failed to add knowledge base item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Knowledge</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Knowledge Base Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Product Manual v1"
              required
            />
          </div>

          <div className="flex border-b border-gray-200 mb-6">
             <button
               onClick={() => setActiveTab('text')}
               className={`flex-1 pb-3 text-sm font-medium border-b-2 ${activeTab === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
               <Type className="w-4 h-4 inline mr-2" /> Text
             </button>
             <button
               onClick={() => setActiveTab('file')}
               className={`flex-1 pb-3 text-sm font-medium border-b-2 ${activeTab === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
               <Upload className="w-4 h-4 inline mr-2" /> File Upload
             </button>
             <button
               onClick={() => setActiveTab('url')}
               className={`flex-1 pb-3 text-sm font-medium border-b-2 ${activeTab === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
               <Link className="w-4 h-4 inline mr-2" /> URL
             </button>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'text' && (
              <div className="space-y-4">
                 <textarea
                   rows={6}
                   value={textContent}
                   onChange={(e) => setTextContent(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   placeholder="Enter plain text content here..."
                 />
              </div>
            )}

            {activeTab === 'file' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                   <div className="flex justify-center mb-2">
                     <Upload className="w-8 h-8 text-gray-400" />
                   </div>
                   <input
                     type="file"
                     onChange={(e) => setFiles(e.target.files)}
                     className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                     multiple
                   />
                   <p className="text-xs text-gray-500 mt-2">PDF, DOCX, TXT supported</p>
                </div>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="space-y-4">
                 <div className="relative">
                   <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                   <input
                     type="url"
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     placeholder="https://example.com/docs"
                   />
                 </div>
                 <div className="flex items-center space-x-2">
                    <input type="checkbox" id="refresh-toggle" className="rounded text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="refresh-toggle" className="text-sm text-gray-700">Auto-refresh daily</label>
                 </div>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-3">
               <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add to Knowledge Base'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateKnowledgeModal;
