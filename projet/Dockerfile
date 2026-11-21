# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- run ----------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000 \
    API_INTERNAL_URL=http://api:8080

# The server bundle is self-contained: only the build output is needed.
COPY --from=build --chown=node:node /build/dist/projet ./dist/projet
USER node

EXPOSE 4000
CMD ["node", "dist/projet/server/server.mjs"]
