# Multi-stage build for production
FROM node:22-alpine AS builder

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Production stage
FROM node:22-alpine AS production

# Install nginx for serving static files
RUN apk add --no-cache nginx

# Copy built frontend
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy backend
WORKDIR /app
COPY --from=builder /app/server ./

# Copy nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx' >> /start.sh && \
    echo 'cd /app && npm start' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80 5000

CMD ["/start.sh"]
