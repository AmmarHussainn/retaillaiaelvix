import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import llmService from "../services/llmService";
import knowledgeBaseService from "../services/knowledgeBaseService";
import agentService from "../services/agentService";
import { useToast } from "../context/ToastContext";

// Components
import EditorHeader from "./LLMEditor/components/EditorHeader";
import PromptSection from "./LLMEditor/components/PromptSection";
import FunctionsSection from "./LLMEditor/components/FunctionsSection";
import KnowledgeBaseSection from "./LLMEditor/components/KnowledgeBaseSection";
import GeneralSettingsSection from "./LLMEditor/components/GeneralSettingsSection";
import ToolConfigModal from "./LLMEditor/components/ToolConfigModal";
import VariablesSubModal from "./LLMEditor/components/VariablesSubModal";

const LLMEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    functions: true,
    knowledgeBase: false,
    speech: false,
    advanced_call: false,
    post_call: false,
    webhooks: false,
    mcp: false,
  });

  const [availableKbs, setAvailableKbs] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [kbDropdownOpen, setKbDropdownOpen] = useState(false);
  const [kbSettingsOpen, setKbSettingsOpen] = useState(false);
  const [postCallDropdownOpen, setPostCallDropdownOpen] = useState(false);
  const [tempKbConfig, setTempKbConfig] = useState({
    top_k: 3,
    filter_score: 0.6,
  });
  const [activeConfigTool, setActiveConfigTool] = useState(null);
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [functionsDropdownOpen, setFunctionsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    model: "gpt-4.1",
    s2s_model: null,
    model_temperature: 0,
    model_high_priority: false,
    tool_call_strict_mode: true,
    general_prompt: "",
    begin_message: "",
    start_speaker: "agent",
    begin_after_user_silence_ms: 2000,
    general_tools: [],
    states: [],
    starting_state: "",
    knowledge_base_ids: [],
    default_dynamic_variables: {},
    mcps: [],
    kb_config: {
      top_k: 3,
      filter_score: 0.6,
    },
    post_call_analysis_data: [
      {
        name: "call_summary",
        type: "text",
        description: "Summary of the call",
      },
      {
        name: "call_successful",
        type: "boolean",
        description: "Whether the call was successful",
      },
    ],
    post_call_analysis_model: "gpt-4.1-mini",
    webhook_url: "",
    webhook_timeout_ms: 5000,
    name: "New Response Engine",
  });

  const normalizeTools = useCallback((tools) => {
    if (!Array.isArray(tools)) return [];
    return tools.map((tool) => {
      const normalized = { ...tool };

      // Map execution message description to flat field
      if (tool.execution_message_description !== undefined) {
        normalized.execution_message = tool.execution_message_description;
      }

      if (tool.type === "transfer_call") {
        const dest = tool.transfer_destination || {};
        const opt = tool.transfer_option || {};

        normalized.transfer_to_type =
          dest.type === "predefined" ? "static" : "dynamic";
        normalized.transfer_to_number = dest.number || "";
        normalized.transfer_to_prompt = dest.prompt || "";
        normalized.extension_number = dest.extension || "";

        normalized.transfer_type = opt.type || "cold_transfer";
        normalized.displayed_caller_id = opt.show_transferee_as_caller
          ? "user"
          : "agent";
        normalized.detection_timeout_ms =
          opt.agent_detection_timeout_ms || 30000;
        normalized.on_hold_music = opt.on_hold_music || "ringtone";

        // Handle nested messages for UI toggles
        normalized.whisper_enabled = !!opt.private_handoff_option;
        normalized.whisper_message = opt.private_handoff_option?.message
          ? { type: "static", content: opt.private_handoff_option.message }
          : { type: "static", content: "" };

        normalized.three_way_enabled = !!opt.public_handoff_option;
        normalized.three_way_message = opt.public_handoff_option?.message
          ? { type: "static", content: opt.public_handoff_option.message }
          : { type: "static", content: "" };

        // Convert key-value headers to array for form
        normalized.custom_sip_headers = Object.entries(
          tool.custom_sip_headers || {}
        ).map(([key, value]) => ({ key, value }));
      } else if (tool.type === "agent_swap") {
        // UI uses agent_transfer for both swap and transfer types for simplicity
        normalized.type = "agent_transfer";
      } else if (tool.type === "custom") {
        // Convert key-value maps to arrays for form components
        normalized.headers = Object.entries(tool.headers || {}).map(
          ([key, value]) => ({ key, value })
        );
        normalized.query_parameters = Object.entries(
          tool.query_params || tool.query_parameters || {}
        ).map(([key, value]) => ({ key, value }));
        normalized.response_variables = Object.entries(
          tool.response_variables || {}
        ).map(([key, value]) => ({ key, value }));

        // Default to JSON mode for parameters when loading existing
        normalized.parameterViewMode = "json";
        if (tool.parameters) {
          normalized.parameters =
            typeof tool.parameters === "string"
              ? tool.parameters
              : JSON.stringify(tool.parameters, null, 2);
        }
      }

      return normalized;
    });
  }, []);

  const fetchLLM = useCallback(async () => {
    try {
      const data = await llmService.getLLM(id);
      setFormData((prev) => ({
        ...prev,
        ...data,
        kb_config: data.kb_config || { top_k: 3, filter_score: 0.6 },
        default_dynamic_variables: data.default_dynamic_variables || {},
        general_tools: normalizeTools(data.general_tools),
        states: data.states || [],
        knowledge_base_ids: data.knowledge_base_ids || [],
        mcps: data.mcps || [],
      }));
    } catch (error) {
      console.error("Error fetching LLM:", error);
      toast.error("Failed to load LLM details");
      navigate("/llms");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast, normalizeTools]);

  const fetchAvailableKbs = useCallback(async () => {
    try {
      const data = await knowledgeBaseService.getAllKnowledgeBases();
      setAvailableKbs(Array.isArray(data) ? data : data.knowledge_bases || []);
    } catch (error) {
      console.error("Error fetching available KBs:", error);
    }
  }, []);

  const fetchAvailableAgents = useCallback(async () => {
    try {
      const data = await agentService.getAllAgents();
      setAvailableAgents(Array.isArray(data) ? data : data.agents || []);
    } catch (error) {
      console.error("Error fetching available agents:", error);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchLLM();
    }
    fetchAvailableKbs();
    fetchAvailableAgents();
  }, [isEditMode, fetchLLM, fetchAvailableKbs, fetchAvailableAgents]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    if (type === "checkbox") {
      finalValue = checked;
    } else if (
      name === "model_temperature" ||
      name === "begin_after_user_silence_ms"
    ) {
      finalValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleRemoveTool = (index) => {
    setFormData((prev) => ({
      ...prev,
      general_tools: prev.general_tools.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };

      // Ensure mutual exclusivity of model and s2s_model
      if (payload.s2s_model) {
        delete payload.model;
      } else {
        delete payload.s2s_model;
      }

      // Remove states (as requested to remove Conversation Flow)
      delete payload.states;
      delete payload.starting_state;

      if (payload.general_tools && payload.general_tools.length > 0) {
        payload.general_tools = payload.general_tools.map((tool) => {
          const initialType = tool.type;
          const cleanTool = { ...tool };

          if (initialType === "transfer_call") {
            const transferTool = {
              type: "transfer_call",
              name: tool.name,
              description: tool.description || "Transfer the call",
              speak_during_execution: !!tool.speak_during_execution,
              execution_message_description:
                tool.execution_message ||
                tool.execution_message_description ||
                "",
            };

            const destType =
              tool.transfer_to_type === "static" ? "predefined" : "inferred";
            if (destType === "predefined") {
              transferTool.transfer_destination = {
                type: "predefined",
                number: tool.transfer_to_number || "+1234567890",
              };
              if (tool.extension_number?.trim()) {
                transferTool.transfer_destination.extension =
                  tool.extension_number;
              }
            } else {
              transferTool.transfer_destination = {
                type: "inferred",
                prompt:
                  tool.transfer_to_prompt || "Transfer the call to support.",
              };
            }

            const tType = tool.transfer_type || "cold_transfer";
            transferTool.transfer_option = {
              type: tType,
              show_transferee_as_caller: tool.displayed_caller_id === "user",
            };

            if (tType === "warm_transfer") {
              transferTool.transfer_option.agent_detection_timeout_ms =
                tool.detection_timeout_ms || 30000;
              transferTool.transfer_option.on_hold_music =
                tool.on_hold_music || "ringtone";

              if (tool.three_way_enabled && tool.three_way_message?.content) {
                transferTool.transfer_option.public_handoff_option = {
                  type: "static_message",
                  message: tool.three_way_message.content,
                };
              }
              if (tool.whisper_enabled && tool.whisper_message?.content) {
                transferTool.transfer_option.private_handoff_option = {
                  type: "static_message",
                  message: tool.whisper_message.content,
                };
              }
            }

            if (Array.isArray(tool.custom_sip_headers)) {
              const headersObj = {};
              tool.custom_sip_headers.forEach((h) => {
                if (h.key) headersObj[h.key] = h.value;
              });
              if (Object.keys(headersObj).length > 0) {
                transferTool.custom_sip_headers = headersObj;
              }
            }

            if (tool.ignore_e164_validation !== undefined) {
              transferTool.ignore_e164_validation =
                !!tool.ignore_e164_validation;
            }

            return transferTool;
          }

          if (
            initialType === "agent_transfer" ||
            initialType === "agent_swap"
          ) {
            const swapTool = {
              type: "agent_swap",
              name: tool.name,
              description: tool.description || "Transfer to another agent",
              agent_id: tool.agent_id,
              agent_version: Number(tool.agent_version) || 1,
              speak_during_execution: !!tool.speak_during_execution,
              execution_message_description:
                tool.execution_message ||
                tool.execution_message_description ||
                "",
              post_call_analysis_setting:
                tool.post_call_analysis_setting || "both_agents",
              webhook_setting: tool.webhook_setting || "only_source_agent",
            };

            if (!swapTool.agent_id) {
              throw new Error(
                `Agent Transfer tool "${swapTool.name}" requires an agent selection.`
              );
            }

            return swapTool;
          }

          if (initialType === "end_call") {
            return {
              type: "end_call",
              name: tool.name,
              description: tool.description || "End the call",
              speak_during_execution: !!tool.speak_during_execution,
              execution_message_description:
                tool.execution_message ||
                tool.execution_message_description ||
                "",
            };
          }

          if (
            ["check_availability_cal", "book_appointment_cal"].includes(
              initialType
            )
          ) {
            return {
              type: initialType,
              name: tool.name,
              description: tool.description || "Calendar tool",
              cal_api_key: tool.cal_api_key || "default_key",
              event_type_id: Number(tool.event_type_id) || 12345,
              timezone: tool.timezone,
            };
          }

          if (initialType === "send_sms") {
            return {
              type: "send_sms",
              name: tool.name,
              description: tool.description || "Send SMS",
              sms_content:
                tool.sms_content && typeof tool.sms_content === "object"
                  ? tool.sms_content
                  : {
                      type: "predefined",
                      content: tool.sms_content || "Default SMS content",
                    },
            };
          }

          if (initialType === "press_digit") {
            return {
              type: "press_digit",
              name: tool.name,
              description: tool.description || "Press digit",
              delay_ms: Number(tool.delay_ms) || 1000,
            };
          }

          if (initialType === "custom") {
            const customTool = {
              type: "custom",
              name: tool.name,
              url: tool.url,
              description: tool.description,
              method: tool.method || "POST",
              speak_during_execution: !!tool.speak_during_execution,
              speak_after_execution: tool.speak_after_execution !== false,
              execution_message_description:
                tool.execution_message ||
                tool.execution_message_description ||
                "",
              timeout_ms: Number(tool.timeout_ms) || 120000,
              args_at_root: !!tool.args_at_root,
            };

            if (!customTool.url)
              throw new Error(`Custom tool "${tool.name}" requires a URL`);
            if (!customTool.description)
              throw new Error(
                `Custom tool "${tool.name}" requires a description`
              );

            if (customTool.url && !customTool.url.startsWith("http")) {
              customTool.url = "https://" + customTool.url;
            }

            if (Array.isArray(tool.headers)) {
              customTool.headers = tool.headers.reduce((acc, curr) => {
                if (curr.key) acc[curr.key] = curr.value || "";
                return acc;
              }, {});
            }

            const qParams = tool.query_params || tool.query_parameters;
            if (Array.isArray(qParams)) {
              customTool.query_params = qParams.reduce((acc, curr) => {
                if (curr.key) acc[curr.key] = curr.value || "";
                return acc;
              }, {});
            }

            if (Array.isArray(tool.response_variables)) {
              customTool.response_variables = tool.response_variables.reduce(
                (acc, curr) => {
                  if (curr.key) acc[curr.key] = curr.value || "";
                  return acc;
                },
                {}
              );
            }

            if (
              tool.parameterViewMode === "form" &&
              Array.isArray(tool.parametersForm)
            ) {
              const properties = {};
              const required = [];
              tool.parametersForm.forEach((p) => {
                if (p.name) {
                  properties[p.name] = {
                    type: p.type || "string",
                    description:
                      p.detail_mode === "description" ? p.detail_content : "",
                  };
                  if (p.required) required.push(p.name);
                }
              });
              customTool.parameters = { type: "object", properties, required };
            } else if (tool.parameters) {
              try {
                const parsed =
                  typeof tool.parameters === "string"
                    ? JSON.parse(tool.parameters)
                    : tool.parameters;
                customTool.parameters = parsed;
              } catch (e) {
                console.error("Error parsing custom tool parameters:", e);
              }
            }

            return customTool;
          }

          if (initialType === "extract_dynamic_variable") {
            return {
              type: "extract_dynamic_variable",
              name: tool.name,
              description: tool.description,
              variables: Array.isArray(tool.variables) ? tool.variables : [],
            };
          }

          Object.keys(cleanTool).forEach((key) => {
            if (
              cleanTool[key] === null ||
              cleanTool[key] === undefined ||
              (cleanTool[key] === "" && key !== "execution_message_description")
            ) {
              if (key !== "name" && key !== "type") {
                delete cleanTool[key];
              }
            }
          });

          return cleanTool;
        });
      } else {
        delete payload.general_tools;
      }

      delete payload.webhook_url;
      delete payload.webhook_timeout_ms;
      delete payload.post_call_analysis_data;
      delete payload.post_call_analysis_model;
      delete payload.name;

      if (payload.knowledge_base_ids?.length === 0)
        delete payload.knowledge_base_ids;
      if (Object.keys(payload.default_dynamic_variables).length === 0)
        delete payload.default_dynamic_variables;
      if (payload.mcps.length === 0) delete payload.mcps;

      if (isEditMode) {
        await llmService.updateLLM(id, payload);
        toast.success("LLM updated successfully");
      } else {
        await llmService.createLLM(payload);
        toast.success("LLM created successfully");
      }
      navigate("/llms");
    } catch (error) {
      console.error("Error saving LLM:", error);
      toast.error(
        "Failed to save LLM: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-6 bg-[#f8fafc]">
      <EditorHeader
        isEditMode={isEditMode}
        id={id}
        formData={formData}
        setFormData={setFormData}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        saving={saving}
        handleSubmit={handleSubmit}
        navigate={navigate}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 relative">
          <PromptSection
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </div>

        <div className="w-[400px] bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-2">
          <FunctionsSection
            formData={formData}
            setFormData={setFormData}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            setActiveConfigTool={setActiveConfigTool}
            handleRemoveTool={handleRemoveTool}
            functionsDropdownOpen={functionsDropdownOpen}
            setFunctionsDropdownOpen={setFunctionsDropdownOpen}
          />

          <KnowledgeBaseSection
            formData={formData}
            setFormData={setFormData}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            availableKbs={availableKbs}
            kbDropdownOpen={kbDropdownOpen}
            setKbDropdownOpen={setKbDropdownOpen}
            kbSettingsOpen={kbSettingsOpen}
            setKbSettingsOpen={setKbSettingsOpen}
            tempKbConfig={tempKbConfig}
            setTempKbConfig={setTempKbConfig}
            toast={toast}
            navigate={navigate}
          />

          <GeneralSettingsSection
            formData={formData}
            setFormData={setFormData}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleInputChange={handleInputChange}
            postCallDropdownOpen={postCallDropdownOpen}
            setPostCallDropdownOpen={setPostCallDropdownOpen}
          />
        </div>
      </div>

      <ToolConfigModal
        activeConfigTool={activeConfigTool}
        setActiveConfigTool={setActiveConfigTool}
        formData={formData}
        setFormData={setFormData}
        availableAgents={availableAgents}
        setIsVarModalOpen={setIsVarModalOpen}
        toast={toast}
      />

      <VariablesSubModal
        isVarModalOpen={isVarModalOpen}
        setIsVarModalOpen={setIsVarModalOpen}
        activeConfigTool={activeConfigTool}
        setFormData={setFormData}
      />
    </div>
  );
};

export default LLMEditor;
