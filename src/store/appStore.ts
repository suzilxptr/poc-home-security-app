import { create } from 'zustand';
import { Device, ACSConfig } from '../types';
import { acsClient } from '../api/client';

interface AppStore {
  // Config
  config: ACSConfig;
  setConfig: (config: ACSConfig) => void;

  // Devices
  devices: Device[];
  selectedDeviceId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDevices: () => Promise<void>;
  selectDevice: (deviceId: string | null) => void;
  refreshDevice: (deviceId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

const defaultConfig: ACSConfig = {
  nbiUrl: 'http://localhost:7557',
  pollingInterval: 5000,
};

export const useAppStore = create<AppStore>((set, get) => ({
  config: {
    nbiUrl: localStorage.getItem('nbiUrl') || defaultConfig.nbiUrl,
    pollingInterval:
      parseInt(localStorage.getItem('pollingInterval') || '5000') || 5000,
  },

  devices: [],
  selectedDeviceId: null,
  loading: false,
  error: null,

  setConfig: (config) => {
    set({ config });
    localStorage.setItem('nbiUrl', config.nbiUrl);
    localStorage.setItem('pollingInterval', config.pollingInterval.toString());
    acsClient.setBaseURL(config.nbiUrl);
  },

  fetchDevices: async () => {
    set({ loading: true, error: null });
    try {
      const devices = await acsClient.listDevices();
      set({ devices, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  selectDevice: (deviceId) => {
    set({ selectedDeviceId: deviceId });
  },

  refreshDevice: async (deviceId) => {
    try {
      const device = await acsClient.getDevice(deviceId);
      if (device) {
        set((state) => ({
          devices: state.devices.map((d) => (d._id === deviceId ? device : d)),
        }));
      }
    } catch (error) {
      console.error('Failed to refresh device:', error);
    }
  },

  setError: (error) => {
    set({ error });
  },
}));
