# Stage 1: Build & Install dependencies
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install production dependencies only to keep image small
RUN npm install --omit=dev

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependencies from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy application code
COPY . .

# Expose API port
EXPOSE 3000

# Healthcheck to ensure container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/metrics || exit 1

# Start the server
CMD ["node", "server.js"]
