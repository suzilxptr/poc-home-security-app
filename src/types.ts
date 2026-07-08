export interface Device {
  _id: string;
  _lastInform: number;
  _registered: number;
  _lastBootstrap: number;
  parameterNames: string[];
  parameters?: Record<string, any>;
  _connectionRequestURL?: string;
  _serialNumber?: string;
}

export interface SecuritySensor {
  zoneId: string;
  name: string;
  status: 'open' | 'closed' | 'unknown';
  lastUpdated: number;
  batteryLevel?: number;
}

export interface SecurityPanel {
  panelId: string;
  armStatus: 'armed' | 'disarmed' | 'triggered';
  batteryLevel: number;
  signalStrength: number;
  zones: SecuritySensor[];
}

export interface TaskStatus {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface ACSConfig {
  nbiUrl: string;
  acsUrl?: string;
  pollingInterval: number;
}
