# syntax=docker/dockerfile:1

# Build a partir da raiz do monorepo (pnpm workspace):
#   docker build -f frontend/Dockerfile -t newestetica-frontend .

FROM node:24-alpine AS builder
ENV HUSKY=0
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --filter frontend --ignore-scripts
COPY frontend ./frontend
RUN pnpm --filter frontend build

FROM node:24-alpine AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=builder --chown=node:node /repo/frontend/.next/standalone ./
COPY --from=builder --chown=node:node /repo/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=node:node /repo/frontend/public ./frontend/public
USER node
EXPOSE 3000
CMD ["node", "frontend/server.js"]
