FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache dumb-init

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

# Install and build the transport NestJS microservice
RUN cd transport && npm ci && npm run build

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser && \
    chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
