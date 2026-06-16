---
name: run-plm-core
description: Build, launch, and drive the PLM Core stack. Use to run / start / boot the app, bring up the docker-compose services, smoke-test the spe-api gateway and data plane, or screenshot the React frontend. Triggers — "run plm-core", "start the stack", "screenshot the frontend", "is the app up", "smoke test the API".
---

# Run PLM Core

PLM Core is a ~16-service microservice system orchestrated by **one docker-compose
file**. Nothing runs standalone: every external request enters through the
**spe-api gateway** (`/api/<serviceCode>`), which load-balances to pno/psm/platform/etc.
The user surface is a **React SPA** served by nginx on `http://localhost:3000`,
which **auto-logs-in** (default `user-alice`) on page load — there is no login form.

You drive it with **`.claude/skills/run-plm-core/driver.mjs`** (Node, no app deps):
it logs in through the gateway, hits the data plane, and screenshots the SPA with
headless chromium. All paths below are relative to the repo root (`<unit>/`).

> Host here is **Fedora + podman** (the `docker` CLI is a podman shim). On Ubuntu
> swap `dnf` for `apt-get` and the chromium path accordingly.

## Prerequisites (one-time)

```bash
# Headless browser for the screenshot path. Binary lands at
# /usr/lib64/chromium-browser/headless_shell
sudo dnf install -y chromium-headless

# Driver deps (puppeteer-core only — uses the system chromium above)
cd .claude/skills/run-plm-core && npm install && cd -
```

`.env` must exist at repo root with the four required secrets
(`PG_PASSWORD`, `PLM_SERVICE_SECRET`, `GARAGE_RPC_SECRET`, `GARAGE_ADMIN_TOKEN`).
It was already present here; `cp .env.example .env` and fill them if missing.

## Build / Run the stack

All service images are built by compose on first up. To (re)build after a code
change use `./run.sh build <svc>` or `docker compose build <svc>`; a plain up
reuses existing images.

```bash
# Bring up everything detached. Backends gate on health (Vault unseal, Flyway,
# NATS, garage bootstrap) so this takes ~1–2 min on warm images.
docker compose up -d

# plm-frontend depends_on spe-api *healthy*; if spe-api is still "starting" the
# first up prints "Error dependency spe-api failed to start" and skips the
# frontend — the backends still come up. Once spe-api is healthy, start it:
docker compose up -d plm-frontend
```

Wait for health, then confirm the gateway answers:

```bash
# spe-api healthy?
docker inspect -f '{{.State.Health.Status}}' spe-api
# frontend serving?
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/    # -> 200
```

## Run (agent path) — the driver

```bash
cd .claude/skills/run-plm-core

# 1) API smoke through the gateway: login -> /me -> pno + psm data plane
node driver.mjs api

# 2) Screenshot the auto-logged-in SPA (writes plm-core.png + plm-core.txt)
node driver.mjs shot plm-core.png

# both (default)
node driver.mjs all plm-core.png
```

Verified output of `node driver.mjs all`:

```
API smoke against http://localhost:3000 as user-admin
  OK  login -> admin (admin=true)
  OK  GET /api/spe/auth/me -> 200
  OK  GET /api/pno/users -> 200
  OK  GET /api/psm/nodes -> 200
Screenshot http://localhost:3000 -> plm-core.png
  OK  rendered "PLM Core" (451 chars text) -> plm-core.png
```

`plm-core.png` is the PSM Dashboard (left object tree, "PLATFORM UP · 10/10 svc ·
11/11 inst", admin avatar). The sibling `plm-core.txt` is the page innerText — use
it to assert content without opening the image. Driver exits non-zero on the first
failed check.

**Login shape** (no password — SSO-style, identity asserted by the `X-User` header):

```bash
# Mint a session JWT, then call any service through the gateway
TOK=$(curl -s -X POST -H 'X-User: user-admin' \
  http://localhost:3000/api/spe/auth/login | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s -H "Authorization: Bearer $TOK" -H 'X-PLM-ProjectSpace: ps-default' \
  http://localhost:3000/api/psm/nodes
```

Env overrides: `BASE_URL` (default `http://localhost:3000`), `X_USER` (default
`user-admin`), `CHROMIUM` (default `/usr/lib64/chromium-browser/headless_shell`).
Seed users: `user-admin` (admin), `user-alice`, `user-bob`, `user-charlie`.

## Run (human path)

`./run.sh` brings the stack up and exits when healthy; open `http://localhost:3000`
in a real browser. Useless headless — use the driver above instead. `./run.sh down`
to stop, `./run.sh reset` to wipe volumes and rebuild.

## Stop

```bash
docker compose down            # keep volumes (Postgres/Vault/garage data persists)
docker compose down -v         # also wipe volumes (fresh DB next boot)
```

## Gotchas

- **First `docker compose up -d` reports `Error dependency spe-api failed to start`.**
  Not a real failure — `plm-frontend`'s health-gated `depends_on` times out while
  spe-api is still "starting". Backends come up regardless; just re-run
  `docker compose up -d plm-frontend` once `spe-api` is healthy.
- **No login form.** The SPA auto-logins as `user-alice` (hardcoded in
  `frontend/src/App.jsx`) and the session token is held in JS memory (not
  localStorage), so you can't pre-seed auth — drive the running page, or use the
  gateway directly with `X-User`.
- **`headless_shell` is not on `PATH`.** It installs to
  `/usr/lib64/chromium-browser/headless_shell`; the driver points there by default.
- **Benign page errors in the screenshot run:** `NotFoundError: ... deleteObjectStore
  on 'IDBDatabase'` — the SPA tidying an IndexedDB store on boot. The app renders
  fine; ignore. The driver only fails the shot if the page text is near-empty.
- **psm endpoints are bare (`/api/psm/nodes`), not `/api/psm/node-types`.** Most psm
  list routes need a project space header (`X-PLM-ProjectSpace: ps-default`).
- **Two psm replicas** (`psm-api-1`, `psm-api-2`) register the same `psm` code; the
  gateway round-robins. The status chip showing `11/11 inst` includes both.

## Troubleshooting

- `curl http://localhost:3000/` not 200 → `plm-frontend` didn't start; check
  `docker ps | grep frontend` and re-run `docker compose up -d plm-frontend` after
  `spe-api` is healthy.
- `driver.mjs api` login fails → gateway/pno not ready. Check
  `docker inspect -f '{{.State.Health.Status}}' spe-api pno-api`.
- `driver.mjs shot` errors `Failed to launch the browser process` → wrong/missing
  chromium; verify `ls /usr/lib64/chromium-browser/headless_shell` or set
  `CHROMIUM=/path/to/chrome`.
- Compose up fails on a `:?` variable → `.env` missing a required secret; see
  Prerequisites.
