import React from "react";
import { X } from "lucide-react";

const VariablesSubModal = ({ isVarModalOpen, setIsVarModalOpen }) => {
  if (!isVarModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsVarModalOpen(false)}
      ></div>
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Variables</h3>
          <button
            onClick={() => setIsVarModalOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-900">
              Variable Name
            </label>
            <input
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
              placeholder="e.g. email / age"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-900">
              Variable Description
            </label>
            <textarea
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all min-h-[100px] resize-none"
              placeholder="e.g. Extract the user's email address from the conversation"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-900">
              Variable Type{" "}
              <span className="text-gray-400 font-medium">(Optional)</span>
            </label>
            <select className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none cursor-pointer">
              <option>Text</option>
              <option>Number</option>
              <option>Boolean</option>
              <option>Enum</option>
            </select>
          </div>
        </div>
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button
            onClick={() => setIsVarModalOpen(false)}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setIsVarModalOpen(false)}
            className="px-8 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariablesSubModal;
