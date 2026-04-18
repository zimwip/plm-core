# CLAUDE.md — Contexte PLM Core

Fichier contexte PLM Core — reprend conversation avec décisions de conception.

---

## Ce qu'on a construit

**PLM (Product Lifecycle Management) minimaliste et extensible**, architecture multi-service :
- **plm-api** (PSM — Product Structure Management) : noeuds, versions, lifecycle, signatures, baselines, méta-modèle, permissions
- **pno-api** (PNO — People & Organisation) : utilisateurs, rôles, espaces projet

Objectif : base solide avant ajout fonctionnalités métier.

---

## Stack technique

| Composant | Choix | Raison |
|-----------|-------|--------|
| Backend PSM | Spring Boot 3.2 + Java 21 | Standard entreprise |
| Backend PNO | Spring Boot 3.2 + Java 21 | Même stack, service séparé |
| Persistence | JOOQ (SQL typé, plain SQL) | Modèle relationnel complexe, pas adapté à JPA |
| DB dev | H2 in-memory (mode PostgreSQL) | Zéro config, tests rapides |
| DB prod | PostgreSQL 16, deux schémas (`psm` + `pno`) | Robustesse, switch trivial |
| Migrations | Flyway | Versioning schéma reproductible |
| Frontend | React 18 + nginx | SPA simple, no framework lourd |
| Temps réel | WebSocket STOMP | Notifications lock/état uniquement |
| Packaging | Docker Compose | dev et prod en un seul fichier |

---

## Architecture inter-services

```
Browser
  │
  └─► nginx (port 3000)
        ├── /api/psm/  ──────────────► plm-api (port 8080)  [schéma psm]
        ├── /api/pno/  ──────────────► pno-api (port 8081)  [schéma pno]
        ├── /actuator/ ──────────────► plm-api (port 8080)
        └── /ws        ──────────────► plm-api (port 8080)

plm-api
  └── PlmAuthFilter → PnoApiClient ──► GET /api/pno/users/{id}/context
                      (Caffeine 30s)
```

**Règle d'URL :** tout nouveau controller PSM → `@RequestMapping("/api/psm/...")`, PNO → `@RequestMapping("/api/pno/...")`.

**Auth inter-services :** `PlmAuthFilter` n'accède plus à la base. Appelle `pno-api` via HTTP (cache Caffeine 30 s, 500 entrées). Endpoint `/api/pno/users/{id}/context` exempt d'auth dans `PnoAuthFilter` (appelé avant établissement du contexte utilisateur).

---

## Concepts clés (ne pas perdre de vue)

### 1. Mécanisme transactionnel central
- **Checkin** = lock pessimiste exclusif → fail-fast si conflit
- **Checkout** = libère lock, crée nouvelle version
- TOUT passe par ce mécanisme : modifications contenu, lifecycle, signatures, cascades

### 2. Double identité des versions
- **Version technique** : `version_number` auto-incrémenté (traçabilité totale)
- **Identité métier** : `revision.iteration` visible utilisateur (ex: `B.3`)

Règles de numérotation :
- `CONTENT` → itération +1 (A.1 → A.2)
- `LIFECYCLE` ou `SIGNATURE` → même révision.itération (traçabilité pure)
- Passage `Released` → nouvelle révision + itération reset (A → B.1)

### 3. Liens typés
- `VERSION_TO_MASTER` → pointe toujours version courante → lock récursif requis
- `VERSION_TO_VERSION` → pointe version figée → aucun lock (déjà immuable)
- Politique sur **lien**, pas sur noeud → reuse naturel possible

### 4. Baseline
- Prérequis : état **Frozen** sur grappe (élimine race condition)
- Résolution **eager** liens V2M au tag → fiabilité long terme
- Liens V2V sans entrée baseline (déjà figés)

### 5. Pipeline Server-Driven UI (ordre de priorité)
```
1. AttributeStateRule (état lifecycle)  → editable / visible / required
2. AttributeView (rôle ∩ état)          → restreint seulement, JAMAIS élargit
3. NodeTypePermission can_write         → si false, tout readonly
4. TransitionPermission                 → filtre les actions disponibles
```

### 6. Règle fondamentale des vues
Vue peut **restreindre** mais **jamais élargir** droits définis par état. Règle la plus importante.

### 7. Modèle de transaction PLM

```
OPEN ──────► COMMITTED   (commit avec commentaire obligatoire)
  │
  └────────► ROLLEDBACK  (rollback — versions OPEN supprimées physiquement)
```

**Règles clés :**
- Un utilisateur = **une seule transaction OPEN** à la fois
- Création **automatique** au premier checkin OU **explicite** (bouton "Ouvrir une transaction")
- Commit **libère tous les locks** en une seule opération
- Commentaire de commit **obligatoire** (comme message Git)
- Rollback **supprime physiquement** versions OPEN + transaction
- Nettoyage auto tx OPEN > 24h (auto-rollback)
- **Dépendance circulaire** LockService ↔ PlmTransactionService résolue avec `@Lazy`

**Visibilité des node_version :**
| tx_status   | Visible par |
|-------------|------------|
| `COMMITTED` | Tout le monde |
| `OPEN`      | Tout le monde (actions d'écriture réservées au propriétaire de la tx) |

---

## Structure des fichiers

```
plm-core/
├── ARCHITECTURE.md
├── README.md
├── CLAUDE.md                    ← ce fichier
├── docker-compose.yml           ← orchestration complète (postgres, plm-api, pno-api, frontend)
├── run.sh                       ← watch + rebuild automatique en dev
├── .env.example
│
├── frontend/                    ← React 18 + nginx
│   ├── Dockerfile
│   ├── nginx.conf               ← /api/psm/ → plm-api, /api/pno/ → pno-api, /ws → plm-api
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── services/api.js      ← BASE='/api/psm', BASE_PNO='/api/pno'
│       └── hooks/useWebSocket.js
│
├── plm-api/                     ← PSM — Product Structure Management (port 8080)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/plm/
│       │   │   ├── PlmApplication.java
│       │   │   ├── api/controller/
│       │   │   │   ├── NodeController.java          (/api/psm/nodes)
│       │   │   │   ├── MetaModelController.java     (/api/psm/metamodel)
│       │   │   │   ├── BaselineController.java      (/api/psm/baselines)
│       │   │   │   ├── TransactionController.java   (/api/psm/transactions)
│       │   │   │   └── RoleController.java          (/api/psm/admin — permissions PSM uniquement)
│       │   │   ├── domain/
│       │   │   │   ├── model/Enums.java
│       │   │   │   └── service/
│       │   │   │       ├── LockService.java          ← checkin/checkout/cascade
│       │   │   │       ├── VersionService.java       ← règles revision.iteration
│       │   │   │       ├── ValidationService.java    ← règles attribut×état
│       │   │   │       ├── LifecycleService.java     ← transitions, guards, actions
│       │   │   │       ├── NodeService.java          ← CRUD + payload UI
│       │   │   │       ├── SignatureService.java     ← signatures électroniques
│       │   │   │       ├── BaselineService.java      ← tag + résolution V2M
│       │   │   │       ├── MetaModelService.java     ← CRUD méta-modèle
│       │   │   │       ├── PermissionService.java    ← droits node-type, vues, overrides
│       │   │   │       ├── PlmTransactionService.java← cycle de vie tx (open/commit/rollback)
│       │   │   │       └── FingerPrintService.java
│       │   │   └── infrastructure/
│       │   │       ├── WebSocketConfig.java
│       │   │       ├── PlmEventPublisher.java
│       │   │       └── security/
│       │   │           ├── PlmUserContext.java       ← identité + rôles par requête
│       │   │           ├── PlmSecurityContext.java   ← ThreadLocal holder
│       │   │           ├── PlmProjectSpaceContext.java
│       │   │           ├── PlmAuthFilter.java        ← délègue à PnoApiClient (HTTP)
│       │   │           └── PnoApiClient.java         ← cache Caffeine 30s → pno-api
│       │   └── resources/
│       │       ├── application.properties
│       │       └── db/migration/                    ← schéma psm
│       │           ├── V1__schema.sql
│       │           ├── V2__seed_data.sql
│       │           ├── V3__link_logical_id.sql
│       │           ├── V4__cascade_child_state.sql
│       │           ├── V5__action_registry.sql
│       │           ├── V6__action_registry_v2.sql
│       │           ├── V7__update_node_action.sql
│       │           ├── V8__checkin_action.sql
│       │           ├── V9__project_space_action_permissions.sql
│       │           ├── V10__node_lock.sql
│       │           └── V11__extract_pno_tables.sql  ← supprime plm_role/plm_user/user_role/project_space
│       └── test/java/com/plm/
│           ├── PlmIntegrationTest.java
│           ├── PlmExtendedTest.java
│           ├── PlmRoleAndViewTest.java
│           └── PlmTransactionTest.java
│
└── pno-api/                     ← PNO — People & Organisation (port 8081)
    ├── Dockerfile
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/com/pno/
        │   │   ├── PnoApplication.java
        │   │   ├── api/controller/
        │   │   │   ├── UserController.java           (/api/pno/users — incl. /context)
        │   │   │   ├── RoleController.java           (/api/pno/roles)
        │   │   │   └── ProjectSpaceController.java   (/api/pno/project-spaces)
        │   │   ├── domain/service/
        │   │   │   ├── UserService.java              ← getUserContext() appelé par plm-api
        │   │   │   ├── RoleService.java
        │   │   │   └── ProjectSpaceService.java
        │   │   └── infrastructure/security/
        │   │       ├── PnoAuthFilter.java            ← bypass sur /context + /actuator
        │   │       ├── PnoUserContext.java
        │   │       └── PnoSecurityContext.java
        │   └── resources/
        │       ├── application.properties
        │       └── db/migration/                    ← schéma pno
        │           ├── V1__schema.sql               ← pno_role, pno_user, user_role, project_space
        │           └── V2__seed_data.sql            ← seed autoritatif (rôles, users, espaces)
        └── test/java/com/pno/
            └── PnoSmokeTest.java
```

---

## Utilisateurs et rôles du seed (pno-api)

| ID           | Username | Rôle     | is_admin | Notes PSM par défaut          |
|--------------|----------|----------|----------|-------------------------------|
| user-admin   | admin    | ADMIN    | oui      | bypass tous les checks        |
| user-alice   | alice    | DESIGNER | non      | can_write, pas can_sign       |
| user-bob     | bob      | REVIEWER | non      | can_sign, pas can_write       |
| user-charlie | charlie  | READER   | non      | lecture seule                 |

**Espaces projet :** `ps-default` (espace standard)

Header HTTP : `X-PLM-User: user-alice` + `X-PLM-ProjectSpace: ps-default`

---

## API PSM (plm-api, port 8080)

```
# Noeuds
GET    /api/psm/nodes
POST   /api/psm/nodes
GET    /api/psm/nodes/{id}/description
GET    /api/psm/nodes/{id}/versions
GET    /api/psm/nodes/{id}/links/children
GET    /api/psm/nodes/{id}/links/parents
GET    /api/psm/nodes/{id}/signatures
POST   /api/psm/nodes/{id}/actions/{ntaId}

# Méta-modèle
GET    /api/psm/metamodel/nodetypes
POST   /api/psm/metamodel/nodetypes
GET    /api/psm/metamodel/lifecycles
POST   /api/psm/metamodel/lifecycles
GET    /api/psm/metamodel/linktypes
POST   /api/psm/metamodel/linktypes

# Transactions
POST   /api/psm/transactions
GET    /api/psm/transactions/current
POST   /api/psm/transactions/{id}/commit
POST   /api/psm/transactions/{id}/rollback

# Baselines
GET    /api/psm/baselines
POST   /api/psm/baselines
GET    /api/psm/baselines/{id}/content

# Admin PSM (permissions, vues)
PUT    /api/psm/admin/roles/{roleId}/nodetypes/{nodeTypeId}/permissions
POST   /api/psm/admin/nodetypes/{nodeTypeId}/views
```

## API PNO (pno-api, port 8081)

```
GET    /api/pno/users
POST   /api/pno/users
GET    /api/pno/users/{id}/context?projectSpaceId=  ← appelé par plm-api (auth bypassée)
POST   /api/pno/users/{id}/roles/{roleId}
DELETE /api/pno/users/{id}/roles/{roleId}

GET    /api/pno/roles
POST   /api/pno/roles
PUT    /api/pno/roles/{id}
DELETE /api/pno/roles/{id}

GET    /api/pno/project-spaces
POST   /api/pno/project-spaces
DELETE /api/pno/project-spaces/{id}
```

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

---

## Ce qui reste à faire (backlog)

### Priorité haute
- [ ] **Pagination** sur listes de noeuds (`GET /api/psm/nodes?page=&size=&type=`)
- [ ] **Recherche** par attribut (`GET /api/psm/nodes/search?q=...`)
- [ ] **Audit trail endpoint** (`GET /api/psm/nodes/{id}/versions` — toutes versions techniques)
- [ ] **Tests PlmRoleAndViewTest** : certains tests supposent SecurityContext actif dans services — vérifier `PlmSecurityContext.get()` fonctionne en contexte test sans filtre HTTP

### Priorité moyenne
- [ ] **Gestion des liens dans frontend** : créer lien entre deux noeuds existants
- [ ] **Vue admin méta-modèle** : interface pour créer NodeType / Lifecycle / AttributeDefinition sans API
- [ ] **Comparaison de baselines** dans frontend
- [ ] **Export baseline** en JSON ou CSV
- [ ] **Expiration de lock avec notification** : `LockService` nettoie locks expirés mais n'envoie pas encore notification WebSocket `LOCK_EXPIRING`

### Priorité basse
- [ ] **Remplacer PlmAuthFilter par JWT/OAuth2** (Spring Security + Keycloak)
- [ ] **Plugin system pour guards** : SPI Java pour guards custom sans modifier `LifecycleService`
- [ ] **Multi-tenant** : isolation par organisation
- [ ] **JOOQ code generation** : générer classes JOOQ depuis schéma Flyway pour SQL encore plus typé

---

## Points d'attention techniques

### Podman vs Docker
Projet tourne sous **Podman**, pas Docker. `127.0.0.11` (DNS embarqué Docker) n'existe pas.
nginx utilise `proxy_pass` simple sans directive `resolver`. Ordre démarrage garanti par `depends_on: condition: service_healthy` dans docker-compose.

### H2 vs PostgreSQL
H2 mode PostgreSQL pour tests et dev local. Noms de contraintes FK suivent `{table}_{col}_fkey` (compatible H2 2.x + PostgreSQL). `DROP CONSTRAINT IF EXISTS` sécurisés sur les deux bases.

### JOOQ sans code generation
JOOQ en mode "plain SQL" (sans génération de classes). Intentionnel pour démarrer vite. Prochaine étape : activer génération code JOOQ depuis schéma Flyway.

### PlmSecurityContext en test
Tests injectent contexte manuellement via `PlmSecurityContext.set(...)`. En production, `PlmAuthFilter` (via `PnoApiClient`) le fait. Dualité à documenter pour futurs développeurs.

### Frontend : pas de state management global
Frontend intentionnellement simple (pas Redux/Zustand). État local à chaque composant + rechargement depuis API. Acceptable pour POC, à revoir si volume données augmente.

### Séparation des responsabilités PSM / PNO
- **plm-api** ne gère plus utilisateurs, rôles ni espaces projet. Conserve uniquement `id` (VARCHAR) comme références non-contraintes.
- **pno-api** = source de vérité pour identité et organisation.
- `RoleController` dans plm-api gère uniquement permissions PSM (node_type_permission, transition_permission, attribute_view) — pas les rôles eux-mêmes.

---

## Comment reprendre avec Claude

Colle ce fichier en début de conversation :

> "Je reprends le projet PLM Core. Voici le CLAUDE.md de contexte.
>  Je voudrais maintenant implémenter [la fonctionnalité X]."

Claude reprend sans ré-explication d'architecture.