import React from "react";
import {
  Phone,
  Bot,
  Music,
  Check,
  ChevronDown,
  Info,
  X,
  Plus,
} from "lucide-react";

const TransferCallForm = ({ activeConfigTool, setActiveConfigTool }) => {
  return (
    <div className="space-y-8 pt-4">
      {/* Transfer to */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Transfer to
          </label>
          <div className="flex items-center space-x-6">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {["static", "dynamic"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setActiveConfigTool({
                      ...activeConfigTool,
                      transfer_to_type: t,
                    })
                  }
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    activeConfigTool.transfer_to_type === t
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {t === "static" ? "Static Destination" : "Dynamic Routing"}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ignore_e164"
                  checked={!!activeConfigTool.ignore_e164_validation}
                  onChange={(e) =>
                    setActiveConfigTool({
                      ...activeConfigTool,
                      ignore_e164_validation: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-gray-900 rounded"
                />
                <label
                  htmlFor="ignore_e164"
                  className="text-[11px] font-bold text-gray-700 cursor-pointer"
                >
                  Ignore E.164 Validation
                </label>
              </div>
            </div>
          </div>
        </div>

        {activeConfigTool.transfer_to_type === "static" ? (
          <div className="flex space-x-3 items-start">
            <div className="flex-1 space-y-2">
              <input
                value={activeConfigTool.transfer_to_number || ""}
                onChange={(e) =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    transfer_to_number: e.target.value,
                  })
                }
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
                placeholder="+18563630633"
              />
              <p className="text-[11px] text-gray-500 font-medium ml-1">
                Enter a static phone number / SIP URI / dynamic variable.
              </p>
            </div>
            <div className="w-[120px] space-y-2">
              <input
                value={activeConfigTool.extension_number || ""}
                onChange={(e) =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    extension_number: e.target.value,
                  })
                }
                className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-center"
                placeholder="Ext"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={activeConfigTool.transfer_to_prompt || ""}
              onChange={(e) =>
                setActiveConfigTool({
                  ...activeConfigTool,
                  transfer_to_prompt: e.target.value,
                })
              }
              className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all min-h-[100px] resize-none"
              placeholder="If the user wants to reach support, transfer to +1 (925) 222-2222..."
            />
            <p className="text-[11px] text-gray-500 font-medium ml-1">
              Use a prompt to handle dynamic call transfer routing.
            </p>
          </div>
        )}
      </div>

      {/* Type (Cold / Warm) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
          Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              id: "cold_transfer",
              label: "Cold Transfer",
              icon: Phone,
              color: "text-blue-500",
              bg: "bg-blue-50",
              desc: "AI transfers the call to the next agent without a debrief.",
            },
            {
              id: "warm_transfer",
              label: "Warm Transfer",
              icon: Bot,
              color: "text-orange-500",
              bg: "bg-orange-50",
              desc: "AI provides a debrief to the next agent after transferring the call.",
            },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setActiveConfigTool({
                  ...activeConfigTool,
                  transfer_type: t.id,
                })
              }
              className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center text-center space-y-4 ${
                activeConfigTool.transfer_type === t.id
                  ? "border-gray-900 bg-white shadow-xl shadow-gray-100 scale-[1.02]"
                  : "border-gray-100 bg-gray-50/50 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-12 h-12 ${t.bg} rounded-full flex items-center justify-center`}
              >
                <t.icon className={`w-6 h-6 ${t.color}`} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">{t.label}</p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">
                  {t.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SIP Transfer Method & Displayed Caller ID */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            SIP Transfer Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["SIP REFER", "SIP INVITE"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    sip_transfer_method: m.toLowerCase().replace(" ", "_"),
                  })
                }
                className={`px-4 py-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  activeConfigTool.sip_transfer_method ===
                  m.toLowerCase().replace(" ", "_")
                    ? "border-gray-900 bg-white"
                    : "border-gray-100 bg-gray-50/30 hover:border-gray-200"
                }`}
              >
                <span className="text-xs font-bold text-gray-800">{m}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    activeConfigTool.sip_transfer_method ===
                    m.toLowerCase().replace(" ", "_")
                      ? "border-gray-900"
                      : "border-gray-300"
                  }`}
                >
                  {activeConfigTool.sip_transfer_method ===
                    m.toLowerCase().replace(" ", "_") && (
                    <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 ml-1">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Displayed Caller ID
            </label>
            <span className="group/caller relative">
              <Info className="w-3 h-3 text-gray-300 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/caller:opacity-100 transition-opacity pointer-events-none z-50">
                Determines which number is displayed to the recipient of the
                transfer.
              </div>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["agent", "user"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    displayed_caller_id: c,
                  })
                }
                className={`px-4 py-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  activeConfigTool.displayed_caller_id === c
                    ? "border-gray-900 bg-white"
                    : "border-gray-100 bg-gray-50/30 hover:border-gray-200"
                }`}
              >
                <span className="text-xs font-bold text-gray-800">
                  {c === "agent" ? "Retell Agent's Number" : "User's Number"}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    activeConfigTool.displayed_caller_id === c
                      ? "border-gray-900"
                      : "border-gray-300"
                  }`}
                >
                  {activeConfigTool.displayed_caller_id === c && (
                    <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom SIP Headers */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Custom SIP Headers
          </label>
          <p className="text-[11px] text-gray-500 font-medium ml-1">
            Add key/value pairs for call routing, metadata, or carrier
            integration.
          </p>
        </div>
        <div className="space-y-2">
          {(activeConfigTool.custom_sip_headers || []).map((h, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200"
            >
              <input
                placeholder="Key"
                value={h.key}
                onChange={(e) => {
                  const list = [...activeConfigTool.custom_sip_headers];
                  list[i].key = e.target.value;
                  setActiveConfigTool({
                    ...activeConfigTool,
                    custom_sip_headers: list,
                  });
                }}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
              />
              <input
                placeholder="Value"
                value={h.value}
                onChange={(e) => {
                  const list = [...activeConfigTool.custom_sip_headers];
                  list[i].value = e.target.value;
                  setActiveConfigTool({
                    ...activeConfigTool,
                    custom_sip_headers: list,
                  });
                }}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setActiveConfigTool({
                    ...activeConfigTool,
                    custom_sip_headers:
                      activeConfigTool.custom_sip_headers.filter(
                        (_, idx) => idx !== i
                      ),
                  })
                }
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setActiveConfigTool({
                ...activeConfigTool,
                custom_sip_headers: [
                  ...(activeConfigTool.custom_sip_headers || []),
                  { key: "", value: "" },
                ],
              })
            }
            className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Transfer Settings (Advanced) - Only for Warm Transfer */}
      {activeConfigTool.transfer_type === "warm_transfer" && (
        <div className="space-y-3 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Transfer Settings
          </label>
          <div className="p-6 border border-gray-100 rounded-[24px] space-y-8 bg-gray-50/30">
            {/* Hold Music */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Music className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  During Transfer Call
                </span>
              </div>
              <div className="pl-11 space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  On-hold Music
                </label>
                <div className="relative group">
                  <select
                    value={activeConfigTool.on_hold_music}
                    onChange={(e) =>
                      setActiveConfigTool({
                        ...activeConfigTool,
                        on_hold_music: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer"
                  >
                    <option value="none">Silence</option>
                    <option value="ringtone">Ringtone</option>
                    <option value="relaxing_sound">Relaxing Sound</option>
                    <option value="uplifting_beats">Uplifting Beats</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200" />

            {/* During Agent Connection */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  During Agent Connection
                </span>
              </div>
              <div className="pl-11 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-[11px] font-bold text-gray-700">
                        Agent Detection Timeout
                      </span>
                      <Info className="w-3 h-3 text-gray-300" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900">
                      {activeConfigTool.detection_timeout_ms / 1000}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="120000"
                    step="5000"
                    value={activeConfigTool.detection_timeout_ms}
                    onChange={(e) =>
                      setActiveConfigTool({
                        ...activeConfigTool,
                        detection_timeout_ms: Number(e.target.value),
                      })
                    }
                    className="w-full accent-gray-900 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Private Handoff Message (Whisper)
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Spoken only to the agent receiving the transfer.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveConfigTool({
                          ...activeConfigTool,
                          whisper_enabled: !activeConfigTool.whisper_enabled,
                        })
                      }
                      className={`w-10 h-5 rounded-full relative transition-all duration-200 ${
                        activeConfigTool.whisper_enabled
                          ? "bg-gray-900"
                          : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                          activeConfigTool.whisper_enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  {activeConfigTool.whisper_enabled && (
                    <textarea
                      value={activeConfigTool.whisper_message.content}
                      onChange={(e) =>
                        setActiveConfigTool({
                          ...activeConfigTool,
                          whisper_message: {
                            ...activeConfigTool.whisper_message,
                            content: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-xl text-xs font-medium outline-none border border-gray-100 min-h-[80px] resize-none animate-in fade-in slide-in-from-top-2 duration-200"
                      placeholder="e.g. You have a customer waiting for support..."
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Public Handoff Message (Three-way)
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Spoken to both parties after the transfer is successful.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveConfigTool({
                          ...activeConfigTool,
                          three_way_enabled:
                            !activeConfigTool.three_way_enabled,
                        })
                      }
                      className={`w-10 h-5 rounded-full relative transition-all duration-200 ${
                        activeConfigTool.three_way_enabled
                          ? "bg-gray-900"
                          : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                          activeConfigTool.three_way_enabled
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  {activeConfigTool.three_way_enabled && (
                    <textarea
                      value={activeConfigTool.three_way_message.content}
                      onChange={(e) =>
                        setActiveConfigTool({
                          ...activeConfigTool,
                          three_way_message: {
                            ...activeConfigTool.three_way_message,
                            content: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-xl text-xs font-medium outline-none border border-gray-100 min-h-[80px] resize-none animate-in fade-in slide-in-from-top-2 duration-200"
                      placeholder="e.g. Taking you over to the support agent now."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speak During Execution (Global) */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="speak_during_transfer"
            checked={activeConfigTool.speak_during_execution || false}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                speak_during_execution: e.target.checked,
              })
            }
            className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer transition-all"
          />
          <label
            htmlFor="speak_during_transfer"
            className="flex-1 cursor-pointer"
          >
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
    </div>
  );
};

export default TransferCallForm;
