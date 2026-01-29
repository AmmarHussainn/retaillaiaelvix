import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  Volume2,
  User,
  AlertCircle,
} from "lucide-react";
// Using CDN for Retell SDK - no local import needed
import { callService } from "../../services/callService";
import { useToast } from "../../context/ToastContext";

const WebCallModal = ({ onClose, agentId, agentName }) => {
  const [callStatus, setCallStatus] = useState("idle"); // idle, connecting, ongoing, ended, error
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [error, setError] = useState(null);

  const retellClientRef = useRef(null);
  const toast = useToast();

  const startCall = useCallback(async () => {
    setCallStatus("connecting");
    try {
      // 1. Create call on backend
      const data = await callService.createWebCall(agentId);

      // 2. Initialize SDK from global window object
      const RetellWebClient = window.RetellWebClient;
      if (!RetellWebClient) {
        throw new Error("Retell SDK not loaded. Please check your connection.");
      }

      const client = new RetellWebClient();
      retellClientRef.current = client;

      // 3. Set up listeners
      client.on("call_started", () => {
        setCallStatus("ongoing");
        toast.success("Call connected");
      });

      client.on("call_ended", () => {
        setCallStatus("ended");
      });

      client.on("agent_start_talking", () => setIsAgentSpeaking(true));
      client.on("agent_stop_talking", () => setIsAgentSpeaking(false));

      client.on("error", (err) => {
        console.error("SDK Error:", err);
        setError("Connection error. Please check your microphone.");
        setCallStatus("error");
      });

      // 4. Start the call
      await client.startCall({
        accessToken: data.access_token,
        sampleRate: 24000,
        enableUpdate: true,
      });
    } catch (err) {
      console.error("Start call error:", err);
      setError(err.response?.data?.error || "Failed to initialize call");
      setCallStatus("error");
    }
  }, [agentId, toast]);

  useEffect(() => {
    startCall();
    return () => {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }
    };
  }, [startCall]);

  const handleEndCall = () => {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
    setCallStatus("ended");
  };

  const toggleMute = () => {
    // Note: Mute functionality might depend on SDK version/capabilities
    // If SDK doesn't support directly, we could implement via MediaStream
    setIsMicMuted(!isMicMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-center border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${callStatus === "ongoing" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
            >
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Testing: {agentName}
              </h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                AI Voice Agent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animation & Status Area */}
        <div className="p-12 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-white to-gray-50/50">
          <div className="relative">
            {/* Visualizer Circles */}
            {callStatus === "ongoing" && (
              <>
                <div
                  className={`absolute inset-[-20px] rounded-full border-2 border-blue-400/20 animate-ping duration-[3000ms] ${isAgentSpeaking ? "opacity-100" : "opacity-0"}`}
                ></div>
                <div
                  className={`absolute inset-[-40px] rounded-full border-2 border-blue-400/10 animate-ping duration-[4000ms] ${isAgentSpeaking ? "opacity-100" : "opacity-0"}`}
                ></div>
              </>
            )}

            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                callStatus === "ongoing"
                  ? isAgentSpeaking
                    ? "bg-blue-600 scale-110 shadow-blue-200"
                    : "bg-blue-500 shadow-blue-100"
                  : callStatus === "ended"
                    ? "bg-gray-200 text-gray-500 grayscale"
                    : callStatus === "error"
                      ? "bg-red-500 shadow-red-200"
                      : "bg-blue-400 animate-pulse"
              }`}
            >
              {callStatus === "connecting" ? (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              ) : callStatus === "error" ? (
                <AlertCircle className="w-12 h-12 text-white" />
              ) : (
                <User className="w-16 h-16 text-white" />
              )}
            </div>

            {callStatus === "ongoing" && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white">
                <Mic className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {callStatus === "connecting" && "Connecting..."}
              {callStatus === "ongoing" &&
                (isAgentSpeaking ? "Agent is speaking" : "Listening...")}
              {callStatus === "ended" && "Call Ended"}
              {callStatus === "error" && "Connection Failed"}
            </h3>
            <p className="text-gray-500 max-w-[280px] leading-relaxed mx-auto font-medium">
              {callStatus === "connecting" &&
                "Fetching AI brain and initializing audio..."}
              {callStatus === "ongoing" &&
                "You can start talking to the AI agent now."}
              {callStatus === "ended" && "Thank you for testing the agent."}
              {callStatus === "error" &&
                (error || "Ensure your microphone is enabled.")}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-center space-x-6">
          {callStatus === "ongoing" ? (
            <>
              <button
                onClick={toggleMute}
                className={`p-5 rounded-2xl transition-all border shadow-sm active:scale-90 ${isMicMuted ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}
              >
                {isMicMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={handleEndCall}
                className="px-10 py-5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-xl shadow-red-200 transition-all flex items-center space-x-3 active:scale-95 group"
              >
                <PhoneOff className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>End Call</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl shadow-gray-200 transition-all active:scale-95"
            >
              {callStatus === "error" ? "Try Again" : "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebCallModal;
