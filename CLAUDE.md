# CLAUDE.md — Contexte PLM Core (overview)

## Main rules
1. No assume. No hide confusion. Surface tradeoffs.
2. Min code that solve problem. Nothing speculative.
3. Touch only what must. Clean only own mess.
4. Define success criteria. Loop until verified.

---

## Per-service docs (load lazy quand Claude touche le module)

| Module | Couche | serviceCode | Doc détaillée |
|--------|--------|-------------|---------------|
| **spe-api** | Entrée | — (gateway) | [spe-api/CLAUDE.md](spe-api/CLAUDE.md) |
| **pno-api** | Fondamental | `pno` | [pno-api/CLAUDE.md](pno-api/CLAUDE.md) |
| **platform-api** | Fondamental | `platform` | [platform-api/CLAUDE.md](platform-api/CLAUDE.md) |
| **psm-admin** | Métier — config | `psa` | [psm-admin/CLAUDE.md](psm-admin/CLAUDE.md) |
| **psm-api** | Métier — données | `psm` | [psm-api/CLAUDE.md](psm-api/CLAUDE.md) |
| **ws-gateway** | Canal push | `ws` | [ws-gateway/CLAUDE.md](ws-gateway/CLAUDE.md) |
| **platform-lib** | Lib partagée | — | [platform-lib/CLAUDE.md](platform-lib/CLAUDE.md) |
| **frontend** | UI | — | [frontend/CLAUDE.md](frontend/CLAUDE.md) |

Pour créer un nouveau service : voir [platform-lib/CLAUDE.md](platform-lib/CLAUDE.md) (auto-configs, beans à fournir, checklist Dockerfile/compose, conventions routage). Réf vivante : module `dst/`.

---

## Architecture en 3 couches rôles

### 1. Point d'entrée unique — `spe`
**spe-api** (gateway + service registry) : seul point d'entrée requêtes externes. Aucun service backend exposé direct. Termine TLS, auth (JWT), load-balance round-robin entre instances saines, ségrégation routes par convention `/api/<serviceCode>` dérivée env, heartbeat + éviction. Routes 100% dynamiques.

### 2. Services fondamentaux — `pno`, `platform`
- **pno-api** (`pno`) : source vérité identité & organisation. Users, rôles, project spaces. Tous contrôles accès s'appuient sur pno via HTTP (cache Caffeine côté consommateur).
- **platform-api** (`platform`) : agrégateur page Settings + admin Vault. Évite que frontend parle à N services.

### 3. Services métier — `psa`, `psm` (pattern config ↔ données)
- **psm-admin** (`psa`) : gestion config centrale. CRUD métamodèle. Publie snapshots config via `/internal/config/snapshot` (pull) + NATS `env.service.psa.CONFIG_CHANGED` (push).
- **psm-api** (`psm`, Product Structure Management) : moteur données user. Création/édition noeuds, versions, checkin/checkout, signatures, baselines, transitions. Consomme lecture seule config publiée par `psa` (cache local). Réplicable (1..N).

### Canal asynchrone — `ws`
- **ws-gateway** (`ws`) : push unidirectionnel NATS → WebSocket vers frontend. Scopé par session. Upgrade `/api/ws?token=<session>`.

---

## Stack technique

| Composant | Choix | Raison |
|-----------|-------|--------|
| Backend | Spring Boot 3.2 + Java 21 | Standard entreprise |
| Persistence | JOOQ (SQL typé, plain SQL) | Modèle relationnel complexe, pas adapté à JPA |
| DB dev | H2 in-memory (mode PostgreSQL) | Zéro config, tests rapides |
| DB prod | PostgreSQL 16, schémas par service | Robustesse, switch trivial |
| Migrations | Flyway | Versioning schéma reproductible |
| Frontend | React 18 + nginx | SPA simple |
| Temps réel | WebSocket STOMP | Notifs lock/état seulement |
| Packaging | Docker Compose | dev + prod en un seul fichier |
| Modulith psm-api | Spring Modulith 1.4.x | Frontières domaine vérifiées au build |

---

## Architecture inter-services

```
Browser
  │
  └─► nginx (port 3000)
        └── /api/spe/auth          ──► spe-api (port 8082) — login, JWT
            /api/psm/*             ──► spe-api ─── svc://psm      ─┬─► psm-api-1:8080
                                                                   └─► psm-api-2:8080
            /api/pno/*             ──► spe-api ─── svc://pno      ──► pno-api:8081
            /api/psa/*             ──► spe-api ─── svc://psa      ──► psm-admin:8083
            /api/platform/*        ──► spe-api ─── svc://platform ──► platform-api:8084
            /api/ws                ──► spe-api ─── svc://ws       ──► ws-gateway:8085  (WebSocket)
            /actuator/             ──► spe-api

Tous les flux externes passent par spe-api. Aucun service backend n'est exposé directement
au client. La ségrégation de routes se fait par convention `/api/<serviceCode>` dérivée
de la config du service (pas de config gateway statique).
```

| Couche            | serviceCode | URL segment     | Module       | Port |
|-------------------|-------------|-----------------|--------------|------|
| Entrée            | —           | `/api/spe`      | spe-api      | 8082 |
| Fondamental       | `pno`       | `/api/pno`      | pno-api      | 8081 |
| Fondamental       | `platform`  | `/api/platform` | platform-api | 8084 |
| Métier — config   | `psa`       | `/api/psa`      | psm-admin    | 8083 |
| Métier — données  | `psm`       | `/api/psm`      | psm-api      | 8080 |
| Push              | `ws`        | `/api/ws`       | ws-gateway   | 8085 |

---

## Convention de routage (cross-cutting)

`serviceCode` = **seule source vérité** URL. Préfixe `/api/<serviceCode>` appliqué auto par `platform-lib` via Spring `server.servlet.context-path`. Controllers déclarent que route relative — **jamais** `/api/<service>` en dur. Garde-fou au démarrage échoue le boot si régression.

```properties
# application.properties
spe.registration.service-code=psm    # seule ligne de routage
```

```java
@RequestMapping("/nodes")            # URL finale : /api/psm/nodes
```

**Endpoints `/internal/*`** : routes service-à-service (auth via `X-Service-Secret`). Context-path s'applique aussi → URL réelle = `/api/<code>/internal/...`.

**Actuator** : suit context-path → `/api/<serviceCode>/actuator/health` (pas `/actuator/health` racine).

Détails complets : voir [platform-lib/CLAUDE.md](platform-lib/CLAUDE.md).

---

## Démarrage rapide

```bash
# Dev (H2 in-memory)
docker compose up --build
# → Frontend : http://localhost:3000
# → PSM API  : http://localhost:8080/api/psm
# → PNO API  : http://localhost:8081/api/pno

# Prod (PostgreSQL)
cp .env.example .env   # éditer PG_PASSWORD
docker compose --profile prod up --build

# Tests PSM — MUST run inside the Docker container (host has no javac)
docker exec plm-backend mvn test -f /app/pom.xml

# Tests PNO
docker exec pno-api mvn test -f /app/pom.xml
```

> **Important:** Never run `mvn` directly on the host. The host only ships a JRE (no compiler).
> The full JDK lives inside the containers. Always use `docker exec`.

`./run.sh local` build + run native (install platform-lib via `./psm-api/mvnw -f platform-lib/pom.xml install`).

---

## Points d'attention techniques cross-cutting

### HTTP clients : tracing obligatoire
**Règle : jamais `new RestTemplate()` ni `new WebClient()` direct.** Micrometer Tracing (bridge OTel) instrumente seulement clients construits via `RestTemplateBuilder` / `WebClient.Builder`. Sans builder → aucun span émis, aucun header `traceparent` propagé. Voir [platform-lib/CLAUDE.md](platform-lib/CLAUDE.md) pour pattern correct + `ServiceClient` registry-aware.

### Podman vs Docker
Projet tourne sous **Podman**, pas Docker. `127.0.0.11` (DNS Docker) n'existe pas. nginx `proxy_pass` simple sans `resolver`. Ordre démarrage via `depends_on: condition: service_healthy`.

### H2 vs PostgreSQL
H2 mode PostgreSQL pour tests + dev local. Noms contraintes FK `{table}_{col}_fkey` (compatible H2 2.x + PostgreSQL). `DROP CONSTRAINT IF EXISTS` sécurisés sur deux bases.

### JOOQ sans code generation
JOOQ en mode "plain SQL" (sans génération). Intentionnel pour démarrer vite. Prochaine étape : activer génération depuis schéma Flyway.

### Séparation responsabilités PSM / PNO
- **psm-api** ne gère plus users/rôles/espaces. Conserve seulement `id` (VARCHAR) comme références non-contraintes.
- **pno-api** = source vérité identité + organisation.
- `RoleController` dans psm-api gère seulement permissions PSM locales (node_type_permission, transition_permission, attribute_view) — pas rôles eux-mêmes.

---

## Backlog

### Priorité haute
- [ ] **Pagination** sur listes noeuds (`GET /api/psm/nodes?page=&size=&type=`)
- [ ] **Recherche** par attribut (`GET /api/psm/nodes/search?q=...`)
- [ ] **Audit trail endpoint** (`GET /api/psm/nodes/{id}/versions` — toutes versions techniques)
- [ ] **Tests PlmRoleAndViewTest** : vérifier `PlmSecurityContext.get()` fonctionne en contexte test sans filtre HTTP

### Priorité moyenne
- [ ] **Gestion liens dans frontend** : créer lien entre deux noeuds existants
- [ ] **Vue admin métamodèle** : interface pour créer NodeType / Lifecycle / AttributeDefinition sans API
- [ ] **Comparaison baselines** dans frontend
- [ ] **Export baseline** en JSON ou CSV
- [ ] **Expiration lock avec notif** : `LockService` nettoie locks expirés mais n'envoie pas encore notif WebSocket `LOCK_EXPIRING`

### Priorité basse
- [ ] **Remplacer PlmAuthFilter par JWT/OAuth2** (Spring Security + Keycloak)
- [x] **Plugin system pour guards** : guards + handlers sont algorithm beans pluggables via `@AlgorithmBean`
- [ ] **Multi-tenant** : isolation par organisation
- [ ] **JOOQ code generation** : générer classes JOOQ depuis schéma Flyway

---

## Comment reprendre avec Claude

> "Je reprends le projet PLM Core. Voici le CLAUDE.md de contexte.
>  Je voudrais maintenant implémenter [la fonctionnalité X]."

Claude reprend sans ré-explication archi. Si tâche concerne service précis, fichier `<service>/CLAUDE.md` se charge auto quand Claude touche le module.
