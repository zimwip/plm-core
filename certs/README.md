# certs/ — TLS cert for the nginx front door

nginx is the **single external entry point** and terminates TLS here. Everything
behind it (spe-api gateway → backends) stays plain HTTP inside the compose network.

| File | Purpose |
|------|---------|
| `localhost.crt` | self-signed server cert, `CN=localhost`, SAN `localhost`/`127.0.0.1`/`::1` |
| `localhost.key` | private key (dev only) |

These are **dev-only, self-signed** — the browser will warn the first time; accept the
exception (or trust `localhost.crt` in your OS/browser store). Mounted read-only into
the nginx container at `/etc/nginx/certs/` (see `docker-compose.yml`), so swapping the
cert needs **no image rebuild**.

## Regenerate / replace

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/localhost.key -out certs/localhost.crt \
  -days 3650 -subj "/CN=localhost/O=PLM Core Dev" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1"
```

For a real deployment, drop your own `localhost.crt`/`localhost.key` (or a CA-signed pair
named the same) here and restart the frontend container. Do **not** ship the dev key to prod.
