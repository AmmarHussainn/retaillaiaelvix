import React, { useState } from 'react';
import { X, Upload, Link, FileText, Type, Info, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import knowledgeBaseService from '../../services/knowledgeBaseService';
import { useToast } from '../../context/ToastContext';

const CreateKnowledgeModal = ({ onClose, onCreated }) => {
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'file', 'url'
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const toast = useToast();
  
  // Content
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState('');
  const [urlSettings, setUrlSettings] = useState({
    autoRefresh: true,
    autoCrawl: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error('Please enter a knowledge base name');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('knowledge_base_name', name);

      if (activeTab === 'text') {
        if (!textContent) throw new Error('Please enter some text content');
        const textData = [{ title: name, text: textContent }];
        formData.append('knowledge_base_texts', JSON.stringify(textData));
      } else if (activeTab === 'file') {
        if (files.length === 0) throw new Error('Please select at least one file');
        Array.from(files).forEach(file => {
          formData.append('knowledge_base_files', file);
        });
      } else if (activeTab === 'url') {
        if (!url) throw new Error('Please enter a URL');
        formData.append('knowledge_base_urls', url);
        // If API supports these params:
        // formData.append('enable_auto_refresh', urlSettings.autoRefresh);
      }
      
      const newKb = await knowledgeBaseService.createKnowledgeBase(formData);
      onCreated(newKb);
    } catch (error) {
      console.error('Error creating KB:', error);
      toast.error(error.message || 'Failed to create knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'file', icon: Upload, label: 'Files' },
    { id: 'url', icon: Globe, label: 'URL' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[28px] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add Knowledge</h2>
            <p className="text-xs text-gray-500 font-medium">Provide context for your AI agent.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Knowledge Base Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-gray-300"
              placeholder="e.g. Company Policy Handbook"
              required
            />
          </div>

          {/* Tab Selection */}
          <div className="space-y-3">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Source Type</label>
             <div className="flex p-1 bg-gray-100/80 rounded-[18px]">
               {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex-1 flex items-center justify-center py-2.5 rounded-[14px] text-sm font-bold transition-all ${
                     activeTab === tab.id 
                       ? 'bg-white text-blue-600 shadow-sm' 
                       : 'text-gray-500 hover:text-gray-700'
                   }`}
                 >
                   <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                   {tab.label}
                 </button>
               ))}
             </div>
          </div>

          {/* Tab Content */}
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'text' && (
              <div className="space-y-4">
                 <textarea
                   rows={8}
                   value={textContent}
                   onChange={(e) => setTextContent(e.target.value)}
                   className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none placeholder:text-gray-300 leading-relaxed font-normal"
                   placeholder="Paste your text content here. This will be used to train your agent..."
                 />
                 <div className="flex items-start space-x-2 text-gray-400 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-medium">Clear, structured text produces the best results for the AI's understanding.</p>
                 </div>
              </div>
            )}

            {activeTab === 'file' && (
              <div className="space-y-4">
                <div className="group relative border-2 border-dashed border-gray-200 rounded-[28px] p-10 text-center bg-gray-50/30 hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-300">
                   <input
                     type="file"
                     onChange={(e) => setFiles(e.target.files)}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     multiple
                   />
                   <div className="relative z-0">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-blue-500" />
                      </div>
                      <h4 className="text-[15px] font-bold text-gray-900 mb-1">
                        {files.length > 0 ? `${files.length} file(s) selected` : 'Drop your files here'}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">PDF, DOCX, TXT · Max 50MB per file</p>
                      {files.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                           {Array.from(files).slice(0, 3).map((f, i) => (
                             <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold truncate max-w-[100px]">{f.name}</span>
                           ))}
                           {files.length > 3 && <span className="text-[10px] text-gray-400 font-bold">+{files.length - 3} more</span>}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                        placeholder="https://example.com/documentation"
                      />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setUrlSettings(prev => ({...prev, autoRefresh: !prev.autoRefresh}))}
                      className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                        urlSettings.autoRefresh 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-100 opacity-60'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${urlSettings.autoRefresh ? 'bg-blue-500 border-blue-500' : 'border-gray-200'}`}>
                         {urlSettings.autoRefresh && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Auto Refresh</p>
                        <p className="text-[10px] text-gray-500 font-medium">Daily sync</p>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setUrlSettings(prev => ({...prev, autoCrawl: !prev.autoCrawl}))}
                      className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                        urlSettings.autoCrawl 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-100 opacity-60'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${urlSettings.autoCrawl ? 'bg-blue-500 border-blue-500' : 'border-gray-200'}`}>
                         {urlSettings.autoCrawl && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Auto Crawl</p>
                        <p className="text-[10px] text-gray-500 font-medium">Follow links</p>
                      </div>
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end space-x-3">
           <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-500 hover:text-gray-900 text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? (
               <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
               </div>
            ) : 'Create Knowledge Base'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateKnowledgeModal;
