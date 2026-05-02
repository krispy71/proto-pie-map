# ── Build stage ──────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifest files first so Docker can cache the npm install layer
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts

# ── Runtime stage ────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY server.js ./
COPY public/   ./public/

# Ownership
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3020

ENV PORT=3020 \
    NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3020/ || exit 1

CMD ["node", "server.js"]
