#!/usr/bin/env node

import http from 'http'

const ACS_URL = process.env.ACS_URL || 'http://localhost:7547'
const DEVICE_ID = process.env.DEVICE_ID || 'DE-AD-BE-EF-0001'
const CHECK_IN_INTERVAL = 30000 // Check in every 30 seconds

console.log(`\n🌐 CPE Simulator Starting`)
console.log(`📱 Device ID: ${DEVICE_ID}`)
console.log(`🎯 ACS URL: ${ACS_URL}\n`)

function sendCheckIn() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Body>
    <cwmp:Inform xmlns:cwmp="urn:dslforum-org:cwmp-1-0">
      <DeviceId>
        <Manufacturer>Test Manufacturer</Manufacturer>
        <OUI>DEADBE</OUI>
        <ProductClass>Test Router</ProductClass>
        <SerialNumber>${DEVICE_ID}</SerialNumber>
      </DeviceId>
      <Event soap:arrayType="cwmp:EventStruct[1]">
        <EventStruct>
          <EventCode>0 BOOTSTRAP</EventCode>
          <EventCommandKey></EventCommandKey>
        </EventStruct>
      </Event>
      <MaxEnvelopes>1</MaxEnvelopes>
      <CurrentTime>${new Date().toISOString()}</CurrentTime>
      <RetryCount>0</RetryCount>
      <ParameterList soap:arrayType="cwmp:ParameterValueStruct[3]">
        <ParameterValueStruct>
          <Name>Device.DeviceType</Name>
          <Value xsi:type="xsd:string">InternetGatewayDevice</Value>
        </ParameterValueStruct>
        <ParameterValueStruct>
          <Name>Device.SerialNumber</Name>
          <Value xsi:type="xsd:string">${DEVICE_ID}</Value>
        </ParameterValueStruct>
        <ParameterValueStruct>
          <Name>Device.UpTime</Name>
          <Value xsi:type="xsd:unsignedInt">3600</Value>
        </ParameterValueStruct>
      </ParameterList>
    </cwmp:Inform>
  </soap:Body>
</soap:Envelope>`

  const url = new URL(ACS_URL)
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname || '/',
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
      'Content-Length': Buffer.byteLength(body),
    },
  }

  const req = http.request(options, (res) => {
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      console.log(`✅ Check-in successful (${new Date().toLocaleTimeString()})`)
    })
  })

  req.on('error', (e) => {
    console.log(`❌ Check-in failed: ${e.message}`)
  })

  req.write(body)
  req.end()
}

// Initial check-in
sendCheckIn()

// Periodic check-ins
setInterval(sendCheckIn, CHECK_IN_INTERVAL)

console.log(`📡 Device will check in every ${CHECK_IN_INTERVAL / 1000} seconds`)
console.log(`Press Ctrl+C to stop\n`)
