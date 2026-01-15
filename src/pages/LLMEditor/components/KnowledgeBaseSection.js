import React from "react";
import {
  Database,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Settings,
} from "lucide-react";

const KnowledgeBaseSection = ({
  formData,
  setFormData,
  expandedSections,
  toggleSection,
  availableKbs,
  kbDropdownOpen,
  setKbDropdownOpen,
  kbSettingsOpen,
  setKbSettingsOpen,
  tempKbConfig,
  setTempKbConfig,
  toast,
  navigate,
}) => {
  return (
    <div className="border border-gray-100 rounded-2xl relative">
      <button
        onClick={() => toggleSection("knowledgeBase")}
        className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Knowledge Base</span>
        </div>
        {expandedSections.knowledgeBase ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {expandedSections.knowledgeBase && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
            Add knowledge base to provide context to the agent.
          </p>

          <div className="space-y-3">
            {/* Selected KBs */}
            <div className="flex flex-wrap gap-2">
              {formData.knowledge_base_ids.map((kbId) => {
                const kb = availableKbs.find(
                  (k) => k.knowledge_base_id === kbId
                );
                return (
                  <div
                    key={kbId}
                    className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 group"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">
                      {kb?.knowledge_base_name || kb?.name || kbId}
                    </span>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          knowledge_base_ids: prev.knowledge_base_ids.filter(
                            (id) => id !== kbId
                          ),
                        }))
                      }
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
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setKbDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {availableKbs
                      .filter(
                        (kb) =>
                          !formData.knowledge_base_ids.includes(
                            kb.knowledge_base_id
                          )
                      )
                      .map((kb) => (
                        <button
                          key={kb.knowledge_base_id}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              knowledge_base_ids: [
                                ...prev.knowledge_base_ids,
                                kb.knowledge_base_id,
                              ],
                            }));
                            setKbDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Database className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 truncate">
                            {kb.knowledge_base_name || kb.name}
                          </span>
                        </button>
                      ))}
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      onClick={() => navigate("/knowledge-base")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors text-blue-600"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">
                        Add New Knowledge Base
                      </span>
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
                <div
                  className="fixed inset-0 bg-black/5 z-40 backdrop-blur-[1px]"
                  onClick={() => setKbSettingsOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-[28px] shadow-2xl z-50 p-6 space-y-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[15px] font-bold text-gray-900">
                        Chunks to retrieve
                      </h4>
                      <span className="text-sm font-bold text-gray-900">
                        {tempKbConfig.top_k}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                      The max number of chunks to retrieve from the KB, range
                      1-10.
                    </p>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={tempKbConfig.top_k}
                      onChange={(e) =>
                        setTempKbConfig((prev) => ({
                          ...prev,
                          top_k: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-gray-900 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[15px] font-bold text-gray-900">
                      Similarity Threshold
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                      Adjust how strict the system is when matching chunks to
                      the context. A higher setting gives you fewer, but more
                      similar, matches
                    </p>
                    <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-2xl p-1">
                      <button
                        onClick={() =>
                          setTempKbConfig((prev) => ({
                            ...prev,
                            filter_score: Math.max(
                              0,
                              Number((prev.filter_score - 0.01).toFixed(2))
                            ),
                          }))
                        }
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
                        onClick={() =>
                          setTempKbConfig((prev) => ({
                            ...prev,
                            filter_score: Math.min(
                              1,
                              Number((prev.filter_score + 0.01).toFixed(2))
                            ),
                          }))
                        }
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
                        setFormData((prev) => ({
                          ...prev,
                          kb_config: tempKbConfig,
                        }));
                        setKbSettingsOpen(false);
                        toast.success("Retreival settings updated");
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
  );
};

export default KnowledgeBaseSection;
