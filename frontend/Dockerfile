# Stage 1: Build React app
FROM node:20 AS builder

WORKDIR /app

# Build-time argument
ARG VITE_API_URL

# Make it available for Vite
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
COPY frontend ./frontend

RUN npm install

WORKDIR /app/frontend
RUN echo "VITE_API_URL=$VITE_API_URL" > .env.production \
    && npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Optional: custom nginx config
# COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]