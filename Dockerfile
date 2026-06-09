FROM node:20-alpine

WORKDIR /app

COPY discord-bot/package.json ./
RUN npm install --omit=dev

COPY discord-bot/ ./

CMD ["node", "index.js"]
