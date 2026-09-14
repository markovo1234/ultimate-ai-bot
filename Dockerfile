# Stage 1: Install dependencies and build
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files first for layer caching
COPY package.json ./
COPY apps/bot/package.json ./apps/bot/
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/

# Install all dependencies (no lockfile, fresh Linux-native install)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the Next.js web app and the bot
RUN ./node_modules/.bin/turbo run build --filter=web --filter=@ultimate/bot

# Stage 2: Production image
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy everything from builder
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the Next.js web dashboard
CMD ["npm", "run", "start", "--workspace=web"]
