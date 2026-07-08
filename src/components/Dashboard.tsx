import React, { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { DeviceList } from './DeviceList';
import { DeviceDetails } from './DeviceDetails';
import { Settings } from './Settings';
import { MonitoringChart } from './MonitoringChart';
import { Loader, AlertCircle, RotateCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    config,
    setConfig,
    devices,
    selectedDeviceId,
    loading,
    error,
    fetchDevices,
    selectDevice,
    refreshDevice,
  } = useAppStore();

  const selectedDevice = devices.find((d) => d._id === selectedDeviceId);

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Home Security Dashboard
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                TR-069 / CPE Management System
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDevices}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
              >
                <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Settings config={config} onConfigChange={setConfig} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Device List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Devices
                </h2>
                {loading && (
                  <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Connection Error</p>
                    <p className="text-xs mt-1">{error}</p>
                    <p className="text-xs mt-2">
                      Check that GenieACS is running at:{' '}
                      <code className="font-mono">{config.nbiUrl}</code>
                    </p>
                  </div>
                </div>
              )}

              <DeviceList
                devices={devices}
                selectedId={selectedDeviceId || ''}
                onSelect={selectDevice}
              />
            </div>
          </div>

          {/* Right Column: Device Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {selectedDevice ? 'Device Details' : 'Select a Device'}
              </h2>

              {selectedDevice ? (
                <DeviceDetails
                  device={selectedDevice}
                  onRefresh={refreshDevice}
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>Select a device from the list to view its details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monitoring Chart */}
        <div className="mt-8">
          <MonitoringChart devices={devices} />
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard
            title="Quick Start"
            items={[
              'Select a device to view details',
              'Use Refresh to sync latest parameters',
              'Send Reboot or Reset commands',
              'Monitor device status in real-time',
            ]}
          />
          <InfoCard
            title="Configuration"
            items={[
              `NBI URL: ${config.nbiUrl}`,
              `Polling: ${config.pollingInterval}ms`,
              `Devices: ${devices.length}`,
              `Online: ${devices.filter((d) => (Date.now() - (d._lastInform || 0)) < 5 * 60 * 1000).length}`,
            ]}
          />
        </div>
      </main>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  items: string[];
}

const InfoCard: React.FC<InfoCardProps> = ({ title, items }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
          <span className="text-blue-600 font-bold mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
