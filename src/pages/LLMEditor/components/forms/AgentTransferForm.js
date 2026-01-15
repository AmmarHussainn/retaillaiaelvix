import React from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

const AgentTransferForm = ({
  activeConfigTool,
  setActiveConfigTool,
  availableAgents,
  setIsVarModalOpen,
}) => {
  return (
    <div className="space-y-8 pt-4">
      {/* Select Agent Dropdown */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
          Select Agent
        </label>
        <div className="relative group">
          <select
            value={activeConfigTool.agent_id || ""}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                agent_id: e.target.value,
                agent_version: 1,
              })
            }
            className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-bold outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 appearance-none cursor-pointer transition-all"
          >
            <option value="" disabled>
              Select an agent
            </option>
            {availableAgents.map((agent) => (
              <option key={agent.agent_id} value={agent.agent_id}>
                {agent.agent_name || "Untitled Agent"} - (Latest)
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Voice Display for Selected Agent */}
        {activeConfigTool.agent_id && (
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-500">Voice</span>
                <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-orange-100">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                        availableAgents.find(
                          (a) => a.agent_id === activeConfigTool.agent_id
                        )?.voice_id || "Cimo"
                      }`}
                      alt="Voice"
                    />
                  </div>
                  <span className="text-[13px] font-bold text-gray-700">
                    {availableAgents.find(
                      (a) => a.agent_id === activeConfigTool.agent_id
                    )?.voice_id || "Cimo"}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              It will use the voice that you set for the selected agent.
            </p>
          </div>
        )}
      </div>

      {/* Execution Message (Simplified) */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
          Execution Message
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="speak_during_agent"
            checked={activeConfigTool.speak_during_execution || false}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                speak_during_execution: e.target.checked,
              })
            }
            className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer transition-all"
          />
          <label htmlFor="speak_during_agent" className="flex-1 cursor-pointer">
            <p className="text-sm font-bold text-gray-900">
              Speak During Execution
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              If the function takes over 2 seconds, the agent can say something
              like: "Let me check that for you."
            </p>
          </label>
        </div>
        {activeConfigTool.speak_during_execution && (
          <textarea
            value={activeConfigTool.execution_message || ""}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                execution_message: e.target.value,
              })
            }
            className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all min-h-[80px] resize-none animate-in fade-in slide-in-from-top-2 duration-200"
            placeholder="Wait a moment while I transfer you to my colleague..."
          />
        )}
      </div>

      {/* Post Call Analysis Setting */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Post Call Analysis Setting
          </label>
          <p className="text-[11px] text-gray-500 font-medium ml-1">
            Select which agent's analysis fields to include in the call history.
          </p>
        </div>
        <div className="space-y-3">
          {[
            {
              id: "only_destination_agent",
              label: "Only transferred agent",
            },
            {
              id: "both_agents",
              label: "Both this agent and transferred agent",
            },
          ].map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <input
                type="radio"
                id={option.id}
                name="post_call_analysis"
                checked={
                  activeConfigTool.post_call_analysis_setting === option.id
                }
                onChange={() =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    post_call_analysis_setting: option.id,
                  })
                }
                className="w-4 h-4 accent-gray-900 cursor-pointer"
              />
              <label
                htmlFor={option.id}
                className="text-sm font-bold text-gray-700 cursor-pointer leading-none"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Setting */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Webhook Setting
          </label>
          <p className="text-[11px] text-gray-500 font-medium ml-1">
            Select which agent's webhook endpoint to use for sending call
            updates.
          </p>
        </div>
        <div className="space-y-3">
          {[
            {
              id: "only_destination_agent",
              label: "Only transferred agent",
            },
            {
              id: "both_agents",
              label: "Both this agent and transferred agent",
            },
            { id: "only_source_agent", label: "Only this agent" },
          ].map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`webhook_${option.id}`}
                name="webhook_setting"
                checked={activeConfigTool.webhook_setting === option.id}
                onChange={() =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    webhook_setting: option.id,
                  })
                }
                className="w-4 h-4 accent-gray-900 cursor-pointer"
              />
              <label
                htmlFor={`webhook_${option.id}`}
                className="text-sm font-bold text-gray-700 cursor-pointer leading-none"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentTransferForm;
