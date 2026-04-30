# frontend — React 18 SPA

React 18 + nginx · port 3000 (via nginx) · pas framework lourd.

---

## Stack

| Composant | Choix | Raison |
|-----------|-------|--------|
| UI | React 18 | SPA simple |
| Serveur statique | nginx | Termine HTTP, proxy vers spe-api |
| Temps réel | WebSocket STOMP | Notifs lock/état seulement |

---

## Routing

nginx (port 3000) proxy toutes routes `/api/*` vers spe-api (port 8082). Aucun service backend exposé direct.

```
/api/spe/auth         ──► spe-api (login, JWT)
/api/psm/*            ──► spe-api ─── svc://psm
/api/pno/*            ──► spe-api ─── svc://pno
/api/psa/*            ──► spe-api ─── svc://psa
/api/platform/*       ──► spe-api ─── svc://platform
/api/ws               ──► spe-api ─── svc://ws  (WebSocket upgrade)
/actuator/            ──► spe-api
```

Sous **Podman**, pas Docker. `127.0.0.11` (DNS embarqué Docker) n'existe pas. nginx utilise `proxy_pass` simple sans directive `resolver`. Ordre démarrage garanti par `depends_on: condition: service_healthy` dans docker-compose.

---

## Pas de state management global

Frontend intentionnel simple (pas Redux/Zustand). État local à chaque composant + rechargement depuis API. Acceptable pour POC, à revoir si volume données augmente.

---

## Header HTTP envoyés

`X-PLM-User: user-alice` + `X-PLM-ProjectSpace: ps-default`. Auth réelle via JWT produit par `/api/spe/auth/login`.
