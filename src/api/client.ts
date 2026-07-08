import axios, { AxiosInstance } from 'axios';
import { Device, TaskStatus } from '../types';

export class GenieACSClient {
  private client: AxiosInstance;
  private nbiUrl: string;

  constructor(nbiUrl: string = import.meta.env.VITE_NBI_URL || '/nbi') {
    this.nbiUrl = nbiUrl;
    this.client = axios.create({
      baseURL: nbiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private normalizeDevice(rawDevice: any): Device {
    // Convert nested parameter structure to flat format
    const parameters: Record<string, any> = {};

    if (rawDevice.Device) {
      Object.entries(rawDevice.Device).forEach(([key, value]: [string, any]) => {
        if (value && typeof value === 'object' && '_value' in value) {
          parameters[`Device.${key}`] = value._value;
        } else if (!key.startsWith('_')) {
          parameters[`Device.${key}`] = value;
        }
      });
    }

    return {
      _id: rawDevice._id,
      _lastInform: rawDevice._lastInform,
      _registered: rawDevice._registered,
      _lastBootstrap: rawDevice._lastBootstrap,
      parameterNames: Object.keys(parameters),
      parameters,
      _serialNumber: rawDevice._deviceId?.['_SerialNumber'],
    };
  }

  async listDevices(query?: any): Promise<Device[]> {
    try {
      // API: GET /devices/?query=<query>
      const params: any = {};
      if (query) {
        params.query = JSON.stringify(query);
      }
      const response = await this.client.get('/devices', { params });
      const devices = Array.isArray(response.data) ? response.data : [];
      return devices.map(d => this.normalizeDevice(d));
    } catch (error) {
      console.error('Failed to list devices:', error);
      return [];
    }
  }

  async getDevice(deviceId: string): Promise<Device | null> {
    try {
      // API: GET /devices/?query={"_id":"<device_id>"}
      const response = await this.client.get('/devices', {
        params: { query: JSON.stringify({ _id: deviceId }) }
      });
      const devices = Array.isArray(response.data) ? response.data : [];
      return devices.length > 0 ? this.normalizeDevice(devices[0]) : null;
    } catch (error) {
      console.error(`Failed to get device ${deviceId}:`, error);
      return null;
    }
  }

  async getDeviceParameters(deviceId: string): Promise<Record<string, any>> {
    try {
      const device = await this.getDevice(deviceId);
      return device?.parameters || {};
    } catch (error) {
      console.error(`Failed to get device parameters:`, error);
      return {};
    }
  }

  async setDeviceParameter(
    deviceId: string,
    paramName: string,
    paramValue: any
  ): Promise<any> {
    try {
      // API: POST /devices/<device_id>/tasks?connection_request
      const response = await this.client.post(
        `/devices/${deviceId}/tasks`,
        { name: 'setParameterValues', parameterValues: [[paramName, paramValue]] },
        { params: { connection_request: true } }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to set parameter:`, error);
      throw error;
    }
  }

  private encodeDeviceId(deviceId: string): string {
    // Device IDs may contain % characters, so we need to encode them
    return encodeURIComponent(deviceId);
  }

  async triggerReboot(deviceId: string): Promise<TaskStatus> {
    try {
      // API: POST /devices/<device_id>/tasks?connection_request
      // Body: {"name": "reboot"}
      const response = await this.client.post(
        `/devices/${this.encodeDeviceId(deviceId)}/tasks`,
        { name: 'reboot' },
        { params: { connection_request: true } }
      );
      return {
        taskId: response.data._id || 'unknown',
        status: 'pending',
        result: response.data,
      };
    } catch (error) {
      console.error('Failed to trigger reboot:', error);
      throw error;
    }
  }

  async triggerFactoryReset(deviceId: string): Promise<TaskStatus> {
    try {
      // API: POST /devices/<device_id>/tasks?connection_request
      // Body: {"name": "factoryReset"}
      const response = await this.client.post(
        `/devices/${this.encodeDeviceId(deviceId)}/tasks`,
        { name: 'factoryReset' },
        { params: { connection_request: true } }
      );
      return {
        taskId: response.data._id || 'unknown',
        status: 'pending',
        result: response.data,
      };
    } catch (error) {
      console.error('Failed to trigger factory reset:', error);
      throw error;
    }
  }

  async getDeviceStatus(deviceId: string): Promise<{
    online: boolean;
    lastSeen: number;
    nextInform?: number;
  }> {
    try {
      const device = await this.getDevice(deviceId);
      if (!device) {
        return { online: false, lastSeen: 0 };
      }

      const now = Date.now();
      const lastInform = device._lastInform || 0;
      const timeSinceLastInform = now - lastInform;
      const timeoutThreshold = 5 * 60 * 1000; // 5 minutes

      return {
        online: timeSinceLastInform < timeoutThreshold,
        lastSeen: lastInform,
        nextInform: device._lastInform ? device._lastInform + 30000 : undefined,
      };
    } catch (error) {
      console.error('Failed to get device status:', error);
      return { online: false, lastSeen: 0 };
    }
  }

  setBaseURL(url: string): void {
    this.nbiUrl = url;
    this.client = axios.create({
      baseURL: url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export const acsClient = new GenieACSClient();
