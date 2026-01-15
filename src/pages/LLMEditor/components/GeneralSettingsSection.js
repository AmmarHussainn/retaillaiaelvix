import React from "react";
import {
  Mic,
  ChevronUp,
  ChevronDown,
  Headphones,
  FileJson,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  MessageSquare,
  LayoutDashboard,
  Check,
  Database,
  Settings,
  Webhook,
  Cpu,
  Info,
} from "lucide-react";

const GeneralSettingsSection = ({
  formData,
  setFormData,
  expandedSections,
  toggleSection,
  handleInputChange,
  postCallDropdownOpen,
  setPostCallDropdownOpen,
}) => {
  return (
    <div className="space-y-2">
      {/* Realtime Settings Section */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("speech")}
          className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
            <Mic className="w-4 h-4 text-purple-500" />
            <span>Speech & Realtime</span>
          </div>
          {expandedSections.speech ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.speech && (
          <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Temperature ({formData.model_temperature})
              </label>
              <input
                type="range"
                name="model_temperature"
                min="0"
                max="1"
                step="0.1"
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
          onClick={() => toggleSection("advanced_call")}
          className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
            <Headphones className="w-4 h-4 text-indigo-500" />
            <span>Call Settings</span>
          </div>
          {expandedSections.advanced_call ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.advanced_call && (
          <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Silence Timeout (ms)
              </label>
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
      <div className="border border-gray-100 rounded-2xl relative">
        <button
          onClick={() => toggleSection("post_call")}
          className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
            <FileJson className="w-4 h-4 text-orange-500" />
            <span>Post-Call Data Extraction</span>
          </div>
          {expandedSections.post_call ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.post_call && (
          <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold text-gray-900">
                Post Call Data Retrieval
              </h4>
              <p className="text-[11px] text-gray-500 font-medium">
                Define the information that you need to extract from the voice.
              </p>
            </div>

            <div className="space-y-2">
              {formData.post_call_analysis_data.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group"
                >
                  <div className="flex items-center space-x-3">
                    <MoreVertical className="w-4 h-4 text-gray-300" />
                    <span className="text-xs font-bold text-gray-700">
                      {item.name
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-900" />
                    <Trash2
                      className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-red-500"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          post_call_analysis_data:
                            prev.post_call_analysis_data.filter(
                              (_, i) => i !== idx
                            ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center space-x-3 mt-4">
                <div className="relative">
                  <button
                    onClick={() =>
                      setPostCallDropdownOpen(!postCallDropdownOpen)
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>

                  {postCallDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setPostCallDropdownOpen(false)}
                      ></div>
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        {[
                          {
                            label: "Text",
                            icon: MessageSquare,
                            type: "text",
                          },
                          {
                            label: "Selector",
                            icon: LayoutDashboard,
                            type: "selector",
                          },
                          {
                            label: "Boolean",
                            icon: Check,
                            type: "boolean",
                          },
                          {
                            label: "Number",
                            icon: Database,
                            type: "number",
                          },
                        ].map((type) => (
                          <button
                            key={type.type}
                            onClick={() => {
                              const name = prompt(`Enter ${type.label} name:`);
                              if (name) {
                                setFormData((prev) => ({
                                  ...prev,
                                  post_call_analysis_data: [
                                    ...prev.post_call_analysis_data,
                                    {
                                      name: name
                                        .toLowerCase()
                                        .replace(/\s+/g, "_"),
                                      type: type.type,
                                      description: `Extraction for ${name}`,
                                    },
                                  ],
                                }));
                              }
                              setPostCallDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 transition-colors group"
                          >
                            <type.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                            <span className="text-sm font-bold text-gray-700">
                              {type.label}
                            </span>
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        post_call_analysis_model: e.target.value,
                      }))
                    }
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
          onClick={() => toggleSection("webhooks")}
          className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
            <Webhook className="w-4 h-4 text-blue-400" />
            <span>Webhook Settings</span>
          </div>
          {expandedSections.webhooks ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.webhooks && (
          <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-[15px] font-bold text-gray-900">
                  Agent Level Webhook URL
                </h4>
                <p className="text-[11px] text-gray-500 font-medium">
                  Webhook URL to receive events from Retell.
                </p>
              </div>
              <input
                type="url"
                value={formData.webhook_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    webhook_url: e.target.value,
                  }))
                }
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-gray-300"
                placeholder="https://your-api.com/webhooks/retell"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900">
                    Webhook Timeout
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    Set the maximum time to wait for a webhook response before
                    timing out.
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  {formData.webhook_timeout_ms / 1000} s
                </span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="1000"
                  value={formData.webhook_timeout_ms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      webhook_timeout_ms: Number(e.target.value),
                    }))
                  }
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
          onClick={() => toggleSection("mcp")}
          className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
            <Cpu className="w-4 h-4 text-amber-500" />
            <span>MCPs</span>
          </div>
          {expandedSections.mcp ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.mcp && (
          <div className="p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                Model Context Protocol allows your agent to connect to remote
                data sources.
              </p>
            </div>
            <button className="w-full mt-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 border-dashed">
              Connect MCP Server
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSettingsSection;
