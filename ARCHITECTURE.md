# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client Layer)                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Home Security Dashboard (React App)             │   │
│  │                                                               │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐     │   │
│  │  │ DeviceList │  │ DeviceDetails│  │ MonitoringChart  │     │   │
│  │  └────────────┘  └──────────────┘  └──────────────────┘     │   │
│  │         │                 │                    │             │   │
│  │         └─────────────────┼────────────────────┘             │   │
│  │                           ▼                                   │   │
│  │         ┌──────────────────────────────────┐                 │   │
│  │         │      Zustand Store (appStore)    │                 │   │
│  │         │  • Device state                  │                 │   │
│  │         │  • Configuration                 │                 │   │
│  │         └──────────────────────────────────┘                 │   │
│  │                           │                                   │   │
│  │         ┌─────────────────▼──────────────┐                   │   │
│  │         │   API Client (GenieACS)        │                   │   │
│  │         │  • Axios HTTP requests         │                   │   │
│  │         │  • Device endpoints            │                   │   │
│  │         │  • Task management             │                   │   │
│  │         └──────────┬──────────────────────┘                   │   │
│  └──────────────────────┼──────────────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────────────────┘
                          │ HTTP REST (Proxy or Direct)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Network (Proxy/CORS Layer)                      │
│                    Vite Dev Server (Port 5173)                      │
│                  (/nbi → http://localhost:7557)                     │
└─────────────────────────┬────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GenieACS Backend (Port 7557)                      │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  GenieACS NBI (REST API)                      │   │
│  │  • GET /devices - List all devices                           │   │
│  │  • GET /devices/:id - Device details                         │   │
│  │  • POST /devices/:id/tasks - Send commands                   │   │
│  │  • PUT /devices/:id - Update parameters                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                      ▲                                │
│                                      │ (Stores/Queries data)         │
│  ┌──────────────────────────────────┼───────────────────────────┐   │
│  │                                   │                            │   │
│  │    ┌──────────────┐    ┌─────────┴──────┐    ┌─────────────┐ │   │
│  │    │   MongoDB    │    │    Redis       │    │ GenieACS    │ │   │
│  │    │              │    │   (Task Queue) │    │   CWMP      │ │   │
│  │    │ • Device     │    │                │    │             │ │   │
│  │    │   data       │    │ • Tasks        │    │ • Receives  │ │   │
│  │    │ • Device     │    │ • Events       │    │   CWMP      │ │   │
│  │    │   history    │    │                │    │   messages  │ │   │
│  │    │ • Tasks      │    │                │    │ • Port 7547 │ │   │
│  │    └──────────────┘    └────────────────┘    └─────────────┘ │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┬──────────────────────┘
                                                  │ TR-069/CWMP Protocol
                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Physical/Virtual Devices                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              CPE (Customer Premises Equipment)               │   │
│  │  • Router / Home Security Panel                             │   │
│  │  • Periodically check-in via HTTP to GenieACS CWMP         │   │
│  │  • Receive RPC commands (Reboot, FactoryReset, etc.)        │   │
│  │  • Report parameters (Device.X_PROVIDER.Security.*)         │   │
│  │                                                               │   │
│  │  For testing: genieacs/sim - Simulated device                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (React)

#### Dashboard Component
- Main layout and orchestration
- Coordinates device list, details, and charts
- Handles polling and refresh logic
- Shows error states and loading indicators

#### DeviceList Component
- Displays all registered devices
- Shows online/offline status
- Last check-in times
- Device selection

#### DeviceDetails Component
- Shows device information (ID, serial number, timestamps)
- Tabs for Info and Parameters
- Action buttons (Reboot, Reset, Refresh)
- Parameter search/filter

#### MonitoringChart Component
- Recharts-based timeline
- Tracks online/offline devices over time
- Real-time updates
- Keeps last 60 data points

#### Settings Component
- Modal for configuration
- NBI URL input
- Polling interval control
- Persists to localStorage

### State Management (Zustand)

```typescript
interface AppStore {
  // Config
  config: ACSConfig
  setConfig: (config: ACSConfig) => void

  // Devices
  devices: Device[]
  selectedDeviceId: string | null
  loading: boolean
  error: string | null

  // Actions
  fetchDevices: () => Promise<void>
  selectDevice: (deviceId: string | null) => void
  refreshDevice: (deviceId: string) => Promise<void>
  setError: (error: string | null) => void
}
```

- Lightweight, no Redux boilerplate
- Persists config to localStorage
- Async thunks for API calls
- Subscribes to DeviceList and DeviceDetails components

### API Client (GenieACS NBI)

```typescript
class GenieACSClient {
  listDevices(query?: any): Promise<Device[]>
  getDevice(deviceId: string): Promise<Device | null>
  getDeviceParameters(deviceId: string): Promise<Record<string, any>>
  setDeviceParameter(deviceId: string, paramName: string, paramValue: any): Promise<any>
  triggerReboot(deviceId: string): Promise<TaskStatus>
  triggerFactoryReset(deviceId: string): Promise<TaskStatus>
  getDeviceStatus(deviceId: string): Promise<DeviceStatus>
}
```

- Wraps Axios HTTP client
- Handles GenieACS-specific request formats
- Error handling and logging
- Request/response transformation

### Backend (GenieACS)

#### GenieACS CWMP (Port 7547)
- Receives HTTP POST from CPEs (devices)
- Devices periodically "check-in" to report status
- Queues RPC commands for next device check-in
- With `?connection_request` flag, immediately triggers device to call back

#### GenieACS NBI (Port 7557)
- REST API for management applications
- Query devices, view parameters
- Queue tasks (reboot, factory reset)
- Get device status and history

#### MongoDB
- Stores all device data
- Parameter history
- Task queue and history
- Device connectivity logs

#### Redis
- Task queue
- Session management
- Caching for performance

## Data Flow

### 1. Device Registration
```
Device (CPE) ──HTTP POST──> GenieACS CWMP
                               │
                               ▼
                          Register Device
                               │
                               ▼
                          MongoDB: Insert
                               │
                               ▼
                      Device appears in NBI
                               │
                               ▼
             React App: GET /devices (polling)
                               │
                               ▼
                          Display in DeviceList
```

### 2. Sending a Command (Reboot)
```
React App ──POST /devices/{id}/tasks?connection_request──> GenieACS NBI
                                                              │
                                                              ▼
                                                    Queue task in Redis
                                                              │
                                                              ▼
                        (Next CPE check-in happens)          │
                                ▲                            │
                                └────────────────────────────┘
                                      │
                                      ▼
Device ─────────────────────────ReceiveCommand
                                (Reboot RPC)
                                      │
                                      ▼
                             Reboot now
```

### 3. Device Status Monitoring
```
React App
  │
  ├─> Every 5 seconds: fetchDevices()
  │
  └──> GET /devices ──> GenieACS NBI
       (returns array of Device objects)
            │
            ▼
       Store in Zustand
            │
            ├──> DeviceList: Re-render with new status
            │
            └──> MonitoringChart: Track online/offline
```

## Type System

### Core Types

```typescript
interface Device {
  _id: string                      // Unique device ID
  _lastInform: number              // Timestamp of last check-in
  _registered: number              // Registration timestamp
  _lastBootstrap: number           // Last bootstrap timestamp
  parameterNames: string[]         // List of available parameters
  parameters?: Record<string, any> // Full parameter values
  _connectionRequestURL?: string   // Device callback URL
  _serialNumber?: string           // Device serial number
}

interface TaskStatus {
  taskId: string
  status: 'pending' | 'completed' | 'failed'
  result?: any
  error?: string
}

interface ACSConfig {
  nbiUrl: string          // GenieACS NBI endpoint
  acsUrl?: string         // Optional: GenieACS UI URL
  pollingInterval: number // Milliseconds between refreshes
}
```

## Polling vs WebSocket

### Current Implementation: Polling
✅ Simple, no server changes needed
✅ Works with existing GenieACS
✅ Stateless, easy to scale

❌ Higher latency (up to polling interval)
❌ More network traffic

### Future: WebSocket
Requires server-side WebSocket support:
```typescript
// Pseudo-code
const ws = new WebSocket('ws://localhost:7557/devices/watch')
ws.on('message', (event) => {
  updateDevice(event.device)
})
```

## Error Handling Strategy

### Network Errors
- Display "Connection Error" banner
- Show NBI URL in error message
- Retry every polling interval

### Invalid Data
- Log to console
- Show generic "Error loading data"
- Don't crash the app

### Device Offline
- After 5 minutes without check-in, mark offline
- Don't remove from list (device may come back online)
- Show "Offline" badge

### Command Failures
- Show error modal with message
- Suggest common fixes (check device online, etc.)
- Allow user to retry

## Scalability Considerations

### Device Count
- 100 devices: No issues
- 1000 devices: Consider pagination or filtering
- 10000+ devices: Implement server-side filtering, virtual scroll

### Polling Load
- 5 second interval * 100 devices = 20 req/sec
- 5 second interval * 10000 devices = 2000 req/sec

### Optimization Options
1. **Server-side filtering**: Only fetch changed devices
2. **WebSocket**: Push updates instead of polling
3. **Pagination**: Load devices in chunks
4. **Caching**: Cache device data locally, check for changes

## Security Considerations

### Current State (Development)
- No authentication
- No HTTPS
- Direct API access
- No rate limiting

### Production Checklist
- [ ] Add OAuth2 / JWT authentication
- [ ] Enable HTTPS/TLS
- [ ] Add API rate limiting (Nginx or API Gateway)
- [ ] Add request validation
- [ ] Add CORS headers
- [ ] Implement audit logging
- [ ] Add input sanitization
- [ ] Use environment variables for secrets
- [ ] Implement WebSocket authentication
- [ ] Add monitoring and alerting

## Testing Strategy

### Unit Tests
- API client methods
- Store actions
- Component rendering

### Integration Tests
- Device list polling
- Parameter updates
- Command execution

### E2E Tests
- Full user flow (select device → send reboot)
- Error scenarios (offline device, network error)
- Edge cases (empty list, very large parameter lists)

### Manual Testing
- Multiple devices
- Network latency simulation (Docker Pumba)
- Container failure scenarios
- Parameter search performance

## Future Enhancements

1. **WebSocket Real-time Updates**
   - Replace polling with push model
   - Lower latency, reduced server load

2. **Device Groups**
   - Tag devices by location, type
   - Bulk operations on groups

3. **Parameter Templates**
   - Common security settings presets
   - One-click apply to multiple devices

4. **Event System**
   - Alert on sensor changes
   - Webhook notifications
   - Email/SMS integration

5. **Historical Analytics**
   - Device uptime reports
   - Parameter change tracking
   - Performance graphs

6. **Multi-ACS Support**
   - Manage devices across multiple GenieACS instances
   - Unified dashboard view

7. **Mobile App**
   - React Native or PWA version
   - Push notifications
   - Offline support
