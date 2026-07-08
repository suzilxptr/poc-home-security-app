FROM node:20-alpine

WORKDIR /app

# Configure npm to use public registry
RUN npm config set registry https://registry.npmjs.org/

# Copy package files first
COPY package*.json ./

# Install dependencies with npm ci (cleaner than npm install)
RUN npm ci

# Copy the entire project
COPY . .

# Build GenieACS
RUN npm run build

# Expose ports
EXPOSE 7547 7557

# Set production environment
ENV NODE_ENV=production

# Start both CWMP and NBI services
CMD node dist/bin/genieacs-cwmp & node dist/bin/genieacs-nbi & wait
