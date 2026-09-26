# syntax=docker/dockerfile:1

# Build a partir da raiz do monorepo (pnpm workspace):
#   docker build -f backend/Dockerfile -t newestetica-backend .

FROM node:24-alpine AS builder
ENV HUSKY=0
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY contracts/package.json contracts/
COPY backend/package.json backend/
RUN pnpm install --frozen-lockfile --filter backend... --ignore-scripts
COPY contracts ./contracts
COPY backend ./backend
RUN pnpm --filter backend exec prisma generate \
  && pnpm --filter backend build

FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
# node_modules completo do builder: o entrypoint precisa do CLI do Prisma
# (migrate deploy) — poda fica para quando houver deploy real (design decisão 2).
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/contracts/package.json ./contracts/package.json
COPY --from=builder /repo/contracts/dist ./contracts/dist
COPY --from=builder /repo/contracts/node_modules ./contracts/node_modules
COPY --from=builder /repo/backend/package.json ./backend/package.json
COPY --from=builder /repo/backend/node_modules ./backend/node_modules
COPY --from=builder /repo/backend/dist ./backend/dist
COPY --from=builder /repo/backend/prisma ./backend/prisma
COPY --from=builder /repo/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=builder /repo/backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
WORKDIR /app/backend
USER node
EXPOSE 3001
CMD ["./docker-entrypoint.sh"]
