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
    webhook_timeout_ms: 5000
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
      
      // Sanitization
      if (!payload.s2s_model) delete payload.s2s_model;
      if (payload.states && payload.states.length > 0) {
        if (!payload.starting_state || !payload.states.some(s => s.name === payload.starting_state)) {
          payload.starting_state = payload.states[0].name;
        }
      } else {
        delete payload.states;
        delete payload.starting_state;
      }
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
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              {isEditMode ? 'Law Firm Agent' : 'New Response Engine'}
              <Edit2 className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
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
                 <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-bold text-gray-700">AI speaks first</span>
                     <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                     </div>
                   </div>
                   <textarea 
                    name="begin_message"
                    value={formData.begin_message}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-600 outline-none"
                    placeholder="Enter welcome message..."
                   />
                 </div>
                 
                 <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">User speaks first</span>
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    </div>
                    <p className="text-xs text-gray-400">Agent will wait for user to speak before responding.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Accordions */}
        <div className="w-[400px] bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-2">
          
          {/* Functions / Tools Section */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
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
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 group space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Wrench className="w-3.5 h-3.5 text-gray-400" />
                          <input 
                            value={tool.name}
                            onChange={(e) => handleUpdateTool(idx, 'name', e.target.value)}
                            className="text-sm font-semibold text-gray-700 bg-transparent outline-none border-b border-transparent focus:border-blue-500 w-32"
                          />
                        </div>
                        <button onClick={() => handleRemoveTool(idx)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <select 
                        value={tool.type}
                        onChange={(e) => handleUpdateTool(idx, 'type', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-lg p-1.5 text-xs outline-none"
                      >
                        <option value="end_call">End Call</option>
                        <option value="transfer_call">Transfer Call</option>
                        <option value="press_digit">Press Digit</option>
                        <option value="custom">Custom Tool</option>
                      </select>

                      {tool.type === 'transfer_call' && (
                        <input 
                          value={tool.transfer_destination || ''}
                          onChange={(e) => handleUpdateTool(idx, 'transfer_destination', e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs outline-none"
                          placeholder="Phone number (e.g. +1...)"
                        />
                      )}

                      {(tool.type === 'custom') && (
                        <input 
                          value={tool.url || ''}
                          onChange={(e) => handleUpdateTool(idx, 'url', e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs outline-none"
                          placeholder="Webhook URL"
                        />
                      )}

                      <textarea 
                        value={tool.description}
                        onChange={(e) => handleUpdateTool(idx, 'description', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs outline-none resize-none"
                        placeholder="Tool description..."
                        rows={2}
                      />
                    </div>
                  ))}
                  <button 
                    onClick={handleAddTool}
                    className="w-full py-2.5 px-4 bg-white border border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-bold flex items-center justify-center space-x-2 hover:border-blue-300 hover:text-blue-500 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Function</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversation States Section */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button 
              onClick={() => toggleSection('states')}
              className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
                <LayoutDashboard className="w-4 h-4 text-orange-500" />
                <span>Conversation Flow (States)</span>
              </div>
              {expandedSections.states ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.states && (
              <div className="p-4 space-y-4">
                <p className="text-[11px] text-gray-500">Break down complex calls into distinct states.</p>
                <div className="space-y-4">
                  {formData.states.length > 0 && (
                    <div className="space-y-1 p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                      <label className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">Starting State</label>
                      <select 
                        value={formData.starting_state}
                        onChange={(e) => setFormData({...formData, starting_state: e.target.value})}
                        className="w-full bg-white border border-orange-200 rounded-lg p-1.5 text-xs outline-none font-bold text-gray-700"
                      >
                        <option value="">Select starting state...</option>
                        {formData.states.map((state, idx) => (
                          <option key={idx} value={state.name}>{state.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.states.map((state, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3 group">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
                            <input 
                              value={state.name}
                              onChange={(e) => {
                                const updatedStates = [...formData.states];
                                updatedStates[idx].name = e.target.value;
                                setFormData({...formData, states: updatedStates});
                              }}
                              className="text-sm font-bold text-gray-700 bg-transparent outline-none border-b border-transparent focus:border-blue-500 w-full"
                              placeholder="State Name"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              setFormData({
                                ...formData,
                                states: formData.states.filter((_, i) => i !== idx)
                              });
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                       <textarea 
                        value={state.state_prompt}
                        onChange={(e) => {
                          const updatedStates = [...formData.states];
                          updatedStates[idx].state_prompt = e.target.value;
                          setFormData({...formData, states: updatedStates});
                        }}
                        className="w-full bg-white border border-gray-100 rounded-lg p-2 text-xs outline-none resize-none"
                        placeholder="State specific prompt..."
                        rows={3}
                       />
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newStateName = `state_${formData.states.length+1}`;
                      setFormData({
                        ...formData,
                        states: [...formData.states, { name: newStateName, state_prompt: '', edges: [], tools: [] }],
                        starting_state: formData.starting_state || newStateName
                      });
                    }}
                    className="w-full py-2 px-4 bg-white border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs font-bold hover:border-blue-300 hover:text-blue-500 transition-all"
                  >
                    Add State
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Knowledge Base Section */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden overflow-visible relative">
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
          <div className="border border-gray-100 rounded-2xl overflow-hidden overflow-visible relative">
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
    </div>
  );
};

export default LLMEditor;
