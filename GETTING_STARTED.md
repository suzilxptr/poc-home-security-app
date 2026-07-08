# Getting Started Guide

Welcome to the Home Security Dashboard! This guide will walk you through setting up and running the app for the first time.

## ⚡ Single-Command Quickstart (Easiest)

Start everything at once:

```bash
cd /Users/sbastola/Private/poc-home-security-app
./run-all.sh
```

This script will:
1. Start MongoDB and Redis (Docker)
2. Build and run GenieACS (CWMP + NBI servers)
3. Start 5 virtual CPE simulators
4. Start the React app

Then go to http://localhost:5173

All 5 devices should appear after 30-60 seconds with **Online** status (green).

---

## Manual 4-Terminal Setup

You'll need **4 terminals** if you prefer to run components separately:

### Terminal 1: Start MongoDB & Redis
```bash
cd /Users/sbastola/Private/poc-home-security-app
docker-compose up mongodb redis -d
```

### Terminal 2: Start GenieACS
```bash
/Users/sbastola/Private/start-genieacs.sh
```

Wait for:
```
Starting CWMP (port 7547) and NBI (port 7557)...
```

### Terminal 3: Start CPE Simulator
```bash
cd /Users/sbastola/Private/poc-home-security-app
node cpe-simulator.js
```

Watch for check-ins:
```
✅ Check-in successful
```

### Terminal 4: Start React App
```bash
cd /Users/sbastola/Private/poc-home-security-app
npm run dev
```

### Step 5: Open Browser
Go to http://localhost:5173

### Step 6: Wait for Device
- Wait 30-60 seconds
- Device should appear in the list
- Status should show **Online** (green indicator)
- Click on it to view details

**That's it!** The app is now monitoring a virtual TR-069 device.

---

## Detailed Setup Instructions

### Prerequisites

Before you start, make sure you have:

1. **Node.js 18 or higher**
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```
   
   If not installed: https://nodejs.org/

2. **Docker & Docker Compose**
   ```bash
   docker --version
   docker-compose --version
   ```
   
   If not installed: https://www.docker.com/

3. **Available Ports**
   - 5173 (Vite dev server)
   - 7547 (GenieACS CWMP)
   - 7557 (GenieACS NBI API)
   - 3000 (GenieACS UI)
   - 27017 (MongoDB)
   - 6379 (Redis)

### Installation

#### 1. Navigate to Project Directory
```bash
cd poc-home-security-app
```

#### 2. Install Dependencies
```bash
npm install
```

Expected output:
```
up to date, X packages in Y seconds
```

#### 3. (Optional) Automated Setup
We provide a setup script:
```bash
bash scripts/setup.sh
```

This runs all steps automatically and waits for services to be ready.

### Running the App

#### Start Docker Environment
This starts GenieACS, MongoDB, Redis, and a virtual CPE device.

```bash
docker-compose up -d
```

Verify containers are running:
```bash
docker-compose ps
```

You should see 6 services: mongodb, redis, genieacs-cwmp, genieacs-nbi, genieacs-ui, cpe-simulator.

#### Check GenieACS Health
```bash
curl http://localhost:7557/devices
```

Should return a JSON array (possibly empty initially).

#### Start Development Server
```bash
npm run dev
```

Output will show:
```
  VITE v4.5.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

#### Open in Browser
- Click the link or go to http://localhost:5173
- You should see the Home Security Dashboard

### Waiting for Your First Device

The virtual CPE device needs time to initialize and check-in to GenieACS:

1. **Monitor Docker Logs**
   ```bash
   docker-compose logs -f cpe-simulator
   ```
   Look for messages like "Check-in successful"

2. **Check GenieACS UI**
   Visit http://localhost:3000 to see the admin interface and verify device registration

3. **Refresh App**
   After you see the device in GenieACS UI, refresh http://localhost:5173
   
4. **Wait Up to 2 Minutes**
   First check-in can take 30-120 seconds

### First Actions

Once you see a device in the list:

#### 1. View Device Details
- Click on the device in the left panel
- See device ID, serial number, registration time
- View when it last checked in

#### 2. View Parameters
- In the device panel, click "Parameters" tab
- See all TR-181 device parameters
- Search for specific parameters

#### 3. Refresh Device Data
- Click "Refresh" button
- App will immediately fetch latest parameters

#### 4. Send a Reboot Command
- Click "Reboot" button
- You'll see "Reboot command sent"
- On next device check-in, device reboots
- (In the simulator, this is simulated)

#### 5. Monitor Status Over Time
- Scroll down to see "Device Status Over Time" chart
- Watch online/offline status change
- Try stopping the device: `docker stop cpe-simulator`

---

## Understanding the Dashboard

### Main Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Home Security Dashboard          [Settings]                │
└─────────────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────────────┐
│                  │                                          │
│  Devices         │  Device Details                          │
│  ────────        │  ─────────────────                       │
│                  │                                          │
│  [DE-AD-BE-EF]   │  Information  Parameters                 │
│  Online ✓        │                                          │
│  2m ago          │  Device ID: 202BC1-...                  │
│                  │  Serial: DE-AD-BE-EF                    │
│  [Other...]      │  Last Inform: 12:34:56                  │
│  Offline ✗       │                                          │
│  5m ago          │  [Refresh] [Reboot] [Reset]             │
│                  │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Device Status Over Time                                     │
│                                                              │
│  [Chart showing online/offline trend over time]             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Device Status Indicators

- **Green ✓ Online**: Device checked in within last 5 minutes
- **Red ✗ Offline**: No check-in for more than 5 minutes
- **Clock Icon**: Last check-in time (e.g., "2m ago")

### Tabs

**Information Tab**: Basic device details
- Device ID
- Serial number
- Registration date
- Last check-in time

**Parameters Tab**: Full TR-181 parameter list
- Search/filter parameters
- View parameter names and values
- Monitor device configuration

---

## Configuration

### Settings Modal

Click **Settings** in the top right to configure:

#### NBI URL
- **Default**: `http://localhost:7557`
- **In Production**: Your GenieACS NBI server URL
- **With Proxy**: `/nbi` (if Vite proxy is configured)

#### Polling Interval
- **Default**: 5000ms (5 seconds)
- **Range**: 1000-60000ms
- **Trade-off**: Faster polling = more accurate, but higher server load

Settings persist in browser localStorage.

---

## Testing Scenarios

### Scenario 1: Multiple Devices
Create more virtual CPEs:
```bash
docker-compose up -d --scale cpe-simulator=5
```

Devices will gradually appear in the dashboard.

### Scenario 2: Device Goes Offline
Stop a device:
```bash
docker stop cpe-simulator
```

After 5 minutes, it will show as "Offline" in the dashboard.
Restart it:
```bash
docker start cpe-simulator
```

### Scenario 3: High Latency
Simulate 2 seconds of network delay:
```bash
docker run -it --rm --net=host \
  --cap-add=NET_ADMIN \
  projectdiscovery/pumba \
  netem --duration 60s --delay 2000ms cpe-simulator
```

Watch how the app handles slow responses.

### Scenario 4: Device Reset
Stop and remove the CPE to simulate a fresh device:
```bash
docker-compose stop cpe-simulator
docker-compose rm -f cpe-simulator
docker-compose up -d cpe-simulator
```

Device will re-register with a new ID.

---

## Common Questions

### Q: The app shows "No devices found"
**A**: This is normal for the first 30-60 seconds. The CPE simulator needs time to:
1. Start (container initialization)
2. Contact GenieACS CWMP (first check-in)
3. Register in the system

Check logs: `docker-compose logs cpe-simulator`

### Q: I see "Connection Error"
**A**: Check that GenieACS is running:
```bash
docker-compose ps
curl http://localhost:7557/devices
```

If it fails, check Docker logs:
```bash
docker-compose logs genieacs-nbi
```

### Q: Can I run this on a remote GenieACS?
**A**: Yes! Update Settings → NBI URL to your server URL (e.g., `https://genieacs.example.com`).

Make sure CORS is configured on the GenieACS server.

### Q: How do I stop everything?
**A**: 
```bash
# Stop app dev server
# Press Ctrl+C in terminal

# Stop Docker containers
docker-compose stop

# Or remove everything
docker-compose down -v
```

### Q: How do I clean up completely?
**A**:
```bash
bash scripts/cleanup.sh
```

This removes node_modules, dist, and stops all Docker containers.

---

## Next Steps

1. **Explore the Code**
   - Start with `src/App.tsx`
   - Read comments in `src/api/client.ts`
   - Check `src/types.ts` for data structures

2. **Read Documentation**
   - [README.md](README.md) - Overview and features
   - [SETUP.md](SETUP.md) - Detailed setup guide
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design

3. **Try Modifications**
   - Add a new parameter display component
   - Modify device list styling
   - Adjust polling interval

4. **Add Real Devices**
   - Replace CPE simulator with real routers
   - Configure routers to connect to your GenieACS instance

5. **Deploy to Production**
   ```bash
   npm run build
   # Output in dist/ - deploy to your server
   ```

---

## Troubleshooting

### Port Already in Use
If you get "Address already in use":
```bash
# On macOS/Linux, find process:
lsof -i :5173

# Kill the process:
kill -9 <PID>
```

### Docker Compose Fails to Start
```bash
# Check Docker daemon is running
docker ps

# Try rebuilding images
docker-compose down
docker-compose pull
docker-compose up -d
```

### npm install Hangs
```bash
# Clear cache
npm cache clean --force

# Try again
npm install
```

### Browser Shows Blank Page
- Check browser console for errors (F12 → Console)
- Verify dev server is running: `npm run dev` should show "Local: http://localhost:5173"
- Try clearing browser cache (Ctrl+Shift+Del)

---

## Support

For more information:
- 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design details
- 🔗 Visit [GenieACS Documentation](https://genieacs.com/)
- 📡 Check [TR-069 Standard](https://www.broadband-forum.org/)

---

## Ready?

You're all set! 🎉

1. Run: `npm run dev`
2. Open: http://localhost:5173
3. Explore and enjoy!
