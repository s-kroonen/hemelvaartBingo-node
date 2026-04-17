# Stage 1: Build
FROM node:20-alpine AS builder

# Install build essentials if any native modules exist
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Copy workspace manifests first to cache the 'npm install' layer
COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# 2. Install dependencies (using ci for faster/cleaner builds)
RUN npm ci -w frontend

# 3. Copy source and build
COPY frontend ./frontend
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/frontend
RUN npm run build

# Stage 2: Production (Tiny image)
FROM nginx:alpine

# Copy the custom config we created above
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]