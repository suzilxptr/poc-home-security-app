import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// Mock devices database
let devices = [
  {
    _id: 'device-001',
    _lastInform: Date.now() - 5000,
    _registered: Date.now() - 86400000,
    _lastBootstrap: Date.now() - 86400000,
    parameterNames: ['Device.SerialNumber', 'Device.DeviceType'],
    parameters: {
      'Device.SerialNumber': 'DE-AD-BE-EF-0001',
      'Device.DeviceType': 'InternetGatewayDevice',
      'Device.ManufacturerOUI': '001A2B',
      'Device.Manufacturer': 'Test Manufacturer',
      'Device.ModelName': 'Test Router',
      'Device.HardwareVersion': '1.0',
      'Device.SoftwareVersion': '2.1.4',
      'Device.UpTime': '86400',
    },
  },
  {
    _id: 'device-002',
    _lastInform: Date.now() - 15000,
    _registered: Date.now() - 172800000,
    _lastBootstrap: Date.now() - 172800000,
    parameterNames: ['Device.SerialNumber', 'Device.DeviceType'],
    parameters: {
      'Device.SerialNumber': 'DE-AD-BE-EF-0002',
      'Device.DeviceType': 'InternetGatewayDevice',
      'Device.ManufacturerOUI': '001A2B',
      'Device.Manufacturer': 'Test Manufacturer',
      'Device.ModelName': 'Test Panel',
      'Device.HardwareVersion': '1.5',
      'Device.SoftwareVersion': '3.0.1',
      'Device.UpTime': '172800',
    },
  },
]

// GET /devices - List all devices
app.get('/devices', (req, res) => {
  const query = req.query.query ? JSON.parse(req.query.query) : null

  if (query && query._id) {
    const device = devices.find((d) => d._id === query._id)
    return res.json(device ? [device] : [])
  }

  res.json(devices)
})

// GET /devices/:id - Get specific device
app.get('/devices/:id', (req, res) => {
  const device = devices.find((d) => d._id === req.params.id)
  if (!device) {
    return res.status(404).json({ error: 'Device not found' })
  }
  res.json(device)
})

// POST /devices/:id/tasks - Send command (reboot, factory reset)
app.post('/devices/:id/tasks', (req, res) => {
  const { id } = req.params
  const { name } = req.body

  const device = devices.find((d) => d._id === id)
  if (!device) {
    return res.status(404).json({ error: 'Device not found' })
  }

  console.log(`Command "${name}" queued for device ${id}`)

  // Simulate rebooting
  if (name === 'reboot') {
    setTimeout(() => {
      device._lastInform = Date.now()
      console.log(`Device ${id} rebooted and checked in`)
    }, 3000)
  }

  res.json({
    _id: `task-${Date.now()}`,
    name: name,
    deviceId: id,
    status: 'pending',
  })
})

// PUT /devices/:id - Update device parameters
app.put('/devices/:id', (req, res) => {
  const { id } = req.params
  const { parameterValues } = req.body

  const device = devices.find((d) => d._id === id)
  if (!device) {
    return res.status(404).json({ error: 'Device not found' })
  }

  if (parameterValues && Array.isArray(parameterValues)) {
    parameterValues.forEach(([key, value]) => {
      device.parameters[key] = value
      console.log(`Updated ${key} = ${value} for device ${id}`)
    })
  }

  res.json(device)
})

// Simulate device check-ins every 10 seconds
setInterval(() => {
  devices.forEach((device) => {
    device._lastInform = Date.now()
  })
}, 10000)

const PORT = 7557
app.listen(PORT, () => {
  console.log(`\n✅ Mock GenieACS NBI API running on http://localhost:${PORT}`)
  console.log(`📱 Devices: ${devices.length}`)
  console.log(`   - ${devices.map((d) => d.parameters['Device.SerialNumber']).join(', ')}\n`)
})
