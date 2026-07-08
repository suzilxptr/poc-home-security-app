import React, { useState } from 'react';
import { ACSConfig } from '../types';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  config: ACSConfig;
  onConfigChange: (config: ACSConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nbiUrl, setNbiUrl] = useState(config.nbiUrl);
  const [pollingInterval, setPollingInterval] = useState(
    config.pollingInterval
  );

  const handleSave = () => {
    onConfigChange({
      nbiUrl,
      pollingInterval,
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm text-slate-700"
      >
        <SettingsIcon className="w-4 h-4" />
        Settings
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              GenieACS NBI URL
            </label>
            <input
              type="text"
              value={nbiUrl}
              onChange={(e) => setNbiUrl(e.target.value)}
              placeholder="http://localhost:7557"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Example: http://localhost:7557 or /nbi (if using proxy)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Polling Interval (ms)
            </label>
            <input
              type="number"
              value={pollingInterval}
              onChange={(e) => setPollingInterval(parseInt(e.target.value))}
              min="1000"
              max="60000"
              step="1000"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              How often to refresh device data (1000-60000 ms)
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setNbiUrl(config.nbiUrl);
              setPollingInterval(config.pollingInterval);
              setIsOpen(false);
            }}
            className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
