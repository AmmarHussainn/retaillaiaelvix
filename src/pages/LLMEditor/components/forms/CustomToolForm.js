import React from "react";
import { ChevronDown, Check, Plus, X, Trash2, Info } from "lucide-react";

const CustomToolForm = ({ activeConfigTool, setActiveConfigTool }) => {
  return (
    <div className="space-y-8 pt-4">
      {/* API Endpoint */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            API Endpoint
          </label>
          <p className="text-[11px] text-gray-500 font-medium ml-1">
            The API Endpoint is the address of the service you are connecting to
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={activeConfigTool.method || "POST"}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                method: e.target.value,
              })
            }
            className="w-28 px-4 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-bold outline-none border border-gray-100"
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            value={activeConfigTool.url || ""}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                url: e.target.value,
              })
            }
            className="flex-1 px-5 py-3.5 bg-gray-50 rounded-2xl text-[15px] font-medium outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all border border-gray-100"
            placeholder="Enter the URL of the custom function"
          />
        </div>
      </div>

      {/* Timeout */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
          Timeout (ms)
        </label>
        <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 rounded-2xl p-1">
          <input
            type="number"
            value={activeConfigTool.timeout_ms || 120000}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                timeout_ms: Number(e.target.value),
              })
            }
            className="flex-1 px-5 py-2.5 bg-transparent text-[15px] font-medium outline-none"
          />
          <span className="text-[13px] font-bold text-gray-400 border-l border-gray-200 pl-4 py-2 pr-4">
            milliseconds
          </span>
        </div>
      </div>

      {/* Headers & Query Params */}
      {["headers", "query_parameters"].map((key) => (
        <div key={key} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
              {key === "headers" ? "Headers" : "Query Parameters"}
            </label>
            <p className="text-[11px] text-gray-500 font-medium ml-1">
              {key === "headers"
                ? "Specify the HTTP headers required for your API request."
                : "Query string parameters to append to the URL."}
            </p>
          </div>
          <div className="space-y-2">
            {(activeConfigTool[key] || []).map((item, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200"
              >
                <input
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => {
                    const list = [...activeConfigTool[key]];
                    list[i].key = e.target.value;
                    setActiveConfigTool({
                      ...activeConfigTool,
                      [key]: list,
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
                />
                <input
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => {
                    const list = [...activeConfigTool[key]];
                    list[i].value = e.target.value;
                    setActiveConfigTool({
                      ...activeConfigTool,
                      [key]: list,
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
                />
                <button
                  onClick={() => {
                    const list = activeConfigTool[key].filter(
                      (_, idx) => idx !== i
                    );
                    setActiveConfigTool({
                      ...activeConfigTool,
                      [key]: list,
                    });
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const list = [
                  ...(activeConfigTool[key] || []),
                  { key: "", value: "" },
                ];
                setActiveConfigTool({
                  ...activeConfigTool,
                  [key]: list,
                });
              }}
              className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New key value pair</span>
            </button>
          </div>
        </div>
      ))}

      {/* Parameters (Optional) */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
              Parameters (Optional)
            </label>
            <div className="flex items-center space-x-6">
              {/* Payload: args only toggle */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 group/info relative">
                  <span className="text-[11px] font-bold text-gray-700">
                    Payload: args only
                  </span>
                  <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50">
                    If enabled, parameters will be passed as a root-level JSON
                    object instead of nested under "args".
                  </div>
                </div>
                <button
                  onClick={() =>
                    setActiveConfigTool({
                      ...activeConfigTool,
                      args_at_root: !activeConfigTool.args_at_root,
                    })
                  }
                  className={`w-10 h-5 rounded-full relative transition-all duration-200 ${
                    activeConfigTool.args_at_root
                      ? "bg-gray-900"
                      : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                      activeConfigTool.args_at_root ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() =>
                    setActiveConfigTool({
                      ...activeConfigTool,
                      parameterViewMode: "json",
                    })
                  }
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    activeConfigTool.parameterViewMode === "json"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => {
                    // If switching to form, try to initialize it from JSON if empty
                    let newForm = activeConfigTool.parametersForm || [];
                    if (newForm.length === 0 && activeConfigTool.parameters) {
                      try {
                        const parsed = JSON.parse(activeConfigTool.parameters);
                        const props = parsed.properties || parsed || {};
                        const required = Array.isArray(parsed.required)
                          ? parsed.required
                          : [];
                        newForm = Object.keys(props).map((key) => ({
                          name: key,
                          type: props[key].type || "string",
                          detail_mode: "description",
                          detail_content:
                            props[key].description || props[key].default || "",
                          required: required.includes(key),
                        }));
                      } catch (e) {}
                    }
                    setActiveConfigTool({
                      ...activeConfigTool,
                      parameterViewMode: "form",
                      parametersForm: newForm,
                    });
                  }}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    activeConfigTool.parameterViewMode === "form"
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Form
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 font-medium ml-1">
            JSON schema that defines the format in which the LLM will return.
            Please refer to the{" "}
            <span className="text-blue-500 cursor-pointer underline">docs</span>
            .
          </p>
        </div>

        {activeConfigTool.parameterViewMode === "form" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr,1.5fr,120px,80px,40px] gap-4 px-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Parameter Name
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Detail
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Type
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                Required
              </span>
              <span></span>
            </div>
            <div className="space-y-2">
              {(activeConfigTool.parametersForm || []).map((p, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[1fr,1.5fr,120px,80px,40px] gap-2 items-center animate-in slide-in-from-left-2 duration-200"
                >
                  <input
                    value={p.name}
                    onChange={(e) => {
                      const newList = [...activeConfigTool.parametersForm];
                      newList[idx].name = e.target.value;
                      setActiveConfigTool({
                        ...activeConfigTool,
                        parametersForm: newList,
                      });
                    }}
                    placeholder="field1"
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-medium"
                  />
                  <div className="flex items-center space-x-1">
                    <div className="relative group/detail">
                      <button className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 flex items-center space-x-1 min-w-[100px] justify-between">
                        <span>
                          {p.detail_mode.charAt(0).toUpperCase() +
                            p.detail_mode.slice(1)}
                        </span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 opacity-0 pointer-events-none group-hover/detail:opacity-100 group-hover/detail:pointer-events-auto transition-all">
                        {["description", "value"].map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              const newList = [
                                ...activeConfigTool.parametersForm,
                              ];
                              newList[idx].detail_mode = m;
                              setActiveConfigTool({
                                ...activeConfigTool,
                                parametersForm: newList,
                              });
                            }}
                            className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                          >
                            <span>
                              {m.charAt(0).toUpperCase() + m.slice(1)}
                            </span>
                            {p.detail_mode === m && (
                              <Check className="w-3 h-3 text-blue-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      value={p.detail_content}
                      onChange={(e) => {
                        const newList = [...activeConfigTool.parametersForm];
                        newList[idx].detail_content = e.target.value;
                        setActiveConfigTool({
                          ...activeConfigTool,
                          parametersForm: newList,
                        });
                      }}
                      placeholder="Description"
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <select
                    value={p.type}
                    onChange={(e) => {
                      const newList = [...activeConfigTool.parametersForm];
                      newList[idx].type = e.target.value;
                      setActiveConfigTool({
                        ...activeConfigTool,
                        parametersForm: newList,
                      });
                    }}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer font-medium"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="array">array</option>
                    <option value="object">object</option>
                  </select>
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={p.required}
                      onChange={(e) => {
                        const newList = [...activeConfigTool.parametersForm];
                        newList[idx].required = e.target.checked;
                        setActiveConfigTool({
                          ...activeConfigTool,
                          parametersForm: newList,
                        });
                      }}
                      className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newList = activeConfigTool.parametersForm.filter(
                        (_, i) => i !== idx
                      );
                      setActiveConfigTool({
                        ...activeConfigTool,
                        parametersForm: newList,
                      });
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newList = [
                    ...(activeConfigTool.parametersForm || []),
                    {
                      name: "",
                      type: "string",
                      detail_mode: "description",
                      detail_content: "",
                      required: false,
                    },
                  ];
                  setActiveConfigTool({
                    ...activeConfigTool,
                    parametersForm: newList,
                  });
                }}
                className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <textarea
              value={activeConfigTool.parameters || ""}
              onChange={(e) =>
                setActiveConfigTool({
                  ...activeConfigTool,
                  parameters: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-[#1e293b] text-gray-100 rounded-2xl text-[13px] font-mono outline-none min-h-[200px] shadow-inner"
              placeholder='{ "field1": "value" }'
            />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                onClick={() => {
                  const example = {
                    type: "object",
                    properties: {
                      param1: {
                        type: "string",
                        description: "First parameter",
                      },
                    },
                    required: ["param1"],
                  };
                  setActiveConfigTool({
                    ...activeConfigTool,
                    parameters: JSON.stringify(example, null, 2),
                  });
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold text-white transition-all"
              >
                example 1
              </button>
              <button
                onClick={() => {
                  const example = {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      age: { type: "number" },
                    },
                  };
                  setActiveConfigTool({
                    ...activeConfigTool,
                    parameters: JSON.stringify(example, null, 2),
                  });
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold text-white transition-all"
              >
                example 2
              </button>
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(activeConfigTool.parameters);
                    setActiveConfigTool({
                      ...activeConfigTool,
                      parameters: JSON.stringify(parsed, null, 2),
                    });
                  } catch (e) {}
                }}
                className="px-12 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
              >
                Format JSON
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Response Variables */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">
            Response Variables
          </label>
          <p className="text-[11px] text-gray-500 font-medium ml-1">
            Extracted values from API response saved as dynamic variables.
          </p>
        </div>
        <div className="space-y-2">
          {(activeConfigTool.response_variables || []).map((item, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200"
            >
              <input
                placeholder="Variable Name"
                value={item.key}
                onChange={(e) => {
                  const list = [...activeConfigTool.response_variables];
                  list[i].key = e.target.value;
                  setActiveConfigTool({
                    ...activeConfigTool,
                    response_variables: list,
                  });
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
              />
              <input
                placeholder="JSON Path or Value"
                value={item.value}
                onChange={(e) => {
                  const list = [...activeConfigTool.response_variables];
                  list[i].value = e.target.value;
                  setActiveConfigTool({
                    ...activeConfigTool,
                    response_variables: list,
                  });
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm outline-none"
              />
              <button
                onClick={() => {
                  const list = activeConfigTool.response_variables.filter(
                    (_, idx) => idx !== i
                  );
                  setActiveConfigTool({
                    ...activeConfigTool,
                    response_variables: list,
                  });
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const list = [
                ...(activeConfigTool.response_variables || []),
                { key: "", value: "" },
              ];
              setActiveConfigTool({
                ...activeConfigTool,
                response_variables: list,
              });
            }}
            className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New key value pair</span>
          </button>
        </div>
      </div>

      {/* Speech Toggles */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="speak_during"
            checked={activeConfigTool.speak_during_execution || false}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                speak_during_execution: e.target.checked,
              })
            }
            className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer"
          />
          <label htmlFor="speak_during" className="flex-1 cursor-pointer">
            <p className="text-sm font-bold text-gray-900">
              Speak During Execution
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              If the function takes over 2 seconds, the agent can say something
              like: "Let me check that for you."
            </p>
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="args_at_root"
            checked={activeConfigTool.args_at_root || false}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                args_at_root: e.target.checked,
              })
            }
            className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer"
          />
          <label htmlFor="args_at_root" className="flex-1 cursor-pointer">
            <p className="text-sm font-bold text-gray-900">Arguments at Root</p>
            <p className="text-[11px] text-gray-500 font-medium">
              If enabled, parameters will be passed as a root-level JSON object
              instead of nested under "args".
            </p>
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="speak_after"
            checked={activeConfigTool.speak_after_execution || false}
            onChange={(e) =>
              setActiveConfigTool({
                ...activeConfigTool,
                speak_after_execution: e.target.checked,
              })
            }
            className="w-5 h-5 accent-gray-900 rounded-lg cursor-pointer"
          />
          <label htmlFor="speak_after" className="flex-1 cursor-pointer">
            <p className="text-sm font-bold text-gray-900">
              Speak After Execution
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              Unselect if you want to run the function silently, such as
              uploading the call result to the server silently.
            </p>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CustomToolForm;
