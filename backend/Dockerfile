# ───────── 1 ▪ build stage ──────────────────────────────────────
FROM --platform=$TARGETPLATFORM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build                     # → dist/

# ───────── 2 ▪ runtime stage ───────────────────────────────────
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# compiled code + prod deps
COPY --from=build /app/dist          ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

EXPOSE 4000
# Node’s ESM resolver needs the flag so it auto-adds “.js”
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]