FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Build GenieACS
RUN npm run build

# Create data directory for MongoDB connection storage
RUN mkdir -p /app/data

# Expose ports
EXPOSE 7547 7557

# Set production environment
ENV NODE_ENV=production
ENV MONGODB_CONNECTION_URL=${MONGODB_CONNECTION_URL}

# Start both CWMP and NBI services
CMD ["sh", "-c", "node dist/bin/genieacs-cwmp & node dist/bin/genieacs-nbi & wait"]
