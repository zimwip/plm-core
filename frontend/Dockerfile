# Stage 1: build with Vite
FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
# Cache-bust below the (cached) npm ci: run.sh passes a fresh CACHEBUST each
# build so podman/Buildah never reuses a stale source-copy / build layer
# (the "had to reset to see my changes" symptom). Deps above stay cached.
ARG CACHEBUST=0
COPY vite.config.js .
COPY index.html .
COPY src ./src
COPY public ./public
RUN npm run build

# Stage 2: nginx serving
FROM docker.io/library/nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY --from=builder /app/dist /usr/share/nginx/html
# 443 = TLS front door; 80 only issues the https redirect. Cert is mounted at
# /etc/nginx/certs at runtime (see docker-compose.yml) — not baked into the image.
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
