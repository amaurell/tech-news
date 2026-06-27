FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    apk add --no-cache wget

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER appuser

ENV NODE_ENV=production
ENV PORT=4001
EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4001/api/health || exit 1

CMD ["node", "backend/server.js"]
