#!/bin/sh
set -e

# Asegurarse de que prisma esté generado para el runtime de Alpine
npx prisma generate

# Aplicar las migraciones a la base de datos de producción (Railway PostgreSQL)
echo "Ejecutando migraciones de base de datos..."
npx prisma db push --accept-data-loss

# Iniciar la aplicación
exec "$@"
