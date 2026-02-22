import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Calendar,
  Clock,
  User,
  ChevronRight,
  Search,
  Filter,
  ExternalLink,
  Play,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  MessageSquare,
} from "lucide-react";
import { callService } from "../services/callService";
import { useToast } from "../context/ToastContext";

const CallAnalytics = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const toast = useToast();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const data = await callService.listCalls();
      setCalls(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching calls:", err);
      setError("Failed to fetch call logs");
      toast.error("Failed to fetch call logs");
    } finally {
      setLoading(false);
    }
  };

  const handleCallClick = async (callId) => {
    try {
      const details = await callService.getCallDetails(callId);
      setSelectedCall(details);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching call details:", err);
      toast.error("Failed to fetch call details");
    }
  };

  const handleDeleteCall = async (callId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this call log?"))
      return;

    try {
      // Assuming deleteCall is added to callService
      // await callService.deleteCall(callId);
      setCalls(calls.filter((c) => c.call_id !== callId));
      toast.success("Call log deleted");
    } catch (err) {
      console.error("Error deleting call:", err);
      toast.error("Failed to delete call log");
    }
  };

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.call_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (call.agent_id &&
        call.agent_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || call.call_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date =
      typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ended":
        return "bg-green-100 text-green-700 border-green-200";
      case "ongoing":
        return "bg-blue-100 text-blue-700 border-blue-200 animate-pulse";
      case "error":
        return "bg-red-100 text-red-700 border-red-200";
      case "registered":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const durationMs = end - start;
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-180px)] space-y-4 lg:space-y-6 animate-in fade-in duration-500 lg:overflow-hidden -m-4 lg:m-0 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Call Logs
          </h1>
          <p className="text-sm text-gray-500">
            Track and analyze all your AI agent conversations
          </p>
        </div>
        <button
          onClick={fetchCalls}
          className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Loader2
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or Agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm lg:text-base"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none text-sm lg:text-base"
          >
            <option value="all">All Statuses</option>
            <option value="ended">Ended</option>
            <option value="ongoing">Ongoing</option>
            <option value="error">Error</option>
            <option value="registered">Registered</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[400px] lg:min-h-0 overflow-hidden">
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[800px] lg:min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50/95 backdrop-blur-sm border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">
                  Call Info
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">
                  Type
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">
                  Duration
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">
                  Created At
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b border-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Loading calls...</p>
                  </td>
                </tr>
              ) : filteredCalls.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <PhoneCall className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No calls found</p>
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr
                    key={call.call_id}
                    onClick={() => handleCallClick(call.call_id)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                          <PhoneCall className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                            {call.call_id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Agent: {call.agent_id?.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(call.call_status)}`}
                      >
                        {call.call_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {call.call_type?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-1.5 opacity-40" />
                        {getDuration(call.start_timestamp, call.end_timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(call.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleDeleteCall(call.call_id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Details Modal */}
      {isModalOpen && selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
          <div className="bg-white lg:rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col scale-in duration-300">
            {/* Modal Header */}
            <div className="px-5 lg:px-8 py-4 lg:py-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="p-2 lg:p-3 bg-blue-100 text-blue-600 rounded-xl lg:rounded-2xl">
                  <PhoneCall className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                    Call Details
                  </h2>
                  <p className="text-[10px] lg:text-sm text-gray-500 font-medium truncate max-w-[150px] lg:max-w-none">
                    ID: {selectedCall.call_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 lg:p-3 hover:bg-white rounded-xl lg:rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-5 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Stats Column */}
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-[2rem] space-y-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Analysis
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
                          Sentiment
                        </p>
                        <p className="font-bold text-gray-700">
                          {selectedCall.call_analysis?.sentiment || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-black tracking-widest">
                          Summary
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedCall.call_analysis?.call_summary ||
                            "No summary available."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedCall.recording_url && (
                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                      <h3 className="font-bold text-blue-900 flex items-center mb-4">
                        <Play className="w-4 h-4 mr-2" />
                        Recording
                      </h3>
                      <audio controls className="w-full">
                        <source
                          src={selectedCall.recording_url}
                          type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {selectedCall.public_log_url && (
                    <a
                      href={selectedCall.public_log_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-700">
                        View Public Logs
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                </div>

                {/* Transcript Column */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                    Transcript
                  </h3>
                  <div className="bg-gray-50 rounded-[2rem] lg:rounded-[2.5rem] p-5 lg:p-8 min-h-[300px] lg:min-h-[400px] border border-gray-100">
                    {selectedCall.transcript ? (
                      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                        {selectedCall.transcript.split("\n").map((line, i) => (
                          <p key={i} className="mb-4">
                            {line.startsWith("Agent:") ||
                            line.startsWith("User:") ? (
                              <>
                                <span
                                  className={`font-black uppercase tracking-tighter mr-2 ${line.startsWith("Agent:") ? "text-blue-600" : "text-indigo-600"}`}
                                >
                                  {line.split(":")[0]}:
                                </span>
                                {line.split(":").slice(1).join(":")}
                              </>
                            ) : (
                              line
                            )}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center space-y-4">
                        <FileText className="w-12 h-12 opacity-10" />
                        <p>No transcript available for this call.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallAnalytics;
