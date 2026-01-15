import React from "react";
import { X, Wrench, Database, Info } from "lucide-react";
import CustomToolForm from "./forms/CustomToolForm";
import TransferCallForm from "./forms/TransferCallForm";
import AgentTransferForm from "./forms/AgentTransferForm";
import CalendarToolForm from "./forms/CalendarToolForm";
import EndCallForm from "./forms/EndCallForm";
import ExtractDynamicVariableForm from "./forms/ExtractDynamicVariableForm";
import toast from "react-hot-toast";

const ToolConfigModal = ({
  activeConfigTool,
  setActiveConfigTool,
  formData,
  setFormData,
  availableAgents,
  setIsVarModalOpen,
}) => {
  if (!activeConfigTool) return null;

  const handleSave = () => {
    // Tool Validation Logic
    if (!activeConfigTool.name || !activeConfigTool.name.trim()) {
      toast.error("Tool name is required");
      return;
    }

    if (activeConfigTool.type === "transfer_call") {
      if (
        activeConfigTool.transfer_to_type === "static" &&
        (!activeConfigTool.transfer_to_number ||
          !activeConfigTool.transfer_to_number.trim())
      ) {
        toast.error("Transfer phone number is required");
        return;
      }
      if (
        activeConfigTool.transfer_to_type === "dynamic" &&
        (!activeConfigTool.transfer_to_prompt ||
          !activeConfigTool.transfer_to_prompt.trim())
      ) {
        toast.error("Transfer prompt is required for dynamic routing");
        return;
      }
    }

    if (activeConfigTool.type === "agent_transfer") {
      if (!activeConfigTool.agent_id) {
        toast.error("Please select a target agent for transfer");
        return;
      }
    }

    if (
      ["check_availability_cal", "book_appointment_cal"].includes(
        activeConfigTool.type
      )
    ) {
      if (
        !activeConfigTool.cal_api_key ||
        !activeConfigTool.cal_api_key.trim()
      ) {
        toast.error("Cal.com API key is required");
        return;
      }
      if (!activeConfigTool.event_type_id) {
        toast.error("Cal.com Event Type ID is required");
        return;
      }
    }

    if (activeConfigTool.type === "custom") {
      if (!activeConfigTool.url || !activeConfigTool.url.trim()) {
        toast.error("API URL is required for custom tools");
        return;
      }
      if (
        !activeConfigTool.description ||
        !activeConfigTool.description.trim()
      ) {
        toast.error("Description is required for custom tools");
        return;
      }
    }

    const updatedTools = [...formData.general_tools];
    const { index, ...toolData } = activeConfigTool;
    updatedTools[index] = toolData;
    setFormData((prev) => ({
      ...prev,
      general_tools: updatedTools,
    }));
    setActiveConfigTool(null);
    toast.success("Tool configuration saved");
  };

  const renderForm = () => {
    switch (activeConfigTool.type) {
      case "custom":
        return (
          <CustomToolForm
            activeConfigTool={activeConfigTool}
            setActiveConfigTool={setActiveConfigTool}
          />
        );
      case "transfer_call":
        return (
          <TransferCallForm
            activeConfigTool={activeConfigTool}
            setActiveConfigTool={setActiveConfigTool}
          />
        );
      case "agent_transfer":
        return (
          <AgentTransferForm
            activeConfigTool={activeConfigTool}
            setActiveConfigTool={setActiveConfigTool}
            availableAgents={availableAgents}
            setIsVarModalOpen={setIsVarModalOpen}
          />
        );
      case "check_availability_cal":
      case "book_appointment_cal":
        return (
          <CalendarToolForm
            activeConfigTool={activeConfigTool}
            setActiveConfigTool={setActiveConfigTool}
          />
        );
      case "end_call":
        return (
          <EndCallForm
            activeConfigTool={activeConfigTool}
            setActiveConfigTool={setActiveConfigTool}
          />
        );
      case "extract_dynamic_variable":
        return (
          <ExtractDynamicVariableForm
            activeConfigTool={activeConfigTool}
            setIsVarModalOpen={setIsVarModalOpen}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setActiveConfigTool(null)}
      ></div>
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              {activeConfigTool.type === "extract_dynamic_variable" ? (
                <Database className="w-5 h-5 text-gray-600" />
              ) : (
                <Wrench className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {activeConfigTool.type === "extract_dynamic_variable"
                  ? "Extract Dynamic Variable"
                  : activeConfigTool.type === "custom"
                  ? "Custom Function"
                  : activeConfigTool.type === "transfer_call"
                  ? "Transfer Call"
                  : "Configure Tool"}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {activeConfigTool.type === "custom"
                  ? "Connect to external APIs and services."
                  : activeConfigTool.type === "transfer_call"
                  ? "Transfer the call to a human agent, SIP URI, or dynamic destination."
                  : activeConfigTool.type === "agent_transfer"
                  ? "Transfer to another agent to bring in new capabilities and fulfill different tasks."
                  : "Configure the behavior of this tool."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveConfigTool(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Info Alert for Agent Transfer */}
          {activeConfigTool.type === "agent_transfer" && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <p className="text-sm text-blue-700 font-medium leading-relaxed">
                It will be a seamless transition, with all the call context
                preserved. It will appear as a single call in history.
              </p>
            </div>
          )}

          {/* Common Fields: Name & Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                Name
              </label>
              <input
                value={activeConfigTool.name}
                onChange={(e) =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    name: e.target.value,
                  })
                }
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all border border-gray-100"
                placeholder="Enter function name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
                Description
              </label>
              <textarea
                value={activeConfigTool.description}
                onChange={(e) =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    description: e.target.value,
                  })
                }
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all border border-gray-100 min-h-[80px] resize-none"
                placeholder="Enter the description"
              />
            </div>
          </div>

          {renderForm()}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button
            onClick={() => setActiveConfigTool(null)}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolConfigModal;
