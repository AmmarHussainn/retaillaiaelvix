import React from "react";
import { Plus } from "lucide-react";

const ExtractDynamicVariableForm = ({
  activeConfigTool,
  setIsVarModalOpen,
}) => {
  return (
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
  );
};

export default ExtractDynamicVariableForm;
