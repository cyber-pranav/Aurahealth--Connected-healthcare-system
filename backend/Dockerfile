# Backend Dockerfile for Google Cloud Run
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (Cloud Run uses 8080 by default, but we'll use PORT env)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
