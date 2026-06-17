FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY html /usr/share/nginx/html
# 443 = TLS front door; 80 only issues the https redirect. Cert mounted from
# ./certs at runtime (see docker-compose.yml) — not baked into the image.
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
