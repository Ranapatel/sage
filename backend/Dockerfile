FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache dumb-init

# Install ALL deps (including devDeps needed for tsc build)
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Generate the Prisma Client before type-checking.
# `npm ci` reinstalls node_modules fresh inside the image, and because
# .dockerignore excludes node_modules, the locally-generated .prisma/client
# is not present. The @prisma/client postinstall hook is unreliable in
# Docker/CI, so we generate explicitly to guarantee all generated types
# (e.g. UserPreferenceUncheckedCreateInput) exist before `tsc` runs.
# `prisma generate` only needs the schema, not a live DATABASE_URL.
RUN npx prisma generate


# Compile TypeScript → dist/
RUN npx tsc

# Install and build the transport NestJS microservice
RUN cd transport && npm ci && npm run build

# Prune devDependencies after build
RUN npm prune --omit=dev

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser && \
    chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

