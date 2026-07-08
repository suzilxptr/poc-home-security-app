FROM node:20-alpine

# MongoDB connection URL should be provided at runtime via environment variable
# This will be set by Render.com from the Environment Variables dashboard
# GenieACS requires the GENIEACS_ prefix
ENV GENIEACS_MONGODB_CONNECTION_URL=""

WORKDIR /app

# Install git for cloning
RUN apk add --no-cache git

# Configure npm to use public registry
RUN npm config set registry https://registry.npmjs.org/

# Clone GenieACS from GitHub
RUN git clone https://github.com/genieacs/genieacs.git /genieacs

WORKDIR /genieacs

# Install GenieACS dependencies
RUN npm ci

# Build GenieACS
RUN npm run build

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose ports
EXPOSE 7547 7557

# Set production environment
ENV NODE_ENV=production

# Use sh -c to ensure env vars are passed properly
CMD ["/bin/sh", "/entrypoint.sh"]
