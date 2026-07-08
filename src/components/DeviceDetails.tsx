import React, { useState } from 'react';
import { Device } from '../types';
import { acsClient } from '../api/client';
import { RotateCw, RefreshCw } from 'lucide-react';
import { Dialog } from './Dialog';

interface DeviceDetailsProps {
  device: Device;
  onRefresh: (deviceId: string) => Promise<void>;
}

export const DeviceDetails: React.FC<DeviceDetailsProps> = ({
  device,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'parameters'>('info');
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleReboot = async () => {
    setLoading(true);
    setError(null);
    try {
      await acsClient.triggerReboot(device._id);
      setDialog({
        isOpen: true,
        title: 'Reboot Sent',
        message: 'Reboot command sent. Device will restart on next connection.',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to trigger reboot'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFactoryReset = async () => {
    setDialog({
      isOpen: true,
      title: 'Confirm Factory Reset',
      message: 'This will reset the device to factory defaults. Are you sure?',
      isDangerous: true,
      onConfirm: async () => {
        setLoading(true);
        setError(null);
        try {
          await acsClient.triggerFactoryReset(device._id);
          setDialog({
            isOpen: true,
            title: 'Reset Sent',
            message:
              'Factory reset command sent. Device will reset on next connection.',
          });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to trigger factory reset'
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh(device._id);
    } finally {
      setLoading(false);
    }
  };

  if (!device) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>Select a device to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        onConfirm={dialog.onConfirm}
        confirmText={dialog.onConfirm ? 'Confirm' : undefined}
        isDangerous={dialog.isDangerous}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <button
          onClick={handleReboot}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 rounded text-sm text-blue-700"
        >
          <RotateCw className="w-4 h-4" />
          Reboot
        </button>
        <button
          onClick={handleFactoryReset}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 disabled:opacity-50 rounded text-sm text-red-700"
        >
          Reset
        </button>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'info'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-600'
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab('parameters')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'parameters'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-600'
            }`}
          >
            Parameters
          </button>
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-3 text-sm">
          <InfoRow label="Device ID" value={device._id} />
          <InfoRow
            label="Serial Number"
            value={
              device.parameters?.['Device.SerialNumber'] ||
              device._serialNumber ||
              'Unknown'
            }
          />
          <InfoRow
            label="Last Inform"
            value={new Date(device._lastInform || 0).toLocaleString()}
          />
          <InfoRow
            label="Registered"
            value={new Date(device._registered || 0).toLocaleString()}
          />
          <InfoRow
            label="Last Bootstrap"
            value={new Date(device._lastBootstrap || 0).toLocaleString()}
          />
          <InfoRow
            label="Parameter Count"
            value={(device.parameters && Object.keys(device.parameters).length) || '0'}
          />
        </div>
      )}

      {activeTab === 'parameters' && (
        <ParametersView device={device} />
      )}
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between py-2 border-b border-slate-100">
    <span className="text-slate-600 font-medium">{label}</span>
    <span className="text-slate-900 font-mono text-xs break-all">
      {value}
    </span>
  </div>
);

const ParametersView: React.FC<{ device: Device }> = ({ device }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParams = Object.entries(device.parameters || {}).filter(
    ([key]) =>
      key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search parameters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
      />

      <div className="max-h-96 overflow-y-auto space-y-2 text-xs">
        {filteredParams.length === 0 ? (
          <p className="text-slate-500 py-4 text-center">No parameters found</p>
        ) : (
          filteredParams.map(([key, value]) => (
            <div
              key={key}
              className="p-2 bg-slate-50 rounded border border-slate-200"
            >
              <div className="font-mono text-slate-700 break-all">{key}</div>
              <div className="font-mono text-slate-500 mt-1">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
