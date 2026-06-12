FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@10.30.0 --activate
WORKDIR /app

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN pnpm install --frozen-lockfile

COPY . .

# Build workspace deps, then API
RUN pnpm --filter @jobclaw/shared-types build
RUN pnpm --filter @jobclaw/api exec prisma generate
RUN pnpm --filter @jobclaw/api build
RUN chmod +x /app/start.sh

ENV NODE_ENV=production
EXPOSE 3001

CMD ["/app/start.sh"]
