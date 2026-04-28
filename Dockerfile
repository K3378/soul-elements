FROM node:20-slim AS frontend-builder

# Install Chromium for PDF generation
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    fonts-freefont-ttf \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-slim AS backend

WORKDIR /app
COPY --from=frontend-builder /app/frontend/.next/standalone /app/frontend/
COPY --from=frontend-builder /usr/bin/chromium /usr/bin/chromium
COPY --from=frontend-builder /usr/share/fonts /usr/share/fonts

# Copy frontend public assets
COPY frontend/public /app/frontend/public/

# Copy backend
COPY backend/ /app/backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Environment
ENV NODE_ENV=production
ENV PORT=3001
ENV CHROMIUM_PATH=/usr/bin/chromium

EXPOSE 3001

CMD ["node", "server.js"]
