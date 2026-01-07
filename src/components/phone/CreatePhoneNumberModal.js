import React, { useState } from 'react';
import { X, Phone, Globe, Hash } from 'lucide-react';
import { phoneNumberService } from '../../services/phoneNumberService';
import { useToast } from '../../context/ToastContext';

const CreatePhoneNumberModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    area_code: '310',
    nickname: '',
    toll_free: false,
    inbound_allowed_countries: ['US', 'CA'] // Default
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Helper to handle array inputs if needed, for now hardcoded countries
  // You could add a multi-select for countries later

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure area_code is integer
      const payload = {
        ...formData,
        area_code: parseInt(formData.area_code, 10),
      };

      await phoneNumberService.createPhoneNumber(payload);
      toast.success('Phone number created successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Create phone error:', err);
      // Handle typical backend errors
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create phone number';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Add Phone Number</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
           )}

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Area Code
               </label>
               <div className="relative">
                 <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                 <input
                   type="number"
                   name="area_code"
                   required
                   value={formData.area_code}
                   onChange={handleChange}
                   className="pl-9 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                   placeholder="e.g 415"
                 />
               </div>
               <p className="text-xs text-gray-500 mt-1">3-digit area code</p>
             </div>
             
             <div className="flex items-end mb-2">
                <label className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 rounded-lg w-full hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="toll_free"
                    checked={formData.toll_free}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Toll Free</span>
                </label>
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Nickname / Label
             </label>
             <input
               type="text"
               name="nickname"
               required
               value={formData.nickname}
               onChange={handleChange}
               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
               placeholder="e.g. Sales Line NY"
             />
           </div>

           {/* Inbound Countires - Read Only for simple MVP, or could be editable */}
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inbound Countries
              </label>
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Globe className="w-4 h-4" />
                <span>US, CA (Default)</span>
              </div>
           </div>

           <div className="pt-4 flex justify-end space-x-3">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
             >
               Cancel
             </button>
             <button
               type="submit"
               disabled={loading}
               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-all"
             >
               {loading ? 'Purchasing...' : 'Purchase Number'}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePhoneNumberModal;
