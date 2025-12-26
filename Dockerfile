# Dockerfile - container for the bot
FROM node:18-alpine

# Install dependencies required for puppeteer/whatsapp-web.js (minimal)
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production
WORKDIR /app

# copy package files and install
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# copy app
COPY . .

# create directories for session storage and public assets
RUN mkdir -p /app/session /app/public/assets

EXPOSE 3000
CMD ["node", "headme.js"]