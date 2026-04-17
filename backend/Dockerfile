# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci -w backend

COPY backend ./backend
RUN npm run build -w backend

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Only copy what is needed to run the app
COPY package*.json ./
COPY backend/package.json ./backend/

# Install ONLY production dependencies
RUN npm ci -w backend --omit=dev

# Copy build from previous stage
COPY --from=builder /app/backend/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]