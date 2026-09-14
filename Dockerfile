# Stage 1: Install dependencies and build
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and turbo config first for layer caching
COPY package.json turbo.json ./
COPY apps/bot/package.json ./apps/bot/
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/

# Fresh Linux-native install (no lockfile = correct platform binaries)
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx --yes prisma generate --schema=packages/database/prisma/schema.prisma

# Build everything via turbo (uses locally installed turbo v1)
RUN npm run build

# Stage 2: Production image
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy everything from builder
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start Next.js directly — no turbo, no workspace indirection
CMD ["npx", "--yes", "next", "start", "--port", "3000"]
