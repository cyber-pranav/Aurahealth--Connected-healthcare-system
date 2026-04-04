# Frontend Dockerfile for Google Cloud Run
# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Accept build-time API URL arg (injected during Cloud Build)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build

# Stage 2: Serve with Nginx (lightweight)
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
