# Multi-stage build for Angular app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build the application for production
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built application to nginx
COPY --from=build /app/dist/claims-app/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run standard)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]