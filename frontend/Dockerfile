# ---------- build stage ----------
FROM --platform=$TARGETPLATFORM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# allow overriding API URL at build-time (default: backend on localhost)
ARG VITE_API_URL="http://localhost:4000"
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build            # generates static files in /app/dist

# ---------- runtime ----------
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# provide custom Nginx config with API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
