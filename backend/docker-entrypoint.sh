#!/bin/sh
# Entrypoint do backend: aplica as migrations ANTES de subir o servidor (design decisão 1).
# Falha rápida (exit != 0) se o banco estiver inalcançável — sem boot silencioso sem banco.
set -e

echo "Aplicando migrations (prisma migrate deploy)..."
./node_modules/.bin/prisma migrate deploy

echo "Iniciando backend..."
exec node dist/main.js
