# Stage 1: bundle app + workers into self-contained ESM (deps inlined, no node_modules)
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY app.js step-lib.js step-scan.js worker-split.js convert-pool.js worker-convert.js ./
RUN npm run build

# Stage 2: runtime — bundled JS + occt wasm only, zero node_modules
FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=builder /app/dist/app.js /app/dist/worker-split.js /app/dist/worker-convert.js ./
COPY --from=builder /app/node_modules/occt-import-js/dist/occt-import-js.wasm ./
COPY package.json ./

EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node --input-type=commonjs -e "require('http').get('http://localhost:8090/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "--max-old-space-size=4096", "app.js"]
