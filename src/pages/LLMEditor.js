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
  X, Search, Sliders, ExternalLink, RefreshCw, Layers
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
          
          // Basic validation & Sanitization based on Retell OpenAPI Schema
          if (cleanTool.type === 'transfer_call') {
            if (!cleanTool.transfer_destination || typeof cleanTool.transfer_destination === 'string') {
              cleanTool.transfer_destination = {
                type: 'predefined',
                number: cleanTool.transfer_destination || '+1234567890'
              };
            }
            if (!cleanTool.transfer_option) {
              cleanTool.transfer_option = {
                type: 'cold_transfer',
                show_transferee_as_caller: false
              };
            }
          }

          if (cleanTool.type === 'agent_transfer') {
            // AgentSwapTool in OpenAPI
            if (!cleanTool.agent_id) cleanTool.agent_id = 'default_agent_id';
            if (!cleanTool.post_call_analysis_setting) cleanTool.post_call_analysis_setting = 'both_agents';
          }

          if (['check_availability_cal', 'book_appointment_cal'].includes(cleanTool.type)) {
            if (!cleanTool.cal_api_key) cleanTool.cal_api_key = 'default_key';
            if (!cleanTool.event_type_id) cleanTool.event_type_id = 12345;
          }

          if (cleanTool.type === 'send_sms') {
            if (!cleanTool.sms_content || typeof cleanTool.sms_content === 'string') {
              cleanTool.sms_content = {
                type: 'predefined',
                content: cleanTool.sms_content || 'Default SMS content'
              };
            }
          }

          if (cleanTool.type === 'extract_dynamic_variable') {
            if (!cleanTool.variables) cleanTool.variables = [];
            // AnalysisData in OpenAPI
          }

          if (cleanTool.type === 'custom') {
            if (!cleanTool.url) throw new Error(`Custom tool "${cleanTool.name}" requires a URL`);
            if (!cleanTool.description) throw new Error(`Custom tool "${cleanTool.name}" requires a description`);
            
            // speak_after_execution is required in OpenAPI
            if (cleanTool.speak_after_execution === undefined) {
              cleanTool.speak_after_execution = true;
            }

            // Ensure URL has a protocol to avoid "Invalid hostname"
            if (cleanTool.url && !cleanTool.url.startsWith('http')) {
              cleanTool.url = 'https://' + cleanTool.url;
            }

            // 1. Convert parameters (JSON string or Sample Object) to valid JSON Schema
            if (typeof cleanTool.parameters === 'string' && cleanTool.parameters.trim()) {
              try {
                const parsed = JSON.parse(cleanTool.parameters);
                
                // Smart Inference: If it-s just a plain object (like {"date": "2025"}), convert to schema
                if (parsed && typeof parsed === 'object' && !parsed.type && !parsed.properties) {
                   const inferSchema = (obj) => {
                     const properties = {};
                     const required = [];
                     Object.keys(obj).forEach(key => {
                       const val = obj[key];
                       let type = 'string';
                       if (typeof val === 'number') type = 'number';
                       else if (typeof val === 'boolean') type = 'boolean';
                       else if (Array.isArray(val)) type = 'array';
                       else if (val && typeof val === 'object') type = 'object';
                       
                       properties[key] = { 
                         type, 
                         description: `The ${key} parameter`
                       };
                       required.push(key);
                     });
                     return { type: 'object', properties, required };
                   };
                   cleanTool.parameters = inferSchema(parsed);
                } else {
                  // Already a schema or nested
                  cleanTool.parameters = {
                    type: "object",
                    properties: parsed.properties || parsed || {},
                    required: Array.isArray(parsed.required) ? parsed.required : []
                  };
                }
              } catch (e) {
                throw new Error(`Invalid JSON in parameters for tool "${cleanTool.name}"`);
              }
            } else if (Array.isArray(cleanTool.parametersForm) && cleanTool.parametersForm.length > 0) {
              // Convert Form data to Schema
              const properties = {};
              const required = [];
              cleanTool.parametersForm.forEach(p => {
                if (p.name) {
                  properties[p.name] = {
                    type: p.type || 'string',
                    description: p.detail_mode === 'description' ? p.detail_content : '',
                    // Retell also allows 'example' or similar if detail_mode is 'value'
                    ...(p.detail_mode === 'value' ? { default: p.detail_content } : {})
                  };
                  if (p.required) required.push(p.name);
                }
              });
              cleanTool.parameters = { type: 'object', properties, required };
            } else if (!cleanTool.parameters || (typeof cleanTool.parameters === 'object' && Object.keys(cleanTool.parameters).length === 0)) {
              delete cleanTool.parameters;
            }

            // Clean up UI-only fields
            delete cleanTool.parameterViewMode;
            delete cleanTool.parametersForm;

            // 2. Convert headers/query_params arrays to objects
            // Rename internal 'query_parameters' to API's 'query_params'
            const qParams = cleanTool.query_params || cleanTool.query_parameters;
            
            if (Array.isArray(cleanTool.headers)) {
              cleanTool.headers = cleanTool.headers.reduce((acc, curr) => {
                if (curr.key && curr.key.trim()) acc[curr.key] = curr.value || '';
                return acc;
              }, {});
            }
            if (Array.isArray(qParams)) {
              cleanTool.query_params = qParams.reduce((acc, curr) => {
                if (curr.key && curr.key.trim()) acc[curr.key] = curr.value || '';
                return acc;
              }, {});
              delete cleanTool.query_parameters; // Remove internal key
            }

            // 3. Convert response_variables array to object (key -> path)
            if (Array.isArray(cleanTool.response_variables)) {
              cleanTool.response_variables = cleanTool.response_variables.reduce((acc, curr) => {
                if (curr.key && curr.key.trim()) acc[curr.key] = curr.value || '';
                return acc;
              }, {});
            }

            // Optional fields cleaning
            if (!cleanTool.headers || Object.keys(cleanTool.headers).length === 0) delete cleanTool.headers;
            if (!cleanTool.query_params || Object.keys(cleanTool.query_params).length === 0) delete cleanTool.query_params;
            if (!cleanTool.response_variables || Object.keys(cleanTool.response_variables).length === 0) delete cleanTool.response_variables;
          }

          // Clean up empty fields to avoid validation noise
          Object.keys(cleanTool).forEach(key => {
            if (cleanTool[key] === null || cleanTool[key] === undefined || cleanTool[key] === '') {
              // Only delete if it's not a root required field or if it's safe to omit
              if (key !== 'name' && key !== 'type') {
                 delete cleanTool[key];
              }
            }
          });

          return cleanTool;
        });
      } else {
        delete payload.general_tools;
      }

      // Remove non-RetellLLM fields that might have been added to UI
      delete payload.webhook_url;
      delete payload.webhook_timeout_ms;
      delete payload.post_call_analysis_data;
      delete payload.post_call_analysis_model;
      delete payload.name; // Retell LLM creation doesn't use 'name' in payload, only LLM ID is used for updates

      if (payload.knowledge_base_ids && payload.knowledge_base_ids.length === 0) delete payload.knowledge_base_ids;
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
                            { label: 'Press Digit (IVR Navigation)', icon: LayoutDashboard, type: 'press_digit' },
                            { label: 'Send SMS', icon: MessageSquare, type: 'send_sms' },
                            { label: 'Extract Dynamic Variable', icon: Layers, type: 'extract_dynamic_variable' },
                            { label: 'Custom Function', icon: Wrench, type: 'custom' }
                          ].map((type) => (
                            <button
                              key={type.type}
                              onClick={() => {
                                const tempId = `tool_${Date.now()}`;
                                const baseTool = {
                                  name: type.label.toLowerCase().replace(/\s+/g, '_'), 
                                  type: type.type,
                                  description: `Function for ${type.label}`
                                };

                                // Advanced fields for custom tools
                                if (type.type === 'custom') {
                                  Object.assign(baseTool, {
                                    method: 'POST',
                                    url: '',
                                    timeout_ms: 120000,
                                    headers: [],
                                    query_parameters: [],
                                    parameters: JSON.stringify({
                                      properties: {}
                                    }, null, 2),
                                    parameterViewMode: 'json',
                                    parametersForm: [],
                                    response_variables: [],
                                    speak_during_execution: false,
                                    speak_after_execution: true,
                                    description: `Custom function for ${type.label}`
                                  });
                                }

                                setFormData(prev => {
                                  const updatedTools = [...prev.general_tools, baseTool];
                                  const newIndex = updatedTools.length - 1;
                                  
                                  // Auto-open modal after adding
                                  setTimeout(() => {
                                    setActiveConfigTool({ ...baseTool, index: newIndex });
                                  }, 0);

                                  return {
                                    ...prev,
                                    general_tools: updatedTools
                                  };
                                });
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
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  {activeConfigTool.type === 'extract_dynamic_variable' ? <Database className="w-5 h-5 text-gray-600" /> : <Wrench className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {activeConfigTool.type === 'extract_dynamic_variable' ? 'Extract Dynamic Variable' : 
                     activeConfigTool.type === 'custom' ? 'Custom Function' : 'Configure Tool'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {activeConfigTool.type === 'custom' ? 'Connect to external APIs and services.' : 'Configure the behavior of this tool.'}
                  </p>
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
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Common Fields: Name & Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">Name</label>
                  <input 
                    value={activeConfigTool.name}
                    onChange={(e) => setActiveConfigTool({ ...activeConfigTool, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all border border-gray-100"
                    placeholder="Enter function name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">Description</label>
                  <textarea 
                    value={activeConfigTool.description}
                    onChange={(e) => setActiveConfigTool({ ...activeConfigTool, description: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all border border-gray-100 min-h-[80px] resize-none"
                    placeholder="Enter the description"
                  />
                </div>
              </div>

              {activeConfigTool.type === 'custom' && (
                <div className="space-y-8 pt-4">
                  {/* API Endpoint */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">API Endpoint</label>
                      <p className="text-[11px] text-gray-500 font-medium ml-1">The API Endpoint is the address of the service you are connecting to</p>
                    </div>
                    <div className="flex space-x-2">
                      <select 
                        value={activeConfigTool.method || 'POST'}
                        onChange={(e) => setActiveConfigTool({ ...activeConfigTool, method: e.target.value })}
                        className="w-28 px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-bold outline-none border border-gray-100"
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <input 
                        value={activeConfigTool.url || ''}
                        onChange={(e) => setActiveConfigTool({ ...activeConfigTool, url: e.target.value })}
                        className="flex-1 px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all border border-gray-100"
                        placeholder="Enter the URL of the custom function"
                      />
                    </div>
                  </div>

                  {/* Timeout */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">Timeout (ms)</label>
                    <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 rounded-2xl p-1">
                      <input 
                        type="number"
                        value={activeConfigTool.timeout_ms || 120000}
                        onChange={(e) => setActiveConfigTool({ ...activeConfigTool, timeout_ms: Number(e.target.value) })}
                        className="flex-1 px-5 py-2.5 bg-transparent text-[15px] font-medium outline-none"
                      />
                      <span className="text-[13px] font-bold text-gray-400 border-l border-gray-200 pl-4 py-2 pr-4">milliseconds</span>
                    </div>
                  </div>

                  {/* Headers & Query Params */}
                  {['headers', 'query_parameters'].map((key) => (
                    <div key={key} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                          {key === 'headers' ? 'Headers' : 'Query Parameters'}
                        </label>
                        <p className="text-[11px] text-gray-500 font-medium ml-1">
                          {key === 'headers' ? 'Specify the HTTP headers required for your API request.' : 'Query string parameters to append to the URL.'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {(activeConfigTool[key] || []).map((item, i) => (
                          <div key={i} className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200">
                            <input 
                              placeholder="Key"
                              value={item.key}
                              onChange={(e) => {
                                const list = [...activeConfigTool[key]];
                                list[i].key = e.target.value;
                                setActiveConfigTool({ ...activeConfigTool, [key]: list });
                              }}
                              className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
                            />
                            <input 
                              placeholder="Value"
                              value={item.value}
                              onChange={(e) => {
                                const list = [...activeConfigTool[key]];
                                list[i].value = e.target.value;
                                setActiveConfigTool({ ...activeConfigTool, [key]: list });
                              }}
                              className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
                            />
                            <button 
                              onClick={() => {
                                const list = activeConfigTool[key].filter((_, idx) => idx !== i);
                                setActiveConfigTool({ ...activeConfigTool, [key]: list });
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const list = [...(activeConfigTool[key] || []), { key: '', value: '' }];
                            setActiveConfigTool({ ...activeConfigTool, [key]: list });
                          }}
                          className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>New key value pair</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Parameters (Optional) */}
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">Parameters (Optional)</label>
                        <div className="flex items-center space-x-6">
                          {/* Payload: args only toggle */}
                          <div className="flex items-center space-x-2">
                             <div className="flex items-center space-x-1.5 group/info relative">
                                <span className="text-[11px] font-bold text-gray-700">Payload: args only</span>
                                <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50">
                                   If enabled, parameters will be passed as a root-level JSON object instead of nested under "args".
                                </div>
                             </div>
                             <button 
                                onClick={() => setActiveConfigTool({ ...activeConfigTool, args_at_root: !activeConfigTool.args_at_root })}
                                className={`w-10 h-5 rounded-full relative transition-all duration-200 ${activeConfigTool.args_at_root ? 'bg-gray-900' : 'bg-gray-200'}`}
                             >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${activeConfigTool.args_at_root ? 'left-6' : 'left-1'}`} />
                             </button>
                          </div>

                          <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button 
                              onClick={() => setActiveConfigTool({ ...activeConfigTool, parameterViewMode: 'json' })}
                              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeConfigTool.parameterViewMode === 'json' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                              JSON
                            </button>
                            <button 
                              onClick={() => {
                                // If switching to form, try to initialize it from JSON if empty
                                let newForm = activeConfigTool.parametersForm || [];
                                if (newForm.length === 0 && activeConfigTool.parameters) {
                                   try {
                                      const parsed = JSON.parse(activeConfigTool.parameters);
                                      const props = parsed.properties || parsed || {};
                                      const required = Array.isArray(parsed.required) ? parsed.required : [];
                                      newForm = Object.keys(props).map(key => ({
                                         name: key,
                                         type: props[key].type || 'string',
                                         detail_mode: 'description',
                                         detail_content: props[key].description || props[key].default || '',
                                         required: required.includes(key)
                                      }));
                                   } catch(e) {}
                                }
                                setActiveConfigTool({ 
                                  ...activeConfigTool, 
                                  parameterViewMode: 'form',
                                  parametersForm: newForm 
                                });
                              }}
                              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeConfigTool.parameterViewMode === 'form' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                              Form
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium ml-1">JSON schema that defines the format in which the LLM will return. Please refer to the <span className="text-blue-500 cursor-pointer underline">docs</span>.</p>
                    </div>

                    {activeConfigTool.parameterViewMode === 'form' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-[1fr,1.5fr,120px,80px,40px] gap-4 px-1">
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Parameter Name</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detail</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Required</span>
                           <span></span>
                        </div>
                        <div className="space-y-2">
                           {(activeConfigTool.parametersForm || []).map((p, idx) => (
                              <div key={idx} className="grid grid-cols-[1fr,1.5fr,120px,80px,40px] gap-2 items-center animate-in slide-in-from-left-2 duration-200">
                                 <input 
                                    value={p.name}
                                    onChange={(e) => {
                                      const newList = [...activeConfigTool.parametersForm];
                                      newList[idx].name = e.target.value;
                                      setActiveConfigTool({ ...activeConfigTool, parametersForm: newList });
                                    }}
                                    placeholder="field1"
                                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-medium"
                                 />
                                 <div className="flex items-center space-x-1">
                                    <div className="relative group/detail">
                                       <button className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 flex items-center space-x-1 min-w-[100px] justify-between">
                                          <span>{p.detail_mode.charAt(0).toUpperCase() + p.detail_mode.slice(1)}</span>
                                          <ChevronDown className="w-3 h-3 text-gray-400" />
                                       </button>
                                       <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 opacity-0 pointer-events-none group-hover/detail:opacity-100 group-hover/detail:pointer-events-auto transition-all">
                                          {['description', 'value'].map(m => (
                                             <button 
                                                key={m}
                                                onClick={() => {
                                                  const newList = [...activeConfigTool.parametersForm];
                                                  newList[idx].detail_mode = m;
                                                  setActiveConfigTool({ ...activeConfigTool, parametersForm: newList });
                                                }}
                                                className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                             >
                                                <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                                                {p.detail_mode === m && <Check className="w-3 h-3 text-blue-500" />}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                    <input 
                                       value={p.detail_content}
                                       onChange={(e) => {
                                         const newList = [...activeConfigTool.parametersForm];
                                         newList[idx].detail_content = e.target.value;
                                         setActiveConfigTool({ ...activeConfigTool, parametersForm: newList });
                                       }}
                                       placeholder="Description"
                                       className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-medium"
                                    />
                                 </div>
                                 <select 
                                    value={p.type}
                                    onChange={(e) => {
                                      const newList = [...activeConfigTool.parametersForm];
                                      newList[idx].type = e.target.value;
                                      setActiveConfigTool({ ...activeConfigTool, parametersForm: newList });
                                    }}
                                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer font-medium"
                                 >
                                    <option value="string">string</option>
                                    <option value="number">number</option>
                                    <option value="boolean">boolean</option>
                                    <option value="array">array</option>
                                    <option value="object">object</option>
                                 </select>
                                 <div className="flex justify-center">
                                    <input 
                                       type="checkbox"
                                       checked={p.required}
                                       onChange={(e) => {
                                         const newList = [...activeConfigTool.parametersForm];
                                         newList[idx].required = e.target.checked;
                                         setActiveConfigTool({ ...activeConfigTool, parametersForm: newList });
                                       }}
                                       className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                                    />
                                 </div>
                                 <button 
                                    onClick={() => {
                                       const newList = activeConfigTool.parametersForm.filter((_, i) => i !== idx);
                                       setActiveConfigTool({ ...activeConfigTool, parametersForm: newList });
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                           <button 
                              onClick={() => {
                                 const newList = [...(activeConfigTool.parametersForm || []), { name: '', type: 'string', detail_mode: 'description', detail_content: '', required: false }];
                                 setActiveConfigTool({ ...activeConfigTool, parametersForm: newList });
                              }}
                              className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                           >
                              <Plus className="w-4 h-4" />
                              <span>Add</span>
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <textarea 
                          value={activeConfigTool.parameters || ''}
                          onChange={(e) => setActiveConfigTool({ ...activeConfigTool, parameters: e.target.value })}
                          className="w-full px-5 py-4 bg-[#1e293b] text-gray-100 rounded-2xl text-[13px] font-mono outline-none min-h-[200px] shadow-inner"
                          placeholder='{ "field1": "value" }'
                        />
                        <div className="absolute bottom-4 right-4 flex space-x-2">
                          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold text-white transition-all">example 1</button>
                          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold text-white transition-all">example 2</button>
                          <button 
                             onClick={() => {
                                try {
                                   const parsed = JSON.parse(activeConfigTool.parameters);
                                   setActiveConfigTool({ ...activeConfigTool, parameters: JSON.stringify(parsed, null, 2) });
                                } catch(e) {}
                             }}
                             className="px-12 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                          >
                             Format JSON
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Response Variables */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">Response Variables</label>
                      <p className="text-[11px] text-gray-500 font-medium ml-1">Extracted values from API response saved as dynamic variables.</p>
                    </div>
                    <div className="space-y-2">
                      {(activeConfigTool.response_variables || []).map((item, i) => (
                        <div key={i} className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200">
                          <input 
                            placeholder="Variable Name"
                            value={item.key}
                            onChange={(e) => {
                              const list = [...activeConfigTool.response_variables];
                              list[i].key = e.target.value;
                              setActiveConfigTool({ ...activeConfigTool, response_variables: list });
                            }}
                            className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
                          />
                          <input 
                            placeholder="JSON Path or Value"
                            value={item.value}
                            onChange={(e) => {
                              const list = [...activeConfigTool.response_variables];
                              list[i].value = e.target.value;
                              setActiveConfigTool({ ...activeConfigTool, response_variables: list });
                            }}
                            className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
                          />
                          <button 
                            onClick={() => {
                              const list = activeConfigTool.response_variables.filter((_, idx) => idx !== i);
                              setActiveConfigTool({ ...activeConfigTool, response_variables: list });
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const list = [...(activeConfigTool.response_variables || []), { key: '', value: '' }];
                          setActiveConfigTool({ ...activeConfigTool, response_variables: list });
                        }}
                        className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New key value pair</span>
                      </button>
                    </div>
                  </div>

                  {/* Speech Toggles */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox"
                        id="speak_during"
                        checked={activeConfigTool.speak_during_execution || false}
                        onChange={(e) => setActiveConfigTool({ ...activeConfigTool, speak_during_execution: e.target.checked })}
                        className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer"
                      />
                      <label htmlFor="speak_during" className="flex-1 cursor-pointer">
                        <p className="text-sm font-bold text-gray-900">Speak During Execution</p>
                        <p className="text-[11px] text-gray-500 font-medium">If the function takes over 2 seconds, the agent can say something like: "Let me check that for you."</p>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox"
                        id="args_at_root"
                        checked={activeConfigTool.args_at_root || false}
                        onChange={(e) => setActiveConfigTool({ ...activeConfigTool, args_at_root: e.target.checked })}
                        className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer"
                      />
                      <label htmlFor="args_at_root" className="flex-1 cursor-pointer">
                        <p className="text-sm font-bold text-gray-900">Arguments at Root</p>
                        <p className="text-[11px] text-gray-500 font-medium">If enabled, parameters will be passed as a root-level JSON object instead of nested under "args".</p>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox"
                        id="speak_after"
                        checked={activeConfigTool.speak_after_execution || false}
                        onChange={(e) => setActiveConfigTool({ ...activeConfigTool, speak_after_execution: e.target.checked })}
                        className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer"
                      />
                      <label htmlFor="speak_after" className="flex-1 cursor-pointer">
                        <p className="text-sm font-bold text-gray-900">Speak After Execution</p>
                        <p className="text-[11px] text-gray-500 font-medium">Unselect if you want to run the function silently, such as uploading the call result to the server silently.</p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

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
