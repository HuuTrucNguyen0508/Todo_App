# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies (this layer will be cached if package files don't change)
RUN pnpm install --no-frozen-lockfile

# Copy source code after dependencies are installed
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/scripts ./apps/api/scripts
COPY apps/api/tsconfig.json ./apps/api/

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN corepack enable

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Copy node_modules from builder to avoid version mismatches
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Copy built application and Prisma files
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=api:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=api:nodejs /app/apps/api/scripts ./apps/api/scripts

WORKDIR /app/apps/api

EXPOSE 4003

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && su -s /bin/sh api -c 'cd /app/apps/api && node dist/index.js'"]
