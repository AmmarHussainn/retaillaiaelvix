import React, { useState } from "react";
import { X, Phone, Globe, Hash, Loader2, Sparkles } from "lucide-react";
import { phoneNumberService } from "../../services/phoneNumberService";
import { useToast } from "../../context/ToastContext";

const CreatePhoneNumberModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const [formData, setFormData] = useState({
    area_code: "310",
    nickname: "",
    toll_free: false,
    inbound_allowed_countries: ["US", "CA"],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        area_code: parseInt(formData.area_code, 10),
      };

      await phoneNumberService.createPhoneNumber(payload);
      toast.success("Phone number created successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Create phone error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create phone number";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Add Phone Number
              </h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">
                Provisioning new line
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

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold rounded-2xl animate-shake">
              {error}
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">
                Area Code
              </label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="number"
                  name="area_code"
                  required
                  value={formData.area_code}
                  onChange={handleChange}
                  className="pl-11 w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  placeholder="e.g 415"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium ml-1">
                3-digit regional code
              </p>
            </div>

            <div className="flex items-end">
              <label className="flex h-14 items-center space-x-3 cursor-pointer p-4 border border-gray-200 rounded-2xl w-full hover:bg-gray-50 transition-all active:scale-95 group">
                <input
                  type="checkbox"
                  name="toll_free"
                  checked={formData.toll_free}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500/20 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">
                    Toll Free
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Institutional line
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">
              Nickname / Label
            </label>
            <input
              type="text"
              name="nickname"
              required
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="e.g. California Support Line"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">
              Inbound Deployment
            </label>
            <div className="flex items-center space-x-3 text-[13px] text-gray-600 bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 shadow-inner">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-gray-900">US & Canada</span>
                <p className="text-[11px] text-gray-500 font-medium">
                  Standard regional accessibility
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] relative overflow-hidden group py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 transition-all active:scale-95"
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                )}
                <span>{loading ? "Purchasing..." : "Provision Number"}</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePhoneNumberModal;
