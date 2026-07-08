#!/bin/sh

# Extract the container number from hostname (e.g., "poc-home-security-app-cpe-simulator-1" -> "1")
CONTAINER_NUM=$(hostname | grep -o '[0-9]*$')

# Generate unique device ID
DEVICE_ID="DE-AD-BE-EF-000${CONTAINER_NUM}"

# Export and run simulator
export DEVICE_ID
exec node /app/cpe-simulator.js
