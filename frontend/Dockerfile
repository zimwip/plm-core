# Stage 1: build with Vite
FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
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
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
