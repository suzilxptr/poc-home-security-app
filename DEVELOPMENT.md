# Development Guide

Guide for developers working on the Home Security Dashboard.

## Project Structure

```
home-security-app/
├── src/
│   ├── api/
│   │   └── client.ts              # GenieACS NBI HTTP client
│   ├── components/
│   │   ├── Dashboard.tsx          # Main layout component
│   │   ├── DeviceList.tsx         # Device listing UI
│   │   ├── DeviceDetails.tsx      # Device detail panel
│   │   ├── MonitoringChart.tsx    # Recharts chart component
│   │   └── Settings.tsx           # Configuration modal
│   ├── store/
│   │   └── appStore.ts            # Zustand store (global state)
│   ├── types.ts                   # TypeScript interfaces
│   ├── App.tsx                    # Root component
│   ├── App.css                    # App styles
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind CSS config
├── docker-compose.yml             # Lab environment
├── package.json                   # Dependencies
├── README.md                      # User documentation
├── SETUP.md                       # Setup instructions
├── ARCHITECTURE.md                # System design
└── DEVELOPMENT.md                 # This file
```

## Development Workflow

### 1. Start Development

```bash
# Install dependencies
npm install

# Start Docker lab environment
docker-compose up -d

# Start Vite dev server
npm run dev
```

Dev server runs on http://localhost:5173 with hot module reloading.

### 2. Make Changes

Edit files in `src/` directory. Changes are instantly reflected in browser.

Example: Edit `src/components/DeviceList.tsx` → changes appear immediately.

### 3. Run Type Checks

```bash
npm run type-check
```

Catches TypeScript errors before runtime.

### 4. Build for Production

```bash
npm run build
```

Outputs optimized bundle to `dist/` directory.

---

## Code Patterns

### Adding a New Component

1. Create file in `src/components/MyComponent.tsx`:

```typescript
import React from 'react'
import { MyIcon } from 'lucide-react'

interface MyComponentProps {
  title: string
  // ...
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-lg font-bold">{title}</h2>
      {/* JSX */}
    </div>
  )
}
```

2. Import in parent component:

```typescript
import { MyComponent } from './MyComponent'

// Use it:
<MyComponent title="Hello" />
```

### Adding API Methods

Edit `src/api/client.ts`:

```typescript
async myNewMethod(deviceId: string): Promise<any> {
  try {
    const response = await this.client.get(`/devices/${deviceId}/custom-endpoint`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch custom data:', error)
    throw error
  }
}
```

### Adding Store Actions

Edit `src/store/appStore.ts`:

```typescript
// Add to AppStore interface
myNewAction: (param: string) => Promise<void>

// Add to create() function
myNewAction: async (param) => {
  try {
    const result = await acsClient.myNewMethod(param)
    set({ /* update state */ })
  } catch (error) {
    set({ error: 'Failed to do action' })
  }
}
```

Use in components:

```typescript
const { myNewAction } = useAppStore()

// Call it:
await myNewAction('some-param')
```

### Styling with Tailwind

All components use Tailwind CSS utility classes. No CSS files needed.

```typescript
// Layout
<div className="p-4 mb-8 flex gap-2">

// Colors
className="bg-blue-100 text-blue-700"
className="bg-red-50 text-red-600"

// Responsive
className="grid grid-cols-1 lg:grid-cols-3"

// State
className="hover:bg-slate-200"
className="disabled:opacity-50"
```

Reference: [Tailwind Docs](https://tailwindcss.com/)

---

## Testing

### Run TypeScript Check
```bash
npm run type-check
```

### Run Linter
```bash
npm run lint
```

### Manual Testing Checklist

When adding features, test:

- [ ] Component renders without errors
- [ ] Data loads correctly
- [ ] Error states display properly
- [ ] Works on different screen sizes
- [ ] Buttons/interactions work as expected
- [ ] No console warnings/errors

### Test with Different Device States

```bash
# 0 devices
docker-compose stop cpe-simulator

# 1 device (default)
docker-compose start cpe-simulator

# Multiple devices
docker-compose up -d --scale cpe-simulator=5

# Slow network
docker run -it --rm --net=host --cap-add=NET_ADMIN \
  projectdiscovery/pumba \
  netem --duration 60s --delay 2000ms cpe-simulator
```

---

## Debugging

### Browser DevTools

1. Open http://localhost:5173
2. Press F12 to open DevTools
3. Console tab shows React errors and console.log() output
4. Network tab shows API requests

### Check Zustand Store

In browser console:
```javascript
import { useAppStore } from './store/appStore'
const state = useAppStore.getState()
console.log(state.devices)
```

### API Debugging

Test GenieACS directly:

```bash
# List devices
curl http://localhost:7557/devices | jq

# Get specific device
curl http://localhost:7557/devices/DEVICE_ID | jq

# Check NBI health
curl http://localhost:7557/devices?skip=0&limit=1
```

### Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f genieacs-nbi
docker-compose logs -f cpe-simulator
docker-compose logs -f mongodb
```

---

## Performance Optimization

### Reduce Re-renders

Use `React.memo()` for expensive components:

```typescript
const MyComponent = React.memo(({ data }: Props) => {
  return <div>{data}</div>
})
```

### Optimize Lists

For large device lists, implement virtual scrolling:

```typescript
import { FixedSizeList as List } from 'react-window'

<List height={600} itemCount={devices.length} itemSize={80}>
  {({ index, style }) => (
    <div style={style}>{devices[index].name}</div>
  )}
</List>
```

### Polling Optimization

Instead of polling all devices every interval, poll only changed devices:

```typescript
// Current: fetchDevices() - fetches all
// Better: fetchChangedDevices() - only fetch if device status changed
```

---

## Adding Dependencies

### Install Package
```bash
npm install package-name
```

### Update Types
```bash
npm install -D @types/package-name
```

### Use in Code
```typescript
import { something } from 'package-name'
```

---

## Common Tasks

### Change Polling Interval
In `src/store/appStore.ts`:
```typescript
const defaultConfig: ACSConfig = {
  nbiUrl: 'http://localhost:7557',
  pollingInterval: 5000, // ← Change here (milliseconds)
}
```

### Change Offline Timeout
In `src/components/DeviceList.tsx`:
```typescript
const isOnline = (device: Device): boolean => {
  const now = Date.now()
  const lastInform = device._lastInform || 0
  return now - lastInform < 5 * 60 * 1000 // ← Change here (5 minutes)
}
```

### Add New Device Status Field
1. Update type in `src/types.ts`:
```typescript
interface Device {
  // ... existing fields
  newField?: string // Add here
}
```

2. Display in `src/components/DeviceDetails.tsx`:
```typescript
<InfoRow label="New Field" value={device.newField || 'N/A'} />
```

### Handle New Error Type
In `src/api/client.ts`:
```typescript
async listDevices(): Promise<Device[]> {
  try {
    // ...
  } catch (error) {
    if (error.response?.status === 401) {
      // Handle unauthorized
      set({ error: 'Please log in' })
    } else {
      // Generic error
      set({ error: 'Failed to load devices' })
    }
  }
}
```

---

## Version Management

### Update Dependencies
```bash
npm update
npm outdated  # Check for outdated packages
```

### Check Breaking Changes
Review the changelog before updating major versions:
- React: https://react.dev/blog
- Vite: https://vitejs.dev/guide/
- Tailwind: https://tailwindcss.com/docs

---

## Build & Deploy

### Production Build
```bash
npm run build
```

Output in `dist/` directory:
- `index.html`
- `assets/` folder with bundled JavaScript/CSS

### Deploy Options

#### Static Hosting (Netlify, Vercel, GitHub Pages)
```bash
npm run build
# Upload dist/ folder
```

#### Docker Container
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Kubernetes
```yaml
apiVersion: v1
kind: Service
metadata:
  name: home-security-app
spec:
  selector:
    app: home-security-app
  ports:
    - port: 80
      targetPort: 3000
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: home-security-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: home-security-app
  template:
    metadata:
      labels:
        app: home-security-app
    spec:
      containers:
        - name: app
          image: home-security-app:latest
          ports:
            - containerPort: 3000
```

---

## Code Style

### Naming Conventions

- **Components**: PascalCase (`DeviceList.tsx`)
- **Functions**: camelCase (`fetchDevices()`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT = 5000`)
- **Interfaces**: PascalCase with `I` prefix optional (`Device` or `IDevice`)

### File Organization

```typescript
// 1. Imports
import React from 'react'
import { Something } from './utils'

// 2. Types/Interfaces
interface Props {
  name: string
}

// 3. Main component
export const Component: React.FC<Props> = ({ name }) => {
  // Component logic
  return <div>{name}</div>
}

// 4. Helper components (if any)
const HelperComponent = () => { }
```

### Comments

Only add comments for non-obvious logic:

```typescript
// Good - explains why
const timeout = 5 * 60 * 1000 // 5 minutes; GenieACS allows up to 10 minutes

// Bad - just repeats code
const timeout = 300000 // timeout
```

---

## Resources

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Zustand**: https://github.com/pmndrs/zustand
- **Axios**: https://axios-http.com/
- **Recharts**: https://recharts.org/
- **Lucide Icons**: https://lucide.dev/

---

## Getting Help

1. Check component comments for implementation details
2. Search ARCHITECTURE.md for design decisions
3. Read GenieACS docs: https://genieacs.com/
4. Check browser console for errors
5. View Docker logs: `docker-compose logs -f`

---

## Contribution Guidelines

1. Create descriptive commit messages
2. Add TypeScript types for new functions
3. Test changes locally before committing
4. Update documentation if behavior changes
5. Keep components focused and single-purpose

Happy coding! 🚀
