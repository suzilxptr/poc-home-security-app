FROM node:20-alpine

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

# Create config directory
RUN mkdir -p /etc/genieacs

# Expose ports
EXPOSE 7547 7557

# Set production environment
ENV NODE_ENV=production

# Start both CWMP and NBI services with MongoDB connection URL
CMD sh -c 'export MONGODB_CONNECTION_URL="${MONGODB_CONNECTION_URL:-mongodb://localhost/genieacs}" && \
           export REDIS_URL="${REDIS_URL:-}" && \
           node /genieacs/dist/bin/genieacs-cwmp & \
           node /genieacs/dist/bin/genieacs-nbi & \
           wait'
