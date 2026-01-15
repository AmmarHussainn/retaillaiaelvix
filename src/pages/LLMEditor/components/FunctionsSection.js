import React from "react";
import {
  Wrench,
  ChevronUp,
  ChevronDown,
  Mic,
  Headphones,
  Database,
  Edit2,
  Trash2,
  Plus,
  MessageSquare,
  LayoutDashboard,
  Layers,
} from "lucide-react";

const FunctionsSection = ({
  formData,
  setFormData,
  expandedSections,
  toggleSection,
  setActiveConfigTool,
  handleRemoveTool,
  functionsDropdownOpen,
  setFunctionsDropdownOpen,
}) => {
  return (
    <div className="border border-gray-100 rounded-2xl relative">
      <button
        onClick={() => toggleSection("functions")}
        className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center space-x-3 text-gray-700 font-bold text-sm">
          <Wrench className="w-4 h-4 text-blue-500" />
          <span>Functions</span>
        </div>
        {expandedSections.functions ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {expandedSections.functions && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
            Enable your agent with capabilities such as calendar bookings, call
            termination, etc.
          </p>
          <div className="space-y-3">
            {formData.general_tools.map((tool, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-gray-200 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-50">
                    {tool.type === "end_call" && (
                      <Mic className="w-4 h-4 text-gray-500" />
                    )}
                    {tool.type === "transfer_call" && (
                      <Headphones className="w-4 h-4 text-blue-500" />
                    )}
                    {tool.type === "press_digit" && (
                      <Database className="w-4 h-4 text-purple-500" />
                    )}
                    {tool.type === "custom" && (
                      <Wrench className="w-4 h-4 text-orange-500" />
                    )}
                    {![
                      "end_call",
                      "transfer_call",
                      "press_digit",
                      "custom",
                    ].includes(tool.type) && (
                      <Wrench className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-gray-700">
                    {tool.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveConfigTool({ ...tool, index: idx });
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveTool(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="relative pt-2">
              <button
                onClick={() => setFunctionsDropdownOpen(!functionsDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>

              {functionsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setFunctionsDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 py-3 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    {[
                      { label: "End Call", icon: Mic, type: "end_call" },
                      {
                        label: "Call Transfer",
                        icon: Headphones,
                        type: "transfer_call",
                      },
                      {
                        label: "Agent Transfer",
                        icon: Mic,
                        type: "agent_transfer",
                      },
                      {
                        label: "Check Calendar Availability (Cal.com)",
                        icon: Database,
                        type: "check_availability_cal",
                      },
                      {
                        label: "Book on the Calendar (Cal.com)",
                        icon: Database,
                        type: "book_appointment_cal",
                      },
                      {
                        label: "Press Digit (IVR Navigation)",
                        icon: LayoutDashboard,
                        type: "press_digit",
                      },
                      {
                        label: "Send SMS",
                        icon: MessageSquare,
                        type: "send_sms",
                      },
                      {
                        label: "Extract Dynamic Variable",
                        icon: Layers,
                        type: "extract_dynamic_variable",
                      },
                      {
                        label: "Custom Function",
                        icon: Wrench,
                        type: "custom",
                      },
                    ].map((type) => (
                      <button
                        key={type.type}
                        disabled={["send_sms", "press_digit"].includes(
                          type.type
                        )}
                        onClick={() => {
                          const baseTool = {
                            name: type.label
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/[()]/g, ""),
                            type: type.type,
                            description: `Function for ${type.label}`,
                          };

                          // Advanced fields for transfer_call
                          if (type.type === "transfer_call") {
                            Object.assign(baseTool, {
                              transfer_to_type: "static",
                              transfer_to_number: "",
                              transfer_to_prompt: "",
                              format_to_e164: true,
                              extension_number: "",
                              transfer_type: "cold_transfer",
                              sip_transfer_method: "sip_refer",
                              displayed_caller_id: "agent",
                              custom_sip_headers: [],
                              on_hold_music: "ringtone",
                              warm_transfer_mode: "transfer_after_detect_human",
                              navigate_ivr: false,
                              transfer_only_if_human: true,
                              detection_timeout_ms: 30000,
                              ai_auto_greet: true,
                              whisper_enabled: false,
                              whisper_message: {
                                type: "static",
                                content: "",
                              },
                              three_way_enabled: false,
                              three_way_message: {
                                type: "static",
                                content: "",
                              },
                              ignore_e164_validation: false,
                              speak_during_execution: false,
                              execution_message: "",
                              description: "Transfer the call to a human agent",
                            });
                          }
                          // Advanced fields for agent_transfer
                          if (type.type === "agent_transfer") {
                            Object.assign(baseTool, {
                              agent_id: "",
                              agent_version: 1,
                              post_call_analysis_setting: "both_agents",
                              webhook_setting: "only_source_agent",
                              speak_during_execution: false,
                              execution_message:
                                "Wait a moment while I transfer you to my colleague...",
                              description:
                                "Transfer the call to another specialist agent.",
                            });
                          }

                          // Advanced fields for Calendar tools
                          if (
                            [
                              "check_availability_cal",
                              "book_appointment_cal",
                            ].includes(type.type)
                          ) {
                            Object.assign(baseTool, {
                              cal_api_key: "",
                              event_type_id: "",
                              timezone: "America/Los_Angeles",
                            });
                          }

                          // Advanced fields for custom tools
                          if (type.type === "custom") {
                            Object.assign(baseTool, {
                              method: "POST",
                              url: "",
                              timeout_ms: 120000,
                              headers: [],
                              query_parameters: [],
                              parameters: JSON.stringify(
                                {
                                  properties: {},
                                },
                                null,
                                2
                              ),
                              parameterViewMode: "json",
                              parametersForm: [],
                              response_variables: [],
                              speak_during_execution: false,
                              speak_after_execution: true,
                              description: `Custom function for ${type.label}`,
                            });
                          }

                          setFormData((prev) => {
                            const updatedTools = [
                              ...prev.general_tools,
                              baseTool,
                            ];
                            const newIndex = updatedTools.length - 1;

                            // Auto-open modal after adding
                            setTimeout(() => {
                              setActiveConfigTool({
                                ...baseTool,
                                index: newIndex,
                              });
                            }, 0);

                            return {
                              ...prev,
                              general_tools: updatedTools,
                            };
                          });
                          setFunctionsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2.5 flex items-center space-x-4 transition-colors group ${
                          ["send_sms", "press_digit"].includes(type.type)
                            ? "opacity-50 cursor-not-allowed bg-gray-50/50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                          <type.icon
                            className={`w-4 h-4 text-gray-400 ${
                              !["send_sms", "press_digit"].includes(
                                type.type
                              ) && "group-hover:text-gray-900"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col text-ellipsis overflow-hidden">
                          <span
                            className={`text-[13px] font-bold truncate ${
                              ["send_sms", "press_digit"].includes(type.type)
                                ? "text-gray-400"
                                : "text-gray-600 group-hover:text-gray-900"
                            }`}
                          >
                            {type.label}
                          </span>
                          {["send_sms", "press_digit"].includes(type.type) && (
                            <span className="text-[10px] text-gray-400 font-medium italic">
                              Currently Unavailable
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionsSection;
