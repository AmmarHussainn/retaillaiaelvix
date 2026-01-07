import React, { useState, useEffect } from 'react';
import { Phone, User, Link as LinkIcon, Unlink, Globe, Plus, Trash2, Edit } from 'lucide-react';
import { phoneNumberService } from '../services/phoneNumberService';
import agentService from '../services/agentService';
import CreatePhoneNumberModal from '../components/phone/CreatePhoneNumberModal';
import { useToast } from '../context/ToastContext';

const PhoneNumbers = () => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  
  // State for assignment
  const [assigningId, setAssigningId] = useState(null); // This will hold the phone_number string
  const [selectedAgentId, setSelectedAgentId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [numbersData, agentsData] = await Promise.all([
        phoneNumberService.getAllPhoneNumbers(),
        agentService.getAllAgents()
      ]);
      
      // API returns direct array [ { ... }, ... ]
      setPhoneNumbers(Array.isArray(numbersData) ? numbersData : []);
      setAgents(Array.isArray(agentsData) ? agentsData : agentsData.agents || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load phone numbers or agents.');
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreated = () => {
    fetchData(); // Refresh list to get new number
    setIsModalOpen(false);
  };

  const handleAssign = async (phoneNumber) => {
    if (!selectedAgentId) return;
    try {
      // Use encoded phone number in URL via service
      // Mapping 'agent_id' to 'inbound_agent_id' as per API structure
      await phoneNumberService.updatePhoneNumber(phoneNumber, { inbound_agent_id: selectedAgentId });
      
      // Speculatively update UI
      setPhoneNumbers(phoneNumbers.map(p => 
        p.phone_number === phoneNumber ? { ...p, inbound_agent_id: selectedAgentId } : p
      ));
      
      toast.success('Agent assigned successfully');
      setAssigningId(null);
      setSelectedAgentId('');
    } catch (err) {
      console.error('Assign error:', err);
      toast.error('Failed to assign agent');
    }
  };

  const handleRelease = async (phoneNumber) => {
    if (!window.confirm('Are you sure you want to release this number from the agent?')) return;
    try {
      // Release by setting inbound_agent_id to null
      await phoneNumberService.updatePhoneNumber(phoneNumber, { inbound_agent_id: null });
      
      setPhoneNumbers(phoneNumbers.map(p => 
        p.phone_number === phoneNumber ? { ...p, inbound_agent_id: null } : p
      ));
      toast.success('Number released');
    } catch (err) {
      console.error('Release error:', err);
      toast.error('Failed to release number');
    }
  };

  const handleDelete = async (phoneNumber) => {
    if (!window.confirm('Delete this phone number? This cannot be undone.')) return;
    try {
      await phoneNumberService.deletePhoneNumber(phoneNumber);
      setPhoneNumbers(phoneNumbers.filter(p => p.phone_number !== phoneNumber));
      toast.success('Phone number deleted');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete number');
    }
  };

  const getAgentName = (agentId) => {
    if (!agentId) return null;
    const agent = agents.find(a => a._id === agentId || a.agent_id === agentId);
    return agent ? agent.name || agent.agent_name : 'Unknown Agent';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Phone Numbers</h1>
            <p className="text-gray-500 mt-1">Manage your phone numbers and assign them to agents.</p>
         </div>
         <button
           onClick={() => setIsModalOpen(true)}
           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
         >
           <Plus className="w-5 h-5 mr-2" />
           Buy Number
         </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading phone numbers...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
           <p className="text-red-500 font-medium">{error}</p>
           <button onClick={fetchData} className="mt-3 text-blue-600 hover:text-blue-800 font-medium underline">Retry Connection</button>
        </div>
      ) : phoneNumbers.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Phone className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No phone numbers found</h3>
          <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Purchase a number to start making and receiving AI calls.</p>
          <button
             onClick={() => setIsModalOpen(true)}
             className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
             Buy Number
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phoneNumbers.map((num) => {
            const isAssigned = !!num.inbound_agent_id;
            const isAssigning = assigningId === num.phone_number;
            const agentName = getAgentName(num.inbound_agent_id);

            return (
              <div key={num.phone_number} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col justify-between h-full group">
                <div>
                   <div className="flex justify-between items-start mb-4">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${isAssigned ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {isAssigned ? 'Active' : 'Unassigned'}
                      </div>
                      <button 
                        onClick={() => handleDelete(num.phone_number)}
                        className="p-1 text-gray-300 hover:text-red-600 transition-colors"
                        title="Release Number"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>

                   <h3 className="text-xl font-mono font-bold text-gray-900 mb-1 tracking-tight">
                     {num.phone_number}
                   </h3>
                   <p className="text-sm text-gray-500 mb-4">{num.nickname || 'No label'}</p>

                   <div className="space-y-3">
                      {/* Agent Assignment Section */}
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                           <User className="w-3 h-3 mr-1" />
                           Assigned Agent
                        </div>
                        
                        {isAssigning ? (
                           <div className="flex flex-col space-y-2">
                             <select 
                               className="block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                               value={selectedAgentId}
                               // Use Retell agent_id (which might be in _id or agent_id field of agent object)
                               onChange={(e) => setSelectedAgentId(e.target.value)}
                             >
                                <option value="">Select Agent...</option>
                                {agents.map(a => (
                                  <option key={a.agent_id || a._id} value={a.agent_id}>{a.agent_name || a.name}</option>
                                ))}
                             </select>
                             <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleAssign(num.phone_number)}
                                  disabled={!selectedAgentId}
                                  className="flex-1 bg-green-600 text-white text-xs py-1.5 rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setAssigningId(null)}
                                  className="flex-1 bg-white border border-gray-300 text-gray-700 text-xs py-1.5 rounded hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                             </div>
                           </div>
                        ) : (
                           <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${isAssigned ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                {isAssigned ? agentName : 'No agent assigned'}
                              </span>
                              {isAssigned ? (
                                <button onClick={() => handleRelease(num.phone_number)} className="text-red-500 hover:text-red-700 text-xs font-medium">Unassign</button>
                              ) : (
                                <button 
                                  onClick={() => {
                                      setAssigningId(num.phone_number);
                                      setSelectedAgentId('');
                                  }} 
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                  Assign
                                </button>
                              )}
                           </div>
                        )}
                      </div>

                      {/* Area info */}
                      <div className="flex items-center text-sm text-gray-500">
                         <Globe className="w-4 h-4 mr-2" />
                         <span>{(num.inbound_allowed_countries || ['US', 'CA']).join(', ')} Area</span>
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {isModalOpen && (
        <CreatePhoneNumberModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCreated}
        />
      )}
    </div>
  );
};

export default PhoneNumbers;
