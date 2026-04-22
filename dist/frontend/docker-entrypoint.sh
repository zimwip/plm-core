#!/bin/sh
# Auto-detect the container's DNS resolver from /etc/resolv.conf.
# Docker Desktop injects 127.0.0.11; Podman uses its bridge IP (e.g. 10.89.0.1).
# This makes the nginx config portable across both runtimes.
RESOLVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)
RESOLVER=${RESOLVER:-127.0.0.11}
sed -i "s/__NGINX_RESOLVER__/$RESOLVER/g" /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
