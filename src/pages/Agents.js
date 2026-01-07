import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Mic, Trash2 } from 'lucide-react';
import agentService from '../services/agentService';
import CreateAgentModal from '../components/agents/CreateAgentModal';
import { useToast } from '../context/ToastContext';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const data = await agentService.getAllAgents();
      // Ensure data is an array, handle if wrapped in data object
      setAgents(Array.isArray(data) ? data : data.agents || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError('Failed to load agents.');
      toast.error('Failed to fetch agents');
      // Mock data for development if API fails or is not ready
      // setAgents([
      //   { _id: '1', name: 'Sales Assistant', type: 'voice', status: 'active', createdAt: new Date().toISOString() },
      //   { _id: '2', name: 'Support Bot', type: 'voice', status: 'inactive', createdAt: new Date().toISOString() }
      // ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentCreated = (newAgent) => {
    setAgents([newAgent, ...agents]);
    setIsModalOpen(false);
    toast.success('Agent created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
           <p className="text-gray-500 mt-1">Manage your voice agents and their configurations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Agent
        </button>
      </div>

      {/* Filters / Search Bar (Optional but good for UI) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search agents..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading agents...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
           <p className="text-red-500 font-medium">{error}</p>
           <button onClick={fetchAgents} className="mt-3 text-blue-600 hover:text-blue-800 font-medium underline">Retry Connection</button>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Mic className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No agents found</h3>
          <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Create your first voice agent to start handling calls.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Create Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.agent_id || agent._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between h-full group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-blue-50 text-blue-700`}>
                    {agent.channel || 'Voice'}
                  </div>
                  <div className="flex space-x-1">
                     <button className="p-1 text-gray-300 hover:text-blue-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                     </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={agent.agent_name}>
                    {agent.agent_name || 'Untitled Agent'}
                </h3>
                
                <div className="space-y-3 mt-4">
                    {/* Voice Info */}
                    <div className="flex items-center text-sm text-gray-600">
                        <Mic className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="truncate">{agent.voice_id || 'Default Voice'}</span>
                    </div>

                    {/* LLM Info - if available via nested object or direct */}
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-4 h-4 mr-2 text-indigo-500 flex items-center justify-center text-[10px] font-bold border border-indigo-500 rounded">AI</div>
                        <span className="truncate">
                            {agent.response_engine?.llm_id ? `LLM: ...${agent.response_engine.llm_id.slice(-6)}` : 'No Brain Attached'}
                        </span>
                    </div>

                    {/* ID Display */}
                    <div className="flex items-center text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 group-hover:border-blue-100 transition-colors">
                        <span className="truncate flex-1">ID: {agent.agent_id}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(agent.agent_id);
                                toast.success('Agent ID copied');
                            }}
                            className="ml-2 text-blue-500 hover:text-blue-700 font-sans font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Copy
                        </button>
                    </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                 <div className="text-xs text-gray-400">
                    Modified {new Date(agent.last_modification_timestamp || Date.now()).toLocaleDateString()}
                 </div>
                 
                 <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Agent">
                        {/* Reuse existing edit logic later */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if(window.confirm('Delete this agent?')) {
                            try {
                              await agentService.deleteAgent(agent.agent_id);
                              setAgents(agents.filter(a => a.agent_id !== agent.agent_id));
                              toast.success('Agent deleted');
                            } catch(e) { 
                              console.error(e);
                              toast.error('Failed to delete agent'); 
                            }
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete Agent"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {isModalOpen && (
        <CreateAgentModal 
           onClose={() => setIsModalOpen(false)} 
           onCreated={handleAgentCreated}
        />
      )}
    </div>
  );
};

export default Agents;
