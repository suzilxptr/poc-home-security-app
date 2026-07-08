# Home Security Dashboard - TR-069 Browser App

A modern, browser-based dashboard for managing home security devices via TR-069/CPE (Customer Premises Equipment) using GenieACS.

## Features

✅ **Real-time Device Monitoring**
- Live device status (online/offline)
- Last check-in timestamps
- Device parameter inspection

✅ **Device Management**
- Remote reboot commands
- Factory reset capability
- Parameter viewing and editing

✅ **Visual Analytics**
- Device status timeline
- Online/offline tracking
- Performance monitoring

✅ **Developer-Friendly**
- REST API integration with GenieACS NBI
- Mock data support for testing
- Flexible configuration

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand (lightweight store)
- **Backend**: GenieACS (Node.js from source)
- **Charts**: Recharts
- **Icons**: Lucide React

## Quick Start

**Single command setup:**

```bash
./run-all.sh
```

This script automatically:
- Starts MongoDB and Redis (Docker)
- Builds and runs GenieACS (CWMP + NBI servers)
- Starts 5 virtual CPE simulators
- Starts the React development server

Then open http://localhost:5173

All 5 devices appear after 30-60 seconds with **Online** status (green).

**To stop everything:**
```bash
./cleanup.sh
```

**For detailed step-by-step setup**, see **[GETTING_STARTED.md](GETTING_STARTED.md)**

## Deployment

Deploy for free to **Vercel** (frontend) and **Fly.io** (backend):

📖 See **[FLY_DEPLOYMENT.md](FLY_DEPLOYMENT.md)** - Complete guide with Fly.io

**Free services:** Vercel + Fly.io + MongoDB Atlas  
**Total cost: $0/month** ✅  
**Uptime: 24/7** ✅

Share your backend URL with users to test!

## Project Structure

```
src/
├── api/
│   └── client.ts          # GenieACS NBI API client
├── components/
│   ├── Dashboard.tsx      # Main dashboard layout
│   ├── DeviceList.tsx     # Device list UI
│   ├── DeviceDetails.tsx  # Device detail panel
│   ├── MonitoringChart.tsx# Status timeline chart
│   └── Settings.tsx       # Configuration modal
├── store/
│   └── appStore.ts        # Zustand state management
├── types.ts               # TypeScript interfaces
├── App.tsx                # Root component
└── main.tsx               # Entry point
```

## Key Capabilities

### Device Monitoring
- Lists all registered devices
- Shows online/offline status
- Displays last check-in time
- Real-time updates every 5 seconds

### Device Control
- **Reboot**: Send remote reboot command
- **Factory Reset**: Reset device to defaults
- **Parameter View**: Inspect all TR-181 parameters
- **Parameter Edit**: Modify device configuration

### Status Timeline
- Charts online/offline devices over time
- Helps identify connectivity patterns
- Useful for debugging intermittent issues

## API Integration

This app communicates with GenieACS NBI at `/devices` endpoint:

```typescript
// List devices
GET /devices

// Get specific device
GET /devices/{deviceId}

// Send command (with connection_request flag)
POST /devices/{deviceId}/tasks?connection_request
Body: { "name": "reboot" | "factoryReset" }

// Update parameters
PUT /devices/{deviceId}
Body: { "parameterValues": [["paramName", value]] }
```

## Configuration

Settings are persisted in browser localStorage:
- **NBI URL**: GenieACS REST API endpoint
- **Polling Interval**: How often to refresh device data (1-60 seconds)

## Debugging

### Check GenieACS Status
```bash
# View GenieACS logs
docker-compose logs genieacs-nbi

# Test API directly
curl http://localhost:7557/devices
```

### Check Device Registration
Visit http://localhost:3000 (GenieACS UI) to see:
- Device registration status
- Device parameters
- Connection history

### Check Container Health
```bash
docker-compose ps
```

## Testing Scenarios

### Scenario: Device Goes Offline
```bash
# Stop the CPE simulator
docker stop cpe-simulator

# After 5 minutes, device shows as offline in the app
```

### Scenario: Trigger Device Reboot
1. Select device in app
2. Click "Reboot"
3. Command is queued by GenieACS
4. On next device check-in, reboot executes

### Scenario: Monitor Multiple Devices
1. Scale up the CPE simulator:
   ```bash
   docker-compose up -d --scale cpe-simulator=5
   ```
2. Each instance will register as a separate device
3. Monitor all in the dashboard

## Development

### Build for Production
```bash
npm run build
# Output in dist/
```

### Lint & Type Check
```bash
npm run lint
npm run type-check
```

### Add New Features
The app is structured for easy extension:
- Add new API methods in `src/api/client.ts`
- Add UI components in `src/components/`
- Add store logic in `src/store/appStore.ts`

## Security Notes

⚠️ **This is a development/testing setup only.**

For production deployment add:
- Authentication (OAuth, JWT, API keys)
- HTTPS/TLS encryption
- Rate limiting & request throttling
- Input validation
- CORS configuration
- Audit logging
- WebSocket for real-time updates

## Roadmap

- [ ] WebSocket support for real-time updates
- [ ] User authentication
- [ ] Multi-device bulk operations
- [ ] Custom parameter templates
- [ ] Event/alert system
- [ ] Performance metrics
- [ ] Mobile responsive improvements
- [ ] Export device data

## Troubleshooting

**Q: No devices appear in the app**
- A: Wait 30-60 seconds for CPE to initialize and check-in
- Check GenieACS UI at http://localhost:3000 to confirm registration

**Q: Connection refused error**
- A: Verify all Docker containers are running: `docker-compose ps`
- Ensure ports 7557, 7547, 3000 are not in use

**Q: Device shows offline immediately**
- A: This is normal behavior. The 5-minute timeout means devices need a recent check-in
- The simulator should check-in every 30 seconds

**Q: Can't modify NBI URL**
- A: If using `/nbi` proxy, ensure Vite proxy is configured in `vite.config.ts`

## References

- [GenieACS Documentation](https://genieacs.com/)
- [TR-069 Standard](https://www.broadband-forum.org/)
- [TR-181 Data Model](https://usp-data-models.broadband-forum.org/)

## License

MIT

## Contributing

Contributions welcome! Please open issues or PRs.
