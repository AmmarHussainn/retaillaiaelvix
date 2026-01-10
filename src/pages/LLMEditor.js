import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp, 
  Settings, MessageSquare, Wrench, LayoutDashboard, 
  Database, Info, Mic, Headphones, FileJson, 
  Webhook, ShieldAlert, Cpu, Globe, Check, Copy, MoreVertical, Edit2
} from 'lucide-react';
import llmService from '../services/llmService';
import knowledgeBaseService from '../services/knowledgeBaseService';
import { useToast } from '../context/ToastContext';
import { 
  X, Search, Sliders, ExternalLink, RefreshCw
} from 'lucide-react';

const LLMEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    functions: true,
    knowledgeBase: false,
    states: false,
    webhooks: false,
    mcp: false
  });

  const [availableKbs, setAvailableKbs] = useState([]);
  const [kbDropdownOpen, setKbDropdownOpen] = useState(false);
  const [kbSettingsOpen, setKbSettingsOpen] = useState(false);
  const [postCallDropdownOpen, setPostCallDropdownOpen] = useState(false);
  const [tempKbConfig, setTempKbConfig] = useState({ top_k: 3, filter_score: 0.6 });
  const [activeConfigTool, setActiveConfigTool] = useState(null); // For tool config modals
  const [isVarModalOpen, setIsVarModalOpen] = useState(false); // For sub-modal in dynamic variables
  const [isEditingName, setIsEditingName] = useState(false);
  const [functionsDropdownOpen, setFunctionsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    model: 'gpt-4.1',
    s2s_model: null,
    model_temperature: 0,
    model_high_priority: false,
    tool_call_strict_mode: true,
    general_prompt: '',
    begin_message: '',
    start_speaker: 'agent',
    begin_after_user_silence_ms: 2000,
    general_tools: [],
    states: [],
    starting_state: '',
    knowledge_base_ids: [],
    default_dynamic_variables: {},
    mcps: [],
    kb_config: {
      top_k: 3,
      filter_score: 0.6
    },
    post_call_analysis_data: [
      { name: 'call_summary', type: 'text', description: 'Summary of the call' },
      { name: 'call_successful', type: 'boolean', description: 'Whether the call was successful' }
    ],
    post_call_analysis_model: 'gpt-4.1-mini',
    webhook_url: '',
    webhook_timeout_ms: 5000,
    name: 'New Response Engine'
  });

  const fetchLLM = useCallback(async () => {
    try {
      const data = await llmService.getLLM(id);
      setFormData({
        ...formData,
        ...data,
        kb_config: data.kb_config || { top_k: 3, filter_score: 0.6 },
        default_dynamic_variables: data.default_dynamic_variables || {},
        general_tools: data.general_tools || [],
        states: data.states || [],
        knowledge_base_ids: data.knowledge_base_ids || [],
        mcps: data.mcps || []
      });
    } catch (error) {
      console.error('Error fetching LLM:', error);
      toast.error('Failed to load LLM details');
      navigate('/llms');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  const fetchAvailableKbs = useCallback(async () => {
    try {
      const data = await knowledgeBaseService.getAllKnowledgeBases();
      setAvailableKbs(Array.isArray(data) ? data : data.knowledge_bases || []);
    } catch (error) {
      console.error('Error fetching available KBs:', error);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchLLM();
    }
    fetchAvailableKbs();
  }, [isEditMode, fetchLLM, fetchAvailableKbs]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'model_temperature' || name === 'begin_after_user_silence_ms') ? (value === '' ? '' : Number(value)) : 
              value
    }));
  };

  const handleKBConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      kb_config: {
        ...prev.kb_config,
        [field]: field === 'top_k' ? Number(value) : Number(value)
      }
    }));
  };

  const handleAddTool = () => {
    const newTool = {
      type: 'end_call',
      name: `end_call_${formData.general_tools.length + 1}`,
      description: 'End the call with the user.'
    };
    setFormData(prev => ({
      ...prev,
      general_tools: [...prev.general_tools, newTool]
    }));
  };

  const handleUpdateTool = (index, field, value) => {
    const updatedTools = [...formData.general_tools];
    const updatedTool = { ...updatedTools[index] };
    
    updatedTool[field] = value;

    // Reset specific fields when type changes
    if (field === 'type') {
      delete updatedTool.transfer_destination;
      delete updatedTool.url;
      delete updatedTool.cal_api_key;
    }

    updatedTools[index] = updatedTool;
    setFormData(prev => ({ ...prev, general_tools: updatedTools }));
  };

  const handleRemoveTool = (index) => {
    setFormData(prev => ({
      ...prev,
      general_tools: prev.general_tools.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      
      // Ensure mutual exclusivity of model and s2s_model
      if (payload.s2s_model) {
        delete payload.model;
      } else {
        delete payload.s2s_model;
      }

      // Remove states (as requested to remove Conversation Flow)
      delete payload.states;
      delete payload.starting_state;

      if (payload.general_tools && payload.general_tools.length > 0) {
        payload.general_tools = payload.general_tools.map(tool => {
          const cleanTool = { ...tool };
          if (cleanTool.type === 'transfer_call' && !cleanTool.transfer_destination) {
            throw new Error(`Transfer call tool "${cleanTool.name}" requires a destination`);
          }
          if (cleanTool.type === 'custom' && !cleanTool.url) {
            throw new Error(`Custom tool "${cleanTool.name}" requires a URL`);
          }
          return cleanTool;
        });
      } else {
        delete payload.general_tools;
      }

      if (payload.knowledge_base_ids.length === 0) delete payload.knowledge_base_ids;
      if (Object.keys(payload.default_dynamic_variables).length === 0) delete payload.default_dynamic_variables;
      if (payload.mcps.length === 0) delete payload.mcps;
      
      if (!payload.webhook_url) {
        delete payload.webhook_url;
        delete payload.webhook_timeout_ms;
      }

      if (isEditMode) {
        await llmService.updateLLM(id, payload);
        toast.success('LLM updated successfully');
      } else {
        await llmService.createLLM(payload);
        toast.success('LLM created successfully');
      }
      navigate('/llms');
    } catch (error) {
      console.error('Error saving LLM:', error);
      toast.error('Failed to save LLM: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-6 bg-[#f8fafc]">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/llms')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 flex items-center group">
              {isEditingName ? (
                <input
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="bg-gray-50 border-b-2 border-blue-500 outline-none px-1 rounded-t-sm"
                />
              ) : (
                <>
                  <span onClick={() => setIsEditingName(true)} className="cursor-pointer hover:text-blue-600 transition-colors">
                    {formData.name}
                  </span>
                  <Edit2 
                    className="w-4 h-4 ml-2 text-gray-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500" 
                    onClick={() => setIsEditingName(true)}
                  />
                </>
              )}
            </h1>
            {isEditMode && (
              <div className="flex items-center space-x-3 text-[11px] text-gray-500 font-medium">
                <span className="flex items-center">Agent ID: <span className="ml-1 text-gray-700">ag...357</span> <Copy className="w-3 h-3 ml-1 cursor-pointer" /></span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center">Retell LLM ID: <span className="ml-1 text-gray-700">{id}</span> <Copy className="w-3 h-3 ml-1 cursor-pointer" /></span>
                <span className="text-gray-300">•</span>
                <span>$0.115/min</span>
                <span className="text-gray-300">•</span>
                <span>1470-1800ms latency</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">Create</span>
          <span className="text-sm font-medium text-gray-400">Simulation</span>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="ml-4 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg flex items-center space-x-2"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-b-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Config Pills */}
            <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <Cpu className="w-4 h-4 text-gray-400" />
                <select 
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4"
                >
                  <option value="gpt-4.1">GPT 4.1</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>
              
              <div className="w-px h-6 bg-gray-200"></div>

              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <Mic className="w-4 h-4 text-gray-400" />
                <select 
                  name="s2s_model"
                  value={formData.s2s_model || ''}
                  onChange={handleInputChange}
                  className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4"
                >
                  <option value="">Standard Voice</option>
                  <option value="gpt-4o-realtime">GPT-4o Realtime</option>
                  <option value="gpt-4o-mini-realtime">GPT-4o Mini Realtime</option>
                </select>
              </div>

              <div className="w-px h-6 bg-gray-200"></div>

              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <Globe className="w-4 h-4 text-gray-400" />
                <select className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
              <div className="flex-1 p-8">
                <textarea 
                  name="general_prompt"
                  value={formData.general_prompt}
                  onChange={handleInputChange}
                  placeholder="## Role\nYou are a professional receptionist for Johnson & Associates Law Firm..."
                  className="w-full h-full text-lg text-gray-800 placeholder-gray-300 resize-none outline-none leading-relaxed font-normal"
                />
              </div>
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Use <code className="bg-gray-200 px-1 rounded">{"{{...}}"}</code> to add variables. <span className="text-blue-500 cursor-pointer">Learn more</span>
                </div>
              </div>
            </div>

            {/* Welcome Message Section */}
            <div className="space-y-4">
               <div>
                 <h2 className="text-lg font-bold text-gray-800">Welcome Message</h2>
                 <p className="text-xs text-gray-500">Pick what happens when the call starts.</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, start_speaker: 'agent' }))}
                   className={`p-6 rounded-[28px] border-2 transition-all text-left relative outline-none ${
                     formData.start_speaker === 'agent' 
                     ? 'border-blue-500 bg-blue-50/30 shadow-sm' 
                     : 'border-gray-100 bg-white hover:border-blue-100 shadow-sm'
                   }`}
                 >
                   <div className="flex justify-between items-start mb-4">
                     <h4 className={`font-bold text-[15px] ${formData.start_speaker === 'agent' ? 'text-blue-600' : 'text-gray-900'}`}>AI speaks first</h4>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.start_speaker === 'agent' ? 'border-blue-500 bg-blue-500' : 'border-gray-100'}`}>
                       {formData.start_speaker === 'agent' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                     </div>
                   </div>
                   <textarea 
                     name="begin_message"
                     value={formData.begin_message}
                     onChange={handleInputChange}
                     disabled={formData.start_speaker !== 'agent'}
                     className={`w-full bg-white/50 border border-gray-100 rounded-2xl p-4 text-[13px] font-medium outline-none h-24 resize-none transition-all focus:bg-white focus:border-blue-100 placeholder:text-gray-300 ${formData.start_speaker !== 'agent' ? 'opacity-50' : ''}`}
                     placeholder="e.g. Hello, how can I help you today?"
                   />
                 </button>

                 <button 
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, start_speaker: 'user', begin_message: '' }))}
                   className={`p-6 rounded-[28px] border-2 transition-all text-left relative outline-none ${
                     formData.start_speaker === 'user' 
                     ? 'border-blue-500 bg-blue-50/30 shadow-sm' 
                     : 'border-gray-100 bg-white hover:border-blue-100 shadow-sm'
                   }`}
                 >
                   <div className="flex justify-between items-start mb-4">
                     <h4 className={`font-bold text-[15px] ${formData.start_speaker === 'user' ? 'text-blue-600' : 'text-gray-900'}`}>User speaks first</h4>
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.start_speaker === 'user' ? 'border-blue-500 bg-blue-500' : 'border-gray-100'}`}>
                       {formData.start_speaker === 'user' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                     </div>
                   </div>
                   <p className="text-[13px] text-gray-500 font-medium leading-relaxed mt-2">Agent will wait for user to speak before responding.</p>
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Accordions */}
        <div className="w-[400px] bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-2">
          
          {/* Functions / Tools Section */}
          <div className="border border-gray-100 rounded-2xl relative">
            <button 
              onClick={() => toggleSection('functions')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <Wrench className="w-4 h-4 text-blue-500" />
                <span>Functions</span>
              </div>
              {expandedSections.functions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.functions && (
              <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                  Enable your agent with capabilities such as calendar bookings, call termination, etc.
                </p>
                <div className="space-y-3">
                  {formData.general_tools.map((tool, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-gray-200 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-50">
                          {tool.type === 'end_call' && <Mic className="w-4 h-4 text-gray-500" />}
                          {tool.type === 'transfer_call' && <Headphones className="w-4 h-4 text-blue-500" />}
                          {tool.type === 'press_digit' && <Database className="w-4 h-4 text-purple-500" />}
                          {tool.type === 'custom' && <Wrench className="w-4 h-4 text-orange-500" />}
                          {!['end_call', 'transfer_call', 'press_digit', 'custom'].includes(tool.type) && <Wrench className="w-4 h-4 text-gray-400" />}
                        </div>
                        <span className="text-[13px] font-bold text-gray-700">{tool.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setActiveConfigTool({ ...tool, index: idx });
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemoveTool(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="relative pt-2">
                    <button 
                      onClick={() => setFunctionsDropdownOpen(!functionsDropdownOpen)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>

                    {functionsDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setFunctionsDropdownOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 py-3 animate-in fade-in zoom-in-95 duration-200">
                          {[
                            { label: 'End Call', icon: Mic, type: 'end_call' },
                            { label: 'Call Transfer', icon: Headphones, type: 'transfer_call' },
                            { label: 'Agent Transfer', icon: Mic, type: 'agent_transfer' },
                            { label: 'Check Calendar Availability (Cal.com)', icon: Database, type: 'check_availability_cal' },
                            { label: 'Book on the Calendar (Cal.com)', icon: Database, type: 'book_appointment_cal' },
                            { label: 'Press Digit (IVR Navigation)', icon: Database, type: 'press_digit' },
                            { label: 'Send SMS', icon: MessageSquare, type: 'send_sms' },
                            { label: 'Extract Dynamic Variable', icon: Database, type: 'extract_dynamic_variable' },
                            { label: 'Custom Function', icon: Wrench, type: 'custom' }
                          ].map((type) => (
                            <button
                              key={type.type}
                              onClick={() => {
                                const name = prompt(`Enter function name:`);
                                if (name) {
                                  setFormData(prev => ({
                                    ...prev,
                                    general_tools: [...prev.general_tools, { 
                                      name: name.toLowerCase().replace(/\s+/g, '_'), 
                                      type: type.type,
                                      description: `Function for ${name}`
                                    }]
                                  }));
                                }
                                setFunctionsDropdownOpen(false);
                              }}
                              className="w-full text-left px-5 py-2.5 hover:bg-gray-50 flex items-center space-x-4 transition-colors group"
                            >
                              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                                <type.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                              </div>
                              <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Knowledge Base Section */}
          <div className="border border-gray-100 rounded-2xl relative">
            <button 
              onClick={() => toggleSection('knowledgeBase')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Knowledge Base</span>
              </div>
              {expandedSections.knowledgeBase ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.knowledgeBase && (
              <div className="p-4 space-y-4">
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Add knowledge base to provide context to the agent.
                </p>
                
                <div className="space-y-3">
                  {/* Selected KBs */}
                  <div className="flex flex-wrap gap-2">
                    {formData.knowledge_base_ids.map(kbId => {
                      const kb = availableKbs.find(k => k.knowledge_base_id === kbId);
                      return (
                        <div key={kbId} className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 group">
                          <Database className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{kb?.knowledge_base_name || kb?.name || kbId}</span>
                          <button 
                            onClick={() => setFormData(prev => ({ ...prev, knowledge_base_ids: prev.knowledge_base_ids.filter(id => id !== kbId) }))}
                            className="p-0.5 hover:bg-emerald-100 rounded-md transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setKbDropdownOpen(!kbDropdownOpen)}
                      className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>

                    {kbDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setKbDropdownOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                          {availableKbs.filter(kb => !formData.knowledge_base_ids.includes(kb.knowledge_base_id)).map(kb => (
                            <button
                              key={kb.knowledge_base_id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, knowledge_base_ids: [...prev.knowledge_base_ids, kb.knowledge_base_id] }));
                                setKbDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                            >
                              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                <Database className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-sm font-bold text-gray-700 truncate">{kb.knowledge_base_name || kb.name}</span>
                            </button>
                          ))}
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button
                            onClick={() => navigate('/knowledge-base')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors text-blue-600"
                          >
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold">Add New Knowledge Base</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Retrieval Settings Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={() => {
                        setTempKbConfig(formData.kb_config);
                        setKbSettingsOpen(true);
                      }}
                      className="text-xs font-bold text-gray-600 hover:text-blue-600 flex items-center space-x-2 transition-colors group"
                    >
                      <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                      <span>Adjust KB Retrieval Chunks and Similarity</span>
                    </button>
                  </div>

                  {/* Retrieval Settings Popover */}
                  {kbSettingsOpen && (
                    <>
                      <div className="fixed inset-0 bg-black/5 z-40 backdrop-blur-[1px]" onClick={() => setKbSettingsOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-[28px] shadow-2xl z-50 p-6 space-y-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[15px] font-bold text-gray-900">Chunks to retrieve</h4>
                            <span className="text-sm font-bold text-gray-900">{tempKbConfig.top_k}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">The max number of chunks to retrieve from the KB, range 1-10.</p>
                          <input 
                            type="range" 
                            min="1" max="10" step="1"
                            value={tempKbConfig.top_k}
                            onChange={(e) => setTempKbConfig(prev => ({ ...prev, top_k: Number(e.target.value) }))}
                            className="w-full accent-gray-900 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[15px] font-bold text-gray-900">Similarity Threshold</h4>
                          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Adjust how strict the system is when matching chunks to the context. A higher setting gives you fewer, but more similar, matches</p>
                          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-2xl p-1">
                            <button 
                              onClick={() => setTempKbConfig(prev => ({ ...prev, filter_score: Math.max(0, Number((prev.filter_score - 0.01).toFixed(2))) }))}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all font-bold text-gray-400 hover:text-gray-900"
                            >
                              -
                            </button>
                            <input 
                              type="text"
                              value={tempKbConfig.filter_score.toFixed(2)}
                              readOnly
                              className="flex-1 bg-transparent text-center font-bold text-gray-900 text-[15px] outline-none"
                            />
                            <button 
                              onClick={() => setTempKbConfig(prev => ({ ...prev, filter_score: Math.min(1, Number((prev.filter_score + 0.01).toFixed(2))) }))}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all font-bold text-gray-400 hover:text-gray-900"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-2">
                          <button 
                            onClick={() => setKbSettingsOpen(false)}
                            className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              setFormData(prev => ({ ...prev, kb_config: tempKbConfig }));
                              setKbSettingsOpen(false);
                              toast.success('Retreival settings updated');
                            }}
                            className="px-8 py-2.5 bg-gray-900 text-white rounded-[14px] text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Realtime Settings Section */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button 
              onClick={() => toggleSection('speech')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <Mic className="w-4 h-4 text-purple-500" />
                <span>Speech & Realtime</span>
              </div>
              {expandedSections.speech ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.speech && (
              <div className="p-4 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">High Priority Mode</span>
                    <input 
                      type="checkbox" 
                      name="model_high_priority"
                      checked={formData.model_high_priority}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-blue-600" 
                    />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Strict Tool Calling</span>
                    <input 
                      type="checkbox" 
                      name="tool_call_strict_mode"
                      checked={formData.tool_call_strict_mode}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-blue-600" 
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Temperature ({formData.model_temperature})</label>
                    <input 
                      type="range" 
                      name="model_temperature"
                      min="0" max="1" step="0.1" 
                      value={formData.model_temperature}
                      onChange={handleInputChange}
                      className="w-full accent-blue-600"
                    />
                 </div>
              </div>
            )}
          </div>

          {/* Call Settings Section */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button 
              onClick={() => toggleSection('advanced')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <Headphones className="w-4 h-4 text-indigo-500" />
                <span>Call Settings</span>
              </div>
              {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.advanced && (
              <div className="p-4 space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Silence Timeout (ms)</label>
                    <input 
                      type="number"
                      name="begin_after_user_silence_ms"
                      value={formData.begin_after_user_silence_ms}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-sm outline-none"
                    />
                 </div>
              </div>
            )}
          </div>

          {/* Post-Call Analysis */}
          <div className="border border-gray-100 rounded-2xl relative">
            <button 
              onClick={() => toggleSection('advanced')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <FileJson className="w-4 h-4 text-orange-500" />
                <span>Post-Call Data Extraction</span>
              </div>
              {expandedSections.advanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.advanced && (
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[13px] font-bold text-gray-900">Post Call Data Retrieval</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Define the information that you need to extract from the voice. <span className="text-blue-500 cursor-pointer">Learn more</span></p>
                </div>
                
                <div className="space-y-2">
                  {formData.post_call_analysis_data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                      <div className="flex items-center space-x-3">
                        <MoreVertical className="w-4 h-4 text-gray-300" />
                        <span className="text-xs font-bold text-gray-700">
                          {item.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-900" />
                        <Trash2 
                          className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-red-500" 
                          onClick={() => setFormData(prev => ({ ...prev, post_call_analysis_data: prev.post_call_analysis_data.filter((_, i) => i !== idx) }))}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center space-x-3 mt-4">
                    <div className="relative">
                      <button 
                        onClick={() => setPostCallDropdownOpen(!postCallDropdownOpen)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                      
                      {postCallDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setPostCallDropdownOpen(false)}></div>
                          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                            {[
                              { label: 'Text', icon: MessageSquare, type: 'text' },
                              { label: 'Selector', icon: LayoutDashboard, type: 'selector' },
                              { label: 'Boolean', icon: Check, type: 'boolean' },
                              { label: 'Number', icon: Database, type: 'number' }
                            ].map((type) => (
                              <button
                                key={type.type}
                                onClick={() => {
                                  const name = prompt(`Enter ${type.label} name:`);
                                  if (name) {
                                    setFormData(prev => ({
                                      ...prev,
                                      post_call_analysis_data: [...prev.post_call_analysis_data, { 
                                        name: name.toLowerCase().replace(/\s+/g, '_'), 
                                        type: type.type,
                                        description: `Extraction for ${name}`
                                      }]
                                    }));
                                  }
                                  setPostCallDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                              >
                                <type.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                <span className="text-sm font-bold text-gray-700">{type.label}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-xl bg-white">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <select 
                        value={formData.post_call_analysis_model}
                        onChange={(e) => setFormData(prev => ({ ...prev, post_call_analysis_model: e.target.value }))}
                        className="text-sm font-bold text-gray-700 outline-none bg-transparent"
                      >
                        <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                        <option value="gpt-4.1">GPT-4.1</option>
                        <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Webhook Settings Section */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button 
              onClick={() => toggleSection('webhooks')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <Webhook className="w-4 h-4 text-blue-400" />
                <span>Webhook Settings</span>
              </div>
              {expandedSections.webhooks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.webhooks && (
              <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[15px] font-bold text-gray-900">Agent Level Webhook URL</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Webhook URL to receive events from Retell. <span className="text-blue-500 cursor-pointer">Learn more</span></p>
                  </div>
                  <input 
                    type="url"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-gray-300"
                    placeholder="https://your-api.com/webhooks/retell"
                  />
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[15px] font-bold text-gray-900">Webhook Timeout</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">Set the maximum time to wait for a webhook response before timing out.</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formData.webhook_timeout_ms / 1000} s</span>
                  </div>
                  <div className="pt-2">
                    <input 
                      type="range" 
                      min="1000" max="10000" step="1000"
                      value={formData.webhook_timeout_ms}
                      onChange={(e) => setFormData(prev => ({ ...prev, webhook_timeout_ms: Number(e.target.value) }))}
                      className="w-full accent-gray-900 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MCPs section */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button 
              onClick={() => toggleSection('mcp')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span>MCPs</span>
              </div>
              {expandedSections.mcp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.mcp && (
              <div className="p-4">
                 <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-relaxed font-medium">Model Context Protocol allows your agent to connect to remote data sources.</p>
                 </div>
                 <button className="w-full mt-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 border-dashed">Connect MCP Server</button>
              </div>
            )}
          </div>

        </div>
      </div>
      {/* Tool Configuration Modal */}
      {activeConfigTool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveConfigTool(null)}></div>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  {activeConfigTool.type === 'extract_dynamic_variable' ? <Database className="w-5 h-5 text-gray-600" /> : <Wrench className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {activeConfigTool.type === 'extract_dynamic_variable' ? 'Extract Dynamic Variable' : 'Configure Tool'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Extract variables so they can be used in subsequent dialogue steps.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveConfigTool(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900">Function Name</label>
                <input 
                  value={activeConfigTool.name}
                  onChange={(e) => setActiveConfigTool({ ...activeConfigTool, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  placeholder="e.g. extract_user_details"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900">Description</label>
                <textarea 
                  value={activeConfigTool.description}
                  onChange={(e) => setActiveConfigTool({ ...activeConfigTool, description: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-gray-300 min-h-[100px] resize-none"
                  placeholder="e.g. Extract the user's details like name, email, age, etc. from the conversation"
                />
              </div>

              {activeConfigTool.type === 'extract_dynamic_variable' && (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-900">Variables</label>
                  <div className="space-y-2">
                    {/* Variable List Placeholder */}
                    <button 
                      onClick={() => setIsVarModalOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setActiveConfigTool(null)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const updatedTools = [...formData.general_tools];
                  const { index, ...toolData } = activeConfigTool;
                  updatedTools[index] = toolData;
                  setFormData(prev => ({ ...prev, general_tools: updatedTools }));
                  setActiveConfigTool(null);
                  toast.success('Tool configuration saved');
                }}
                className="px-8 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variables Sub-Modal */}
      {isVarModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsVarModalOpen(false)}></div>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Variables</h3>
                <button onClick={() => setIsVarModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900">Variable Name</label>
                  <input 
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                    placeholder="e.g. email / age"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900">Variable Description</label>
                  <textarea 
                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                    placeholder="e.g. Extract the user's email address from the conversation"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900">Variable Type <span className="text-gray-400 font-medium">(Optional)</span></label>
                  <select className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                    <option>Text</option>
                    <option>Number</option>
                    <option>Boolean</option>
                    <option>Enum</option>
                  </select>
                </div>
             </div>
             <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button onClick={() => setIsVarModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                <button onClick={() => setIsVarModalOpen(false)} className="px-8 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all">Save</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMEditor;
