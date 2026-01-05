import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Mic, Trash2 } from 'lucide-react';
import { agentService } from '../services/agentService';
import CreateAgentModal from '../components/agents/CreateAgentModal'; // We'll create this next

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

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

      {/* Agents List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading agents...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg border border-red-100">
           <p className="text-red-500">{error}</p>
           <button onClick={fetchAgents} className="mt-2 text-blue-600 hover:underline">Retry</button>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Mic className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No agents yet</h3>
          <p className="text-gray-500 mt-1 mb-6">Create your first voice agent to get started.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent._id || agent.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Mic className="w-6 h-6" />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {agent.language || 'English'}
                </span>
                
                <div className="mt-4 space-y-2">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium text-gray-900 capitalize">{agent.type || 'Voice Agent'}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-medium capitalize ${agent.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                        {agent.status || 'Active'}
                      </span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium text-gray-900">
                        {new Date(agent.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                   </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex space-x-3">
                 <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                    Edit
                 </button>
                 <button className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    View
                 </button>
                 <button 
                    onClick={async () => {
                      if(window.confirm('Delete this agent?')) {
                        try {
                          await agentService.deleteAgent(agent._id || agent.id);
                          setAgents(agents.filter(a => a._id !== agent._id && a.id !== agent.id));
                        } catch(e) { alert('Failed to delete agent'); }
                      }
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete Agent"
                 >
                    <Trash2 className="w-5 h-5" />
                 </button>
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
