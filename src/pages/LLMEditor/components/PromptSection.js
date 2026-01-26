import React from "react";
import { Cpu, Mic, Globe } from "lucide-react";

const PromptSection = ({ formData, handleInputChange }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Config Pills */}
      <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <Cpu className="w-4 h-4 text-gray-400" />
          <select
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4"
          >
            <optgroup label="OpenAI">
              {/* <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o-realtime">GPT-4o Realtime</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option> */}
              <option value="gpt-5.2">GPT-5.2</option>
              <option value="gpt-5.1">GPT-5.1</option>
              <option value="gpt-5">GPT-5</option>
              <option value="gpt-5-mini">GPT-5 mini</option>
              <option value="gpt-5-nano">GPT-5 nano</option>
              <option value="gpt-4.1">GPT-4.1</option>
              <option value="gpt-4.1-mini">GPT-4.1 mini</option>
              <option value="gpt-4.1-nano">GPT-4.1 nano</option>
              <option value="gpt-realtime">GPT Realtime</option>
              <option value="gpt-realtime-mini">GPT Realtime Mini</option>
              <option value="gpt-4o-realtime">GPT-4o Realtime</option>
              <option value="gpt-4o-mini-realtime">GPT-4o Mini Realtime</option>
            </optgroup>
            <optgroup label="Anthropic">
              <option value="claude-4.5-sonnet">Claude 4.5 Sonnet</option>
              {/* <option value="claude-3-opus">Claude 3 Opus</option> */}
              <option value="claude-4.5-haiku">Claude 4.5 Haiku</option>
              <option value="claude-3.5-haiku">Claude 3.5 Haiku</option>
            </optgroup>
            <optgroup label="Google">
              <option value="gemini-3.0-flash">Gemini 3.0 Flash</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-flash-lite">
                Gemini 2.5 Flash Lite
              </option>
              {/* <option value="gemini-3.0-pro">Gemini 3.0 Pro</option> */}
            </optgroup>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-200"></div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <Mic className="w-4 h-4 text-gray-400" />
          <select
            name="voice_config"
            value={formData.s2s_model ? formData.s2s_model : formData.voice_id}
            onChange={(e) => {
              const val = e.target.value;
              if (val.includes("realtime")) {
                // It's an S2S model
                handleInputChange({
                  target: { name: "s2s_model", value: val },
                });
                // We typically use a default voice or leave voice_id as is for S2S
              } else {
                // It's a standard voice
                handleInputChange({ target: { name: "s2s_model", value: "" } });
                handleInputChange({ target: { name: "voice_id", value: val } });
              }
            }}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4"
          >
            <optgroup label="Realtime Models (S2S)">
              <option value="gpt-4o-realtime">GPT-4o Realtime</option>
              <option value="gpt-4o-mini-realtime">GPT-4o Mini Realtime</option>
            </optgroup>
            <optgroup label="Standard Voices (ElevenLabs)">
              <option value="11labs-Adrian">Adrian</option>
              <option value="11labs-Rachel">Rachel</option>
              <option value="11labs-Sarah">Sarah</option>
              <option value="11labs-Antoni">Antoni</option>
              <option value="11labs-Thomas">Thomas</option>
              <option value="11labs-Domi">Domi</option>
              <option value="11labs-Josh">Josh</option>
              <option value="11labs-Arnold">Arnold</option>
              <option value="11labs-Bella">Bella</option>
              <option value="11labs-Elli">Elli</option>
              <option value="11labs-Sam">Sam</option>
            </optgroup>
            <optgroup label="Standard Voices (OpenAI)">
              <option value="openai-Alloy">Alloy</option>
              <option value="openai-Echo">Echo</option>
              <option value="openai-Shimmer">Shimmer</option>
            </optgroup>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-200"></div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
          <Globe className="w-4 h-4 text-gray-400" />
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4"
          >
            <optgroup label="English">
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-IN">English (India)</option>
              <option value="en-AU">English (Australia)</option>
              <option value="en-NZ">English (New Zealand)</option>
            </optgroup>
            <optgroup label="Spanish">
              <option value="es-ES">Spanish (Spain)</option>
              <option value="es-419">Spanish (Latin America)</option>
              <option value="ca-ES">Spanish (Catalan)</option>
              <option value="gl-ES">Spanish (Galician)</option>
            </optgroup>
            <optgroup label="French">
              <option value="fr-FR">French (France)</option>
              <option value="fr-CA">French (Canada)</option>
            </optgroup>
            <optgroup label="Portuguese">
              <option value="pt-PT">Portuguese (Portugal)</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
            </optgroup>
            <optgroup label="German & Central Europe">
              <option value="de-DE">German (Germany)</option>
              <option value="pl-PL">Polish (Poland)</option>
              <option value="hu-HU">Hungarian (Hungary)</option>
              <option value="cs-CZ">Czech (Czechia)</option>
              <option value="sk-SK">Slovak (Slovakia)</option>
            </optgroup>
            <optgroup label="Italian & Mediterranean">
              <option value="it-IT">Italian (Italy)</option>
              <option value="el-GR">Greek (Greece)</option>
              <option value="tr-TR">Turkish (Turkey)</option>
            </optgroup>
            <optgroup label="Northern Europe">
              <option value="nl-NL">Dutch (Netherlands)</option>
              <option value="nl-BE">Dutch (Belgium)</option>
              <option value="da-DK">Danish (Denmark)</option>
              <option value="sv-SE">Swedish (Sweden)</option>
              <option value="no-NO">Norwegian (Norway)</option>
              <option value="fi-FI">Finnish (Finland)</option>
              <option value="is-IS">Icelandic (Iceland)</option>
            </optgroup>
            <optgroup label="Eastern Europe & Eurasia">
              <option value="ru-RU">Russian (Russia)</option>
              <option value="uk-UA">Ukrainian (Ukraine)</option>
              <option value="ro-RO">Romanian (Romania)</option>
              <option value="bg-BG">Bulgarian (Bulgaria)</option>
              <option value="hr-HR">Croatian (Croatia)</option>
              <option value="sr-RS">Serbian (Serbia)</option>
              <option value="bs-BA">Bosnian (Bosnia)</option>
              <option value="sl-SI">Slovenian (Slovenia)</option>
              <option value="mk-MK">Macedonian (North Macedonia)</option>
              <option value="lv-LV">Latvian (Latvia)</option>
              <option value="lt-LT">Lithuanian (Lithuania)</option>
              <option value="az-AZ">Azerbaijani (Azerbaijan)</option>
              <option value="hy-AM">Armenian (Armenia)</option>
              <option value="kk-KZ">Kazakh (Kazakhstan)</option>
            </optgroup>
            <optgroup label="Asia Pacific">
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="zh-HK">Chinese (Cantonese)</option>
              <option value="ja-JP">Japanese (Japan)</option>
              <option value="ko-KR">Korean (South Korea)</option>
              <option value="vi-VN">Vietnamese (Vietnam)</option>
              <option value="th-TH">Thai (Thailand)</option>
              <option value="id-ID">Indonesian (Indonesia)</option>
              <option value="ms-MY">Malay (Malaysia)</option>
              <option value="fil-PH">Filipino (Philippines)</option>
            </optgroup>
            <optgroup label="South Asia">
              <option value="hi-IN">Hindi (India)</option>
              <option value="mr-IN">Marathi (India)</option>
              <option value="kn-IN">Kannada (India)</option>
              <option value="ta-IN">Tamil (India)</option>
              <option value="te-IN">Telugu (India)</option>
              <option value="ur-IN">Urdu (India)</option>
              <option value="gu-IN">Gujarati (India)</option>
              <option value="ml-IN">Malayalam (India)</option>
              <option value="ne-NP">Nepali (Nepal)</option>
            </optgroup>
            <optgroup label="Middle East & Africa">
              <option value="ar-SA">Arabic (Saudi Arabia)</option>
              <option value="fa-IR">Persian (Iran)</option>
              <option value="he-IL">Hebrew (Israel)</option>
              <option value="af-ZA">Afrikaans (South Africa)</option>
              <option value="sw-KE">Swahili (Kenya)</option>
            </optgroup>
            <optgroup label="Special">
              <option value="multi">Multilingual (Codeswitching)</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Prompt Textarea */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
        <div className="flex-1 p-8 h-full">
          <textarea
            name="general_prompt"
            value={formData.general_prompt}
            onChange={handleInputChange}
            placeholder="## Role\nYou are a professional receptionist for Johnson & Associates Law Firm..."
            className="w-full min-h-[480px] text-lg text-gray-800 placeholder-gray-300 resize-none outline-none leading-relaxed font-normal"
          />
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Use <code className="bg-gray-200 px-1 rounded">{"{{...}}"}</code> to
            add variables.{" "}
            <span className="text-blue-500 cursor-pointer">Learn more</span>
          </div>
        </div>
      </div>

      {/* Welcome Message Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Welcome Message</h2>
          <p className="text-xs text-gray-500">
            Pick what happens when the call starts.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              handleInputChange({
                target: { name: "start_speaker", value: "agent", type: "text" },
              })
            }
            className={`p-6 rounded-[28px] border-2 transition-all text-left relative outline-none ${
              formData.start_speaker === "agent"
                ? "border-blue-500 bg-blue-50/30 shadow-sm"
                : "border-gray-100 bg-white hover:border-blue-100 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4
                className={`font-bold text-[15px] ${
                  formData.start_speaker === "agent"
                    ? "text-blue-600"
                    : "text-gray-900"
                }`}
              >
                AI speaks first
              </h4>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.start_speaker === "agent"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-100"
                }`}
              >
                {formData.start_speaker === "agent" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <textarea
              name="begin_message"
              value={formData.begin_message}
              onChange={handleInputChange}
              disabled={formData.start_speaker !== "agent"}
              className={`w-full bg-white/50 border border-gray-100 rounded-2xl p-4 text-[13px] font-medium outline-none h-24 resize-none transition-all focus:bg-white focus:border-blue-100 placeholder:text-gray-300 ${
                formData.start_speaker !== "agent" ? "opacity-50" : ""
              }`}
              placeholder="e.g. Hello, how can I help you today?"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              handleInputChange({
                target: { name: "start_speaker", value: "user", type: "text" },
              })
            }
            className={`p-6 rounded-[28px] border-2 transition-all text-left relative outline-none ${
              formData.start_speaker === "user"
                ? "border-blue-500 bg-blue-50/30 shadow-sm"
                : "border-gray-100 bg-white hover:border-blue-100 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h4
                className={`font-bold text-[15px] ${
                  formData.start_speaker === "user"
                    ? "text-blue-600"
                    : "text-gray-900"
                }`}
              >
                User speaks first
              </h4>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.start_speaker === "user"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-100"
                }`}
              >
                {formData.start_speaker === "user" && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed mt-2">
              Agent will wait for user to speak before responding.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptSection;
