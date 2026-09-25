#!/bin/sh
# Entrypoint do backend (task 1.2): pass-through — o `prisma migrate deploy` entra na
# task 2.2 (RED da 2.1: o servidor sobe sem banco, silenciosamente).
set -e

exec node dist/main.js
