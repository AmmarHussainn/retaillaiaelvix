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
  Copy,
  MoreVertical,
  User,
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
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
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

  const handleSelectNumber = (num) => {
    setSelectedNumber(num);
    setShowSidebarOnMobile(false);
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
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-100px)] overflow-hidden lg:-m-6 bg-white relative">
      {/* Sidebar */}
      <div
        className={`${
          showSidebarOnMobile ? "flex" : "hidden lg:flex"
        } w-full lg:w-80 border-r border-gray-100 flex-col bg-white h-full z-10`}
      >
        <div className="pr-6 pt-9 pl-8 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Phone Numbers</h2>
          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="pr-6 pl-8 pt-3 pb-4">
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
                onClick={() => handleSelectNumber(num)}
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
      <div
        className={`${
          !showSidebarOnMobile ? "block" : "hidden lg:block"
        } flex-1 bg-white overflow-y-auto h-full pb-20 lg:pb-0`}
      >
        {selectedNumber ? (
          <div className="max-w-6xl mx-auto p-4 lg:p-10 space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Mobile Back Button */}
            <button
              onClick={() => setShowSidebarOnMobile(true)}
              className="lg:hidden flex items-center text-blue-600 font-bold mb-4"
            >
              <ChevronRight className="w-5 h-5 rotate-180 mr-1" />
              Back to list
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-1.5 w-full md:w-auto">
                <div className="flex items-center justify-between md:justify-start space-x-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tightest">
                    {formatPhoneNumber(selectedNumber.phone_number)}
                  </h1>
                  <button className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
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
                  <span className="hidden md:inline text-gray-300"> • </span>
                  <span className="bg-gray-50 px-2 py-1 rounded-md">
                    Provider: Twilio
                  </span>
                </div>
              </div>

              <div className="flex sm:space-x-2 w-full sm:w-auto flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setIsMakeCallModalOpen(true)}
                  className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all w-full sm:w-auto"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Make an outbound call
                </button>
                <div className="relative group w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all sm:aspect-square">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                    <span className="sm:hidden ml-2 font-bold text-sm text-gray-700">
                      More Actions
                    </span>
                  </button>
                  <div className="absolute right-0 bottom-full sm:bottom-auto sm:mt-2 w-full sm:w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
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
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                      <User className="w-5 h-5" />
                    </div>
                    <select
                      id="inboundAgentSelect"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none font-bold text-sm transition-all cursor-pointer hover:bg-white hover:border-gray-300 hover:shadow-sm"
                      value={selectedNumber.inbound_agent_id || ""}
                      onChange={(e) =>
                        handleUpdateNumber({
                          inbound_agent_id: e.target.value,
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
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
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
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 focus:ring-2 focus:ring-blue-500/10 outline-none appearance-none cursor-not-allowed font-medium text-sm"
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
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                      <User className="w-5 h-5" />
                    </div>
                    <select
                      id="outboundAgentSelect"
                      className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none font-bold text-sm transition-all cursor-pointer hover:bg-white hover:border-gray-300 hover:shadow-sm"
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
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
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
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 focus:ring-2 focus:ring-blue-500/10 outline-none appearance-none cursor-not-allowed font-medium text-sm"
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
