# TR-069 Home Security App - Setup Guide

This is a browser-based dashboard for managing TR-069/CPE devices via GenieACS.

## Complete Setup (4 Terminals)

### Terminal 1: Start MongoDB & Redis

```bash
cd /Users/sbastola/Private/poc-home-security-app
docker-compose up mongodb redis -d
```

Verify they started:
```bash
docker-compose ps
```

You should see:
- ✅ genieacs-mongo (healthy)
- ✅ genieacs-redis (healthy)

### Terminal 2: Start GenieACS (from source)

```bash
/Users/sbastola/Private/start-genieacs.sh
```

This will:
1. Build GenieACS from `/Users/sbastola/Private/genieacs`
2. Start CWMP server (port 7547)
3. Start NBI API (port 7557)

Wait for output:
```
Starting CWMP (port 7547) and NBI (port 7557)...
```

### Terminal 3: Start CPE Simulator

```bash
cd /Users/sbastola/Private/poc-home-security-app
node cpe-simulator.js
```

Watch for check-ins. Every 30 seconds you should see:
```
✅ Check-in successful (10:25:31 PM)
```

### Terminal 4: Start the Browser App

```bash
cd /Users/sbastola/Private/poc-home-security-app
npm install  # if first time
npm run dev
```

Open http://localhost:5173

### Verify It's Working

1. Browser shows "Home Security Dashboard"
2. After 30-60 seconds, device appears in the list
3. Device status shows **Online** (green indicator)
4. Click device to view parameters

### Stopping Everything

```bash
# In Terminal 2 & 3: Press Ctrl+C

# In Terminal 1: Stop containers
docker-compose stop

# To clean up completely
docker-compose down -v
```

---

## Understanding the Architecture

```
┌─────────────┐
│  Browser    │
│    App      │
│ (React)     │
└──────┬──────┘
       │ REST API
       ▼
┌─────────────┐         ┌──────────┐
│ GenieACS    │◄────────┤ MongoDB  │
│   NBI       │         │          │
│ :7557       │         └──────────┘
└──────┬──────┘
       │ TR-069 CWMP
       ▼
┌─────────────┐
│ GenieACS    │
│   CWMP      │
│  :7547      │
└──────┬──────┘
       │ CWMP Protocol
       ▼
┌─────────────┐
│    CPE      │
│ (Router)    │
│ Simulated   │
└─────────────┘
```

## API Endpoints Used by the App

### List Devices
```
GET /devices
GET /devices?query={"_id":"device-id"}
```

### Get Device Details
```
GET /devices/{deviceId}
```

### Reboot Device
```
POST /devices/{deviceId}/tasks?connection_request
Body: { "name": "reboot" }
```

### Factory Reset
```
POST /devices/{deviceId}/tasks?connection_request
Body: { "name": "factoryReset" }
```

### Set Parameter
```
PUT /devices/{deviceId}
Body: { "parameterValues": [["Device.Param", value]] }
```

---

## Testing Scenarios

### Scenario 1: See Devices Come Online
1. Open the app, device should appear in list
2. Status shows "Online" with green indicator
3. Last seen time updates every few seconds

### Scenario 2: Simulate Device Offline
```bash
# Stop the CPE container
docker stop cpe-simulator

# After 5 minutes, device shows "Offline" in red
```

### Scenario 3: Reboot Device
1. Select a device
2. Click "Reboot"
3. Device receives reboot command
4. In real setup, device reboots on next connection

### Scenario 4: Monitor Parameters
1. Select a device
2. Click "Parameters" tab
3. Search for specific TR-181 parameters
4. Parameters update in real-time

---

## Custom Parameters (TR-181 Security)

To add custom security parameters to your virtual CPE, you would edit the CPE XML config:

```xml
<!-- Example custom parameter -->
<parameter>
  <name>Device.X_PROVIDER.Security.Zone.1.Status</name>
  <access>R</access>
  <value>Closed</value>
</parameter>
```

This app's DeviceDetails component is designed to display these parameters.

---

## Common Issues

### "Cannot connect to NBI"
- Check that `docker-compose ps` shows all containers running
- Verify GenieACS NBI is on port 7557: `curl http://localhost:7557/devices`
- Check settings in the app to confirm NBI URL is correct

### No devices appearing
- Check GenieACS UI at http://localhost:3000 to see if device registered
- Device needs to check-in first; simulator may take 30-60 seconds
- Refresh the browser app and wait

### Device stuck "Offline"
- Check Docker logs: `docker-compose logs cpe-simulator`
- Verify network connectivity between containers: `docker-compose ps`
- Stop all and restart: `docker-compose down && docker-compose up -d`

---

## Building for Production

```bash
npm run build

# Output is in dist/
# Deploy dist/ to your web server
```

---

## Security Considerations

For a real home security app, you would add:
- Authentication (OAuth, JWT)
- HTTPS/TLS
- Rate limiting
- Input validation
- Audit logging
- WebSocket for real-time updates

The current setup is for **testing and development only**.

---

## Architecture Decisions

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | React + Vite | Fast dev server, modern tooling |
| State | Zustand | Lightweight, no boilerplate |
| API Client | Axios | Simple, great error handling |
| Styling | Tailwind CSS | Utility-first, no CSS in JS |
| Backend | GenieACS Docker | Industry standard, open source |

---

## Next Steps

1. **Add Real CPEs**: Replace simulator with actual routers
2. **Add Webhooks**: Configure GenieACS to push updates to app
3. **Add Authentication**: Secure the NBI and app with OAuth/JWT
4. **Add Monitoring**: Display sensor zones, battery levels, signal strength
5. **Add Alerts**: Real-time notifications for security events
6. **Add Mobile**: React Native or PWA version
