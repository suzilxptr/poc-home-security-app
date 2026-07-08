import React from 'react';
import { Device } from '../types';
import { Wifi, WifiOff, Clock } from 'lucide-react';

interface DeviceListProps {
  devices: Device[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  selectedId,
  onSelect,
}) => {
  const parseTimestamp = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return new Date(value).getTime();
    return 0;
  };

  const isOnline = (device: Device): boolean => {
    const now = Date.now();
    const lastInform = parseTimestamp(device._lastInform);
    return now - lastInform < 5 * 60 * 1000; // 5 minutes threshold
  };

  const formatTime = (value: any): string => {
    const timestamp = parseTimestamp(value);
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-2">
      {devices.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No devices found</p>
          <p className="text-sm">Check your connection to GenieACS NBI</p>
        </div>
      ) : (
        devices.map((device) => {
          const online = isOnline(device);
          const serialNumber =
            device.parameters?.['Device.SerialNumber'] || device._serialNumber || 'Unknown';

          return (
            <button
              key={device._id}
              onClick={() => onSelect(device._id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                selectedId === device._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">
                    {serialNumber}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    ID: {device._id.slice(0, 12)}...
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {online ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last seen: {formatTime(device._lastInform)}
                  </span>
                </div>
                <div
                  className={`px-2 py-1 rounded ${
                    online
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {online ? 'Online' : 'Offline'}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};
