FROM node:20

WORKDIR /app

COPY package*.json ./
COPY backend ./backend

RUN npm install

WORKDIR /app/backend

RUN npm run build

CMD ["node", "dist/main.js"]