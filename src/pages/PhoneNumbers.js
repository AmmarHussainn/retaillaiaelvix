import React, { useState, useEffect, useCallback } from "react";
import {
  Phone,
  Plus,
  Trash2,
  Edit2,
  Search,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  MessageSquare,
  Copy,
  MoreVertical,
} from "lucide-react";
import { phoneNumberService } from "../services/phoneNumberService";
import agentService from "../services/agentService";
import CreatePhoneNumberModal from "../components/phone/CreatePhoneNumberModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { useToast } from "../context/ToastContext";
import MakeOutboundCallModal from "../components/phone/MakeOutboundCallModal";

const PhoneNumbers = () => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isMakeCallModalOpen, setIsMakeCallModalOpen] = useState(false);
  const toast = useToast();

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null,
    data: null,
    title: "",
    message: "",
    confirmText: "",
    isDestructive: false,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [numbersData, agentsData] = await Promise.all([
        phoneNumberService.getAllPhoneNumbers(),
        agentService.getAllAgents(),
      ]);

      const numbers = Array.isArray(numbersData) ? numbersData : [];
      setPhoneNumbers(numbers);
      if (numbers.length > 0 && !selectedNumber) {
        setSelectedNumber(numbers[0]);
      }
      setAgents(
        Array.isArray(agentsData) ? agentsData : agentsData.agents || [],
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateNumber = async (updatedData) => {
    if (!selectedNumber) return;
    try {
      await phoneNumberService.updatePhoneNumber(
        selectedNumber.phone_number,
        updatedData,
      );
      const updatedNumber = { ...selectedNumber, ...updatedData };
      setSelectedNumber(updatedNumber);
      setPhoneNumbers(
        phoneNumbers.map((n) =>
          n.phone_number === selectedNumber.phone_number ? updatedNumber : n,
        ),
      );
      toast.success("Settings updated");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update settings");
    }
  };

  const initDelete = (number) => {
    setConfirmationModal({
      isOpen: true,
      type: "delete",
      data: number,
      title: "Delete Phone Number",
      message:
        "Are you sure you want to delete this phone number? This action cannot be undone.",
      confirmText: "Delete Number",
      isDestructive: true,
    });
  };

  const handleConfirmAction = async () => {
    const { type, data: number } = confirmationModal;
    if (!number) return;

    try {
      if (type === "delete") {
        await phoneNumberService.deletePhoneNumber(number);
        const remaining = phoneNumbers.filter((p) => p.phone_number !== number);
        setPhoneNumbers(remaining);
        if (selectedNumber?.phone_number === number) {
          setSelectedNumber(remaining[0] || null);
        }
        toast.success("Phone number deleted");
      }
    } catch (err) {
      console.error(`${type} error:`, err);
      toast.error(`Failed to ${type} number`);
    } finally {
      setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const formatPhoneNumber = (numStr) => {
    if (!numStr) return "";
    const cleaned = numStr.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1(${cleaned.slice(1, 4)})${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    return numStr;
  };

  const filteredNumbers = phoneNumbers.filter(
    (num) =>
      num.phone_number.includes(searchTerm) ||
      num.nickname?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden -m-6 bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Phone Numbers</h2>
          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search phone numbers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-400 font-medium">
              Loading...
            </div>
          ) : filteredNumbers.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              No numbers found
            </div>
          ) : (
            filteredNumbers.map((num) => (
              <button
                key={num.phone_number}
                onClick={() => setSelectedNumber(num)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                  selectedNumber?.phone_number === num.phone_number
                    ? "bg-blue-50/50 text-blue-600 border border-blue-50"
                    : "hover:bg-gray-50 text-gray-700 border border-transparent"
                }`}
              >
                <span className="font-semibold text-[14px] tracking-tight">
                  {formatPhoneNumber(num.phone_number)}
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-all ${
                    selectedNumber?.phone_number === num.phone_number
                      ? "opacity-100"
                      : "opacity-0 invisible group-hover:visible group-hover:opacity-100"
                  }`}
                />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-white overflow-y-auto">
        {selectedNumber ? (
          <div className="max-w-6xl mx-auto p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tightest">
                    {formatPhoneNumber(selectedNumber.phone_number)}
                  </h1>
                  <button className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
                    <Edit2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-[13px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    ID: {selectedNumber.phone_number}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          selectedNumber.phone_number,
                        );
                        toast.success("Phone ID copied");
                      }}
                      className="hover:text-blue-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </span>
                  <span className="text-gray-300"> • </span>
                  <span>Provider: Twilio</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsMakeCallModalOpen(true)}
                  className="flex items-center px-4.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                  <PhoneCall className="w-4 h-4 mr-2.5" />
                  Make an outbound call
                </button>
                <button className="flex items-center px-4.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <MessageSquare className="w-4 h-4 mr-2.5" />
                  Make an outbound SMS
                </button>
                <div className="relative group">
                  <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                    <button
                      onClick={() => initDelete(selectedNumber.phone_number)}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center font-bold"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Number
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Inbound Call Agent Section */}
            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Inbound Call Agent
                </h3>
              </div>
              <div className="p-8 space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label
                      htmlFor="inboundAgentSelect"
                      className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[11px]"
                    >
                      Call Agent
                    </label>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      id="inboundAgentSelect"
                      className="w-full p-4.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none font-medium text-sm transition-all"
                      value={selectedNumber.inbound_agent_id || ""}
                      onChange={(e) =>
                        handleUpdateNumber({ inbound_agent_id: e.target.value })
                      }
                    >
                      <option value="">Select an agent...</option>
                      {agents.map((agent) => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.agent_name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-5 bg-white rounded-2xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="inboundWebhook"
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                  />
                  <label
                    htmlFor="inboundWebhook"
                    className="text-[14px] text-gray-600 font-medium"
                  >
                    Add an inbound webhook.{" "}
                    <button className="text-blue-600 font-bold hover:underline">
                      Learn more.
                    </button>
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="inboundCountrySelect"
                    className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest text-[11px]"
                  >
                    Allowed Inbound Countries
                  </label>
                  <div className="relative">
                    <select
                      id="inboundCountrySelect"
                      className="w-full p-4.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 focus:ring-2 focus:ring-blue-500/10 outline-none appearance-none cursor-not-allowed font-medium text-sm"
                      disabled
                    >
                      <option>All countries allowed</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Outbound Call Agent Section */}
            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Outbound Call Agent
                </h3>
              </div>
              <div className="p-8 space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label
                      htmlFor="outboundAgentSelect"
                      className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[11px]"
                    >
                      Call Agent
                    </label>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      id="outboundAgentSelect"
                      className="w-full p-4.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none font-medium text-sm transition-all"
                      value={selectedNumber.outbound_agent_id || ""}
                      onChange={(e) =>
                        handleUpdateNumber({
                          outbound_agent_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select an agent...</option>
                      {agents.map((agent) => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.agent_name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="outboundCountrySelect"
                    className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-widest text-[11px]"
                  >
                    Allowed Outbound Countries
                  </label>
                  <div className="relative">
                    <select
                      id="outboundCountrySelect"
                      className="w-full p-4.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 focus:ring-2 focus:ring-blue-500/10 outline-none appearance-none cursor-not-allowed font-medium text-sm"
                      disabled
                    >
                      <option>All countries allowed</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white text-gray-400 flex-col space-y-6">
            <div className="p-10 bg-gray-50 rounded-[2.5rem] shadow-inner border border-gray-100">
              <Phone className="w-14 h-14 text-gray-200 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 tracking-tight">
                No number selected
              </p>
              <p className="text-gray-500 font-medium">
                Choose a phone number from the sidebar to manage settings
              </p>
            </div>
          </div>
        )}
      </div>

      {isBuyModalOpen && (
        <CreatePhoneNumberModal
          onClose={() => setIsBuyModalOpen(false)}
          onSuccess={fetchData}
        />
      )}

      {isMakeCallModalOpen && (
        <MakeOutboundCallModal
          onClose={() => setIsMakeCallModalOpen(false)}
          fromNumber={selectedNumber?.phone_number}
          agentId={selectedNumber?.outbound_agent_id}
          agents={agents}
        />
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={handleConfirmAction}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        isDestructive={confirmationModal.isDestructive}
      />
    </div>
  );
};

export default PhoneNumbers;
