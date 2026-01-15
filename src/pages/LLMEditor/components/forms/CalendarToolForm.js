import React from "react";

const CalendarToolForm = ({ activeConfigTool, setActiveConfigTool }) => {
  return (
    <div className="space-y-6 pt-4 border-t border-gray-100">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
          Cal.com API Key
        </label>
        <input
          type="password"
          value={activeConfigTool.cal_api_key || ""}
          onChange={(e) =>
            setActiveConfigTool({
              ...activeConfigTool,
              cal_api_key: e.target.value,
            })
          }
          className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
          placeholder="cal_live_xxxxxxxxxxxx"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Event Type ID
          </label>
          <input
            type="number"
            value={activeConfigTool.event_type_id || ""}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                event_type_id: e.target.value,
              })
            }
            className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
            placeholder="123456"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Timezone
          </label>
          <select
            value={activeConfigTool.timezone || "America/Los_Angeles"}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                timezone: e.target.value,
              })
            }
            className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none border border-gray-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all cursor-pointer"
          >
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CalendarToolForm;
