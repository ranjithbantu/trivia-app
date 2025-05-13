# ───────────── 1 ▪ BUILD STAGE ──────────────────────────────────────────────
FROM --platform=$TARGETPLATFORM node:20-alpine AS build
WORKDIR /app

# install exactly what package.json says
COPY package.json package-lock.json ./
RUN npm ci

# copy source and transpile to /app/dist  (tsc is in dev-deps)
COPY . .
RUN npm run build          # → dist/

# ───────────── 2 ▪ RUNTIME STAGE ───────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# bring over compiled code + prod deps only
COPY --from=build /app/dist              ./dist
COPY --from=build /app/package*.json     ./
RUN npm ci --omit=dev

EXPOSE 4000

# ⚠️  Node ESM resolver needs the flag below so it adds “.js” automatically
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]