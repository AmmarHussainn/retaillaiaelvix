import React from "react";
import { Cpu, Mic, Globe } from "lucide-react";

const PromptSection = ({ formData, handleInputChange }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Config Pills */}
      <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <Cpu className="w-4 h-4 text-gray-400" />
          <select
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4"
          >
            <option value="gpt-4.1">GPT 4.1</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-200"></div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <Mic className="w-4 h-4 text-gray-400" />
          <select
            name="s2s_model"
            value={formData.s2s_model || ""}
            onChange={handleInputChange}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4"
          >
            <option value="">Standard Voice</option>
            <option value="gpt-4o-realtime">GPT-4o Realtime</option>
            <option value="gpt-4o-mini-realtime">GPT-4o Mini Realtime</option>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-200"></div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <Globe className="w-4 h-4 text-gray-400" />
          <select className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
      </div>

      {/* Prompt Textarea */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
        <div className="flex-1 p-8 h-full">
          <textarea
            name="general_prompt"
            value={formData.general_prompt}
            onChange={handleInputChange}
            placeholder="## Role\nYou are a professional receptionist for Johnson & Associates Law Firm..."
            className="w-full min-h-[480px] text-lg text-gray-800 placeholder-gray-300 resize-none outline-none leading-relaxed font-normal"
          />
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Use <code className="bg-gray-200 px-1 rounded">{"{{...}}"}</code> to
            add variables.{" "}
            <span className="text-blue-500 cursor-pointer">Learn more</span>
          </div>
        </div>
      </div>

      {/* Welcome Message Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Welcome Message</h2>
          <p className="text-xs text-gray-500">
            Pick what happens when the call starts.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              handleInputChange({
                target: { name: "start_speaker", value: "agent", type: "text" },
              })
            }
            className={`p-6 rounded-[28px] border-2 transition-all text-left relative outline-none ${
              formData.start_speaker === "agent"
                ? "border-blue-500 bg-blue-50/30 shadow-sm"
                : "border-gray-100 bg-white hover:border-blue-100 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4
                className={`font-bold text-[15px] ${
                  formData.start_speaker === "agent"
                    ? "text-blue-600"
                    : "text-gray-900"
                }`}
              >
                AI speaks first
              </h4>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.start_speaker === "agent"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-100"
                }`}
              >
                {formData.start_speaker === "agent" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <textarea
              name="begin_message"
              value={formData.begin_message}
              onChange={handleInputChange}
              disabled={formData.start_speaker !== "agent"}
              className={`w-full bg-white/50 border border-gray-100 rounded-2xl p-4 text-[13px] font-medium outline-none h-24 resize-none transition-all focus:bg-white focus:border-blue-100 placeholder:text-gray-300 ${
                formData.start_speaker !== "agent" ? "opacity-50" : ""
              }`}
              placeholder="e.g. Hello, how can I help you today?"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              handleInputChange({
                target: { name: "start_speaker", value: "user", type: "text" },
              })
            }
            className={`p-6 rounded-[28px] border-2 transition-all text-left relative outline-none ${
              formData.start_speaker === "user"
                ? "border-blue-500 bg-blue-50/30 shadow-sm"
                : "border-gray-100 bg-white hover:border-blue-100 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4
                className={`font-bold text-[15px] ${
                  formData.start_speaker === "user"
                    ? "text-blue-600"
                    : "text-gray-900"
                }`}
              >
                User speaks first
              </h4>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.start_speaker === "user"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-100"
                }`}
              >
                {formData.start_speaker === "user" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed mt-2">
              Agent will wait for user to speak before responding.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptSection;
