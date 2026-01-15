import React from "react";
import { ArrowLeft, Edit2, Copy, Save } from "lucide-react";

const EditorHeader = ({
  isEditMode,
  id,
  formData,
  setFormData,
  isEditingName,
  setIsEditingName,
  saving,
  handleSubmit,
  navigate,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/llms")}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                className="bg-gray-50 border-b-2 border-blue-500 outline-none px-1 rounded-t-sm"
              />
            ) : (
              <>
                <span
                  onClick={() => setIsEditingName(true)}
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                >
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
              <span className="flex items-center">
                Agent ID: <span className="ml-1 text-gray-700">ag...357</span>{" "}
                <Copy className="w-3 h-3 ml-1 cursor-pointer" />
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center">
                Retell LLM ID: <span className="ml-1 text-gray-700">{id}</span>{" "}
                <Copy className="w-3 h-3 ml-1 cursor-pointer" />
              </span>
              <span className="text-gray-300">•</span>
              <span>$0.115/min</span>
              <span className="text-gray-300">•</span>
              <span>1470-1800ms latency</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-sm font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">
          Create
        </span>
        <span className="text-sm font-medium text-gray-400">Simulation</span>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="ml-4 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg flex items-center space-x-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-b-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default EditorHeader;
