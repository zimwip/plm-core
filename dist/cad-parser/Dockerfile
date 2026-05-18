FROM node:20-slim

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY app.js step-lib.js worker-split.js ./

EXPOSE 8090
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node --input-type=commonjs -e "require('http').get('http://localhost:8090/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "--max-old-space-size=4096", "app.js"]
