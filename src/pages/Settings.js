import React, { useState, useEffect } from 'react';
import { Key, Globe, Save, Trash2, Copy, Check } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({ webhook_url: '' });
  const [apiKeys, setApiKeys] = useState([]);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // API Key creation
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both for simplicity, or lazy load based on tab
      const [settingsData, keysData] = await Promise.all([
        settingsService.getSettings().catch(() => ({ webhook_url: '' })), // Graceful fail if 404
        settingsService.getApiKeys().catch(() => [])
      ]);
      setSettings(settingsData);
      setApiKeys(Array.isArray(keysData) ? keysData : keysData.api_keys || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await settingsService.updateSettings(settings);
      setMsg({ text: 'Settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Save error:', err);
      setMsg({ text: 'Failed to save settings.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const newKey = await settingsService.createApiKey(newKeyName);
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setMsg({ text: 'API Key created!', type: 'success' });
    } catch (err) {
      console.error('Create key error:', err);
      setMsg({ text: 'Failed to create API key.', type: 'error' });
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm('Delete this API Key? This cannot be undone.')) return;
    try {
      await settingsService.deleteApiKey(id);
      setApiKeys(apiKeys.filter(k => k.id !== id && k._id !== id));
    } catch (err) {
      console.error('Delete key error:', err);
      setMsg({ text: 'Failed to delete API key.', type: 'error' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple visual feedback
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
         <p className="text-gray-500 mt-1">Manage your account configuration and developer settings.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`${activeTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            General & Webhooks
          </button>
          <button
            onClick={() => setActiveTab('apikeys')}
            className={`${activeTab === 'apikeys' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            API Keys
          </button>
        </nav>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-md ${msg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-gray-400" />
            Webhook Configuration
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
             <Input
               label="Webhook URL"
               name="webhook_url"
               value={settings.webhook_url}
               onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
               placeholder="https://your-server.com/webhook"
               hint="We will send events (call started, ended, etc.) to this URL."
             />
             <div className="pt-2">
               <Button type="submit" isLoading={isLoading} className="w-auto px-6">
                 <Save className="w-4 h-4 mr-2" />
                 Save Changes
               </Button>
             </div>
          </form>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          {/* Create New Key */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-gray-400" />
              Create New API Key
            </h3>
            <form onSubmit={handleCreateKey} className="flex gap-4 items-end max-w-xl">
              <div className="flex-1">
                <Input
                  label="Key Name"
                  name="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Key"
                />
              </div>
              <Button type="submit" isLoading={creatingKey} disabled={!newKeyName.trim()}>
                Create Key
              </Button>
            </form>
          </div>

          {/* List Keys */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200">
               <h3 className="text-lg font-medium text-gray-900">Active API Keys</h3>
             </div>
             {apiKeys.length === 0 ? (
               <div className="p-6 text-center text-gray-500">
                 No API keys found. Create one to get started.
               </div>
             ) : (
               <ul className="divide-y divide-gray-200">
                 {apiKeys.map((key) => (
                   <li key={key.id || key._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                     <div className="flex-1 min-w-0 pr-4">
                       <p className="text-sm font-medium text-gray-900 truncate">{key.name}</p>
                       <div className="mt-1 flex items-center text-sm text-gray-500 font-mono bg-gray-100 p-1 rounded w-fit">
                         {key.key_prefix || 'sk_live_...'}******
                         <button 
                           onClick={() => copyToClipboard(key.full_key || '')} // Assuming full key is returned only on creation typically, but for this demo maybe it's available or just prefix
                           className="ml-2 text-gray-400 hover:text-gray-600"
                           title="Copy Key"
                         >
                           <Copy className="w-3.5 h-3.5" />
                         </button>
                       </div>
                       <p className="mt-1 text-xs text-gray-400">
                         Created: {new Date(key.createdAt || Date.now()).toLocaleDateString()}
                       </p>
                     </div>
                     <button
                       onClick={() => handleDeleteKey(key.id || key._id)}
                       className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
