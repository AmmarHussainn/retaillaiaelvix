import React from "react";

const EndCallForm = ({ activeConfigTool, setActiveConfigTool }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="speak_during_end"
          checked={activeConfigTool.speak_during_execution || false}
          onChange={(e) =>
            setActiveConfigTool({
              ...activeConfigTool,
              speak_during_execution: e.target.checked,
            })
          }
          className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer"
        />
        <label htmlFor="speak_during_end" className="flex-1 cursor-pointer">
          <p className="text-sm font-bold text-gray-900">
            Speak During Execution
          </p>
          <p className="text-[11px] text-gray-500 font-medium">
            If enabled, the agent will say something before hanging up.
          </p>
        </label>
      </div>
      {activeConfigTool.speak_during_execution && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-xs font-bold text-gray-700 ml-1">
            Execution Message
          </label>
          <textarea
            value={activeConfigTool.execution_message || ""}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                execution_message: e.target.value,
              })
            }
            className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all min-h-[80px] resize-none"
            placeholder="e.g. Thank you for calling. Have a great day!"
          />
        </div>
      )}
    </div>
  );
};

export default EndCallForm;
