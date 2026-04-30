# ws-gateway — NATS → WebSocket bridge

`serviceCode` = `ws` · port 8085 · URL prefix `/api/ws` · Java 21 + Spring Boot 3.2.

**Push unidirectionnel** NATS → WebSocket vers frontend. Scopé par session authentifiée. Pas API REST métier.

---

## Endpoint

```
WS  /api/ws?token=<session-token>    ← upgrade WebSocket, auth via query param
```

`SPE_SELF_BASE_URL` doit pointer vers ws-gateway accessible depuis spe-api pour que upgrade traverse le gateway. spe-api forward path verbatim.

---

## Auth

Token de session passé via query param `?token=`. ws-gateway valide token (mêmes règles que `PlmAuthFilter` mais adaptées au handshake WS — pas header HTTP standard).

---

## Subscriptions NATS

Service consomme NATS et republie évents scopés par utilisateur authentifié. Backbone temps réel : notifications lock/état, refresh permissions, etc.
