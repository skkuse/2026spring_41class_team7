#!/bin/sh
set -e
pnpm --filter @jobclaw/api exec prisma migrate deploy
exec node /app/apps/api/dist/index.js
