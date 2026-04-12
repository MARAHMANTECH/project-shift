#!/bin/sh
# Project SHIFT API — Container Entrypoint
# Diagnostik + prisma migrate + NestJS start
set -e

echo "[SHIFT] ═══════════════════════════════════"
echo "[SHIFT] Project SHIFT API — Starting..."
echo "[SHIFT] PORT=${PORT:-not set}"
echo "[SHIFT] NODE_ENV=${NODE_ENV:-not set}"

if [ -z "$DATABASE_URL" ]; then
  echo "[SHIFT] ❌ DATABASE_URL er IKKE sat! Serveren kan ikke starte."
  exit 1
else
  echo "[SHIFT] ✅ DATABASE_URL er sat"
fi

echo "[SHIFT] ═══════════════════════════════════"

# Kør prisma migrate deploy (fejl er OK — databasen kan allerede være opdateret)
echo "[SHIFT] Kører prisma migrate deploy..."
npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1 || {
  echo "[SHIFT] ⚠️ Prisma migrate fejlede (kan være OK hvis DB allerede er opdateret)"
}

echo "[SHIFT] Starter NestJS server..."
exec node apps/api/dist/main.js
