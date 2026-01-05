import React, { useState, useEffect } from 'react';
import { Phone, User, Link as LinkIcon, Unlink } from 'lucide-react';
import { phoneNumberService } from '../services/phoneNumberService';
import { agentService } from '../services/agentService';

const PhoneNumbers = () => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for assignment modal/dropdown
  const [assigningId, setAssigningId] = useState(null); // ID of phone number being assigned
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
      
      setPhoneNumbers(Array.isArray(numbersData) ? numbersData : numbersData.phone_numbers || []);
      setAgents(Array.isArray(agentsData) ? agentsData : agentsData.agents || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load phone numbers or agents.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (phoneNumberId) => {
    if (!selectedAgentId) return;
    try {
      await phoneNumberService.assignPhoneNumber(phoneNumberId, selectedAgentId);
      // Refresh list or optimistic update
      setPhoneNumbers(phoneNumbers.map(p => 
        p.phone_number_id === phoneNumberId || p.id === phoneNumberId 
          ? { ...p, agent_id: selectedAgentId } 
          : p
      ));
      setAssigningId(null);
      setSelectedAgentId('');
    } catch (err) {
      console.error('Assign error:', err);
      alert('Failed to assign agent.');
    }
  };

  const handleRelease = async (phoneNumberId) => {
    if (!window.confirm('Are you sure you want to release this number from the agent?')) return;
    try {
      await phoneNumberService.releasePhoneNumber(phoneNumberId);
      setPhoneNumbers(phoneNumbers.map(p => 
        p.phone_number_id === phoneNumberId || p.id === phoneNumberId 
          ? { ...p, agent_id: null } 
          : p
      ));
    } catch (err) {
      console.error('Release error:', err);
      alert('Failed to release number.');
    }
  };

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a._id === agentId || a.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-2xl font-bold text-gray-900">Phone Numbers</h1>
         <p className="text-gray-500 mt-1">Manage your phone numbers and assign them to agents.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading phone numbers...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg border border-red-100">
           <p className="text-red-500">{error}</p>
           <button onClick={fetchData} className="mt-2 text-blue-600 hover:underline">Retry</button>
        </div>
      ) : phoneNumbers.length === 0 ? (
         <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Phone className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No phone numbers found</h3>
          <p className="text-gray-500 mt-1 mb-6">Contact support to purchase phone numbers.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {phoneNumbers.map((num) => {
                const isAssigned = !!num.agent_id;
                const isAssigning = assigningId === (num.phone_number_id || num.id);

                return (
                  <tr key={num.phone_number_id || num.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-900 font-medium font-mono">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {num.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAssigning ? (
                         <div className="flex items-center space-x-2">
                           <select 
                             className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                             value={selectedAgentId}
                             onChange={(e) => setSelectedAgentId(e.target.value)}
                           >
                             <option value="">Select Agent...</option>
                             {agents.map(a => (
                               <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
                             ))}
                           </select>
                           <button 
                             onClick={() => handleAssign(num.phone_number_id || num.id)}
                             disabled={!selectedAgentId}
                             className="text-green-600 hover:text-green-900 text-sm font-medium disabled:opacity-50"
                           >
                             Save
                           </button>
                           <button 
                             onClick={() => setAssigningId(null)}
                             className="text-gray-500 hover:text-gray-700 text-sm"
                           >
                             Cancel
                           </button>
                         </div>
                      ) : (
                        isAssigned ? (
                          <div className="flex items-center text-gray-900">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {getAgentName(num.agent_id)}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isAssigned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isAssigned ? 'Active' : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isAssigned ? (
                        <button 
                          onClick={() => handleRelease(num.phone_number_id || num.id)}
                          className="text-red-600 hover:text-red-900 flex items-center justify-end ml-auto"
                        >
                          <Unlink className="w-4 h-4 mr-1" /> Unassign
                        </button>
                      ) : (
                        !isAssigning && (
                          <button 
                            onClick={() => {
                              setAssigningId(num.phone_number_id || num.id);
                              setSelectedAgentId('');
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto"
                          >
                            <LinkIcon className="w-4 h-4 mr-1" /> Assign Agent
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PhoneNumbers;
