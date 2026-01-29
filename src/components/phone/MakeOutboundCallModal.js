import React, { useState } from "react";
import {
  X,
  Phone,
  User,
  Loader2,
  PhoneOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { callService } from "../../services/callService";
import { useToast } from "../../context/ToastContext";

const MakeOutboundCallModal = ({
  onClose,
  fromNumber,
  agentId: initialAgentId,
  agents,
}) => {
  const [toNumber, setToNumber] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId || "");
  const [callStatus, setCallStatus] = useState("idle"); // idle, connecting, ongoing, ended, error
  const [currentCallId, setCurrentCallId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleStartCall = async () => {
    if (!toNumber || !selectedAgentId) {
      toast.error("Please provide a phone number and select an agent");
      return;
    }

    setIsLoading(true);
    setCallStatus("connecting");
    try {
      const data = await callService.createPhoneCall(
        fromNumber,
        toNumber,
        selectedAgentId,
      );
      setCurrentCallId(data.call_id);
      setCallStatus("ongoing");
      toast.success("Call initiated");

      // Start polling for status
      startPolling(data.call_id);
    } catch (err) {
      console.error("Call error:", err);
      setCallStatus("error");
      toast.error(err.response?.data?.error || "Failed to start call");
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (callId) => {
    const interval = setInterval(async () => {
      try {
        const data = await callService.getCallDetails(callId);
        if (data.call_status === "ended") {
          setCallStatus("ended");
          clearInterval(interval);
        } else if (data.call_status === "error") {
          setCallStatus("error");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const handleEndCall = async () => {
    if (!currentCallId) return;
    try {
      await callService.endCall(currentCallId);
      setCallStatus("ended");
      toast.success("Call ended");
    } catch (err) {
      console.error("End call error:", err);
      toast.error("Failed to end call");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Phone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Make a Call</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-gray-600 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {callStatus === "idle" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    +
                  </span>
                  <input
                    type="tel"
                    placeholder="14157774444"
                    value={toNumber}
                    onChange={(e) =>
                      setToNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Enter number in E.164 format (e.g., 1415...)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Agent
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value="">Choose an agent...</option>
                    {agents.map((a) => (
                      <option key={a.agent_id} value={a.agent_id}>
                        {a.agent_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStartCall}
                  disabled={isLoading || !toNumber || !selectedAgentId}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Phone className="w-5 h-5" />
                  )}
                  <span>Start AI Call</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
              {/* Status Indicator */}
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center animate-pulse shadow-inner ${
                    callStatus === "ongoing"
                      ? "bg-green-100 text-green-600"
                      : callStatus === "ended"
                        ? "bg-gray-100 text-gray-600"
                        : callStatus === "error"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {callStatus === "ongoing" ? (
                    <Phone className="w-10 h-10" />
                  ) : callStatus === "ended" ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : (
                    <AlertCircle className="w-10 h-10" />
                  )}
                </div>
                {callStatus === "ongoing" && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {callStatus}
                </h3>
                <p className="text-gray-500 mt-1">
                  {callStatus === "connecting" &&
                    "Establishing secure connection..."}
                  {callStatus === "ongoing" &&
                    `Call in progress with +${toNumber}`}
                  {callStatus === "ended" && "The conversation has completed."}
                  {callStatus === "error" &&
                    "Something went wrong. Please try again."}
                </p>
              </div>

              <div className="w-full pt-4">
                {callStatus === "ongoing" ? (
                  <button
                    onClick={handleEndCall}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>Hang Up</span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black shadow-lg shadow-gray-200 transition-all active:scale-95"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeOutboundCallModal;
