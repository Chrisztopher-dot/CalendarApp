# Multi-stage Dockerfile for Calendar Organizer SPA

# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Ultra-lightweight Nginx web server
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx html
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
