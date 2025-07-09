FROM node:22 AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# Production Stage
FROM node:22-alpine AS production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Only non-sensitive defaults
ARG APP_ENV=production
ARG PORT=3000
ARG ALLOWED_ORIGINS=
ARG LOG_LEVEL=info

ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=${APP_ENV}
ENV PORT=${PORT}
ENV ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
ENV LOG_LEVEL=${LOG_LEVEL}

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm prune --prod

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/src/index.js"]


