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
- **Dépendance circulaire** LockService ↔ PlmTransactionService résolue avec `@Lazy` (historique, dans node.transaction.internal)

**Visibilité des node_version :**
| tx_status   | Visible par |
|-------------|------------|
| `COMMITTED` | Tout le monde |
| `OPEN`      | Tout le monde (actions d'écriture réservées au propriétaire de la tx) |

---

## Architecture modulaire (Spring Modulith)

psm-api utilise **Spring Modulith** avec une organisation **domain-first**. Chaque module = package direct sous `com.plm`. Classes dans le package racine du module = API publique. Sous-packages = internes au module.

### Graphe de dépendances

```
shared (OPEN) ← tous les modules
algorithm     ← action, node
permission    ← node
action        → algorithm, shared (zéro dépendance sur node)
node          → algorithm, permission, shared
dashboard     → action, node, shared
```

**Aucun cycle.** `action` ne dépend pas de `node`. Les wrappers (TransactionWrapper, LockWrapper) vivent dans `node` et sont découverts par `AlgorithmRegistry` comme beans d'algorithme. `ActionPermissionPort` (interface dans `shared`) rompt le couplage.

### Modules

| Module | Package | Rôle |
|--------|---------|------|
| **shared** | `com.plm.shared` (OPEN) | Cross-cutting : security, PlmAction annotation, ActionPermissionPort, ActionHandler interface, events, metadata, model, hooks, guard types, config, exceptions |
| **node** | `com.plm.node` | Domaine principal : noeuds, versions, liens, lifecycle, metamodel, transactions, baselines, signatures, guard impls, action handlers, wrappers |
| **action** | `com.plm.action` | ActionDispatcher, ActionService, ActionPermissionService, PlmActionAspect, ActionGuardService |
| **algorithm** | `com.plm.algorithm` | AlgorithmRegistry, types, discovery, exécution |
| **permission** | `com.plm.permission` | ViewService, PermissionAdminService, RoleController |
| **dashboard** | `com.plm.dashboard` | Agrégations dashboard |

### Structure psm-api (com.plm)

```
com.plm/
├── PlmApplication.java
│
├── shared/                          # @ApplicationModule(type = OPEN)
│   ├── security/                    # SecurityContextPort, PlmUserContext, PlmAuthFilter, PnoApiClient
│   ├── authorization/               # PlmAction (annotation), ActionPermissionPort (interface)
│   ├── action/                      # ActionHandler (@AlgorithmType interface), ActionContext, ActionResult
│   ├── hook/                        # PreCommitValidator, AtCommitHook, PostCommitHook
│   ├── event/                       # PlmEventPublisher, OutboxPoller
│   ├── metadata/                    # MetadataService, Metadata, MetadataRegistry
│   ├── model/                       # Enums, ResolvedAttribute, ResolvedNodeType, numbering/
│   ├── guard/                       # GuardEffect, GuardEvaluation, GuardViolation
│   ├── exception/                   # PlmFunctionalException, GlobalExceptionHandler
│   └── config/                      # JacksonConfig, WebSocketConfig
│
├── node/                            # @ApplicationModule(allowedDependencies = {algorithm, permission, shared})
│   ├── NodeService.java             # API publique du module
│   ├── NodeController.java          # /api/psm/nodes
│   ├── transaction/
│   │   ├── TransactionController.java
│   │   └── internal/               # PlmTransactionService, LockService
│   │       └── guard/              # NotLockedGuard, LockOwnerRequiredGuard
│   ├── version/internal/            # VersionService, FingerPrintService
│   │   └── guard/                  # FingerprintUnchangedGuard
│   ├── link/internal/               # LinkService, GraphValidationService
│   ├── lifecycle/
│   │   ├── LifecycleController.java
│   │   └── internal/               # LifecycleService, StateActionService
│   │       └── guard/              # LifecycleGuardService, NotFrozenGuard, FromStateMatchGuard
│   ├── metamodel/
│   │   ├── MetaModelController.java
│   │   └── internal/               # MetaModelService, MetaModelCache, ValidationService, ActionRegistrationService
│   │       └── guard/              # AllRequiredFilledGuard
│   ├── baseline/                    # BaselineController
│   │   └── internal/               # BaselineService
│   ├── signature/internal/          # SignatureService, CommentService
│   │   └── guard/                  # HasSignatureRequirementGuard, NotAlreadySignedGuard, AllSignaturesDoneGuard
│   ├── view/internal/               # (réservé)
│   └── handler/                     # CheckoutActionHandler, TransitionActionHandler, ...
│                                    # (@AlgorithmBean, implémentent ActionHandler)
│
├── action/                          # @ApplicationModule(allowedDependencies = {algorithm, shared})
│   ├── ActionService.java           # API publique
│   ├── ActionPermissionService.java # Implémente ActionPermissionPort (shared)
│   ├── ActionWrapper.java           # @AlgorithmType interface — middleware pipeline
│   ├── PlmActionAspect.java         # AOP cross-cutting pour @PlmAction
│   ├── PlmActionValidator.java      # Startup validation
│   ├── guard/                       # ActionGuardService, ActionGuard, ActionGuardContext
│   └── internal/                    # ActionDispatcher, ActionParameterValidator
│
├── algorithm/                       # @ApplicationModule(allowedDependencies = {shared})
│   ├── AlgorithmRegistry.java       # API publique + getInstance() lazy accessor
│   ├── AlgorithmBean.java, AlgorithmParam.java, AlgorithmType.java
│   ├── AlgorithmController.java     # /api/psm/algorithms
│   └── internal/                    # AlgorithmService, AlgorithmStartupValidator
│
├── permission/                      # @ApplicationModule(allowedDependencies = {shared})
│   ├── ViewService.java             # API publique
│   ├── RoleController.java          # /api/psm/admin
│   └── internal/                    # PermissionAdminService
│
└── dashboard/                       # @ApplicationModule(allowedDependencies = {action, node, shared})
    ├── DashboardController.java
    └── internal/                    # DashboardService
```

### Système d'algorithmes unifié

Tout comportement pluggable = **algorithm bean**. Trois types d'algorithmes :

| Type | Interface | Localisation impls | Rôle |
|------|-----------|-------------------|------|
| `algtype-action-handler` | `ActionHandler` (shared) | `node.handler` | Exécute une action (CHECKOUT, TRANSITION, SIGN, …) |
| `algtype-action-wrapper` | `ActionWrapper` (action) | `node.transaction.internal` | Middleware pipeline (transaction, lock) |
| `algtype-action-guard` | `ActionGuard` (action.guard) | `node.*.guard` | Préconditions actions (NotLocked, NotFrozen, …) |
| `algtype-lifecycle-guard` | `LifecycleGuard` (node.lifecycle) | `node.*.guard` | Préconditions transitions (AllRequiredFilled, …) |
| `algtype-state-action` | `StateAction` (node.lifecycle) | `node.lifecycle.internal.stateaction` | Actions déclenchées par état |

**Annotation** : `@AlgorithmBean(code = "CHECKOUT")` — auto-découvert par `AlgorithmRegistry` au `@PostConstruct`.
**Configuration DB** : `algorithm` → `algorithm_instance` → `algorithm_instance_param_value`.
**Statistiques** : chaque appel mesuré via proxy dynamique, exposé sur `/api/psm/algorithms/stats`.

### Pipeline d'exécution d'une action

```
Request POST /nodes/{id}/actions/{code}
  │
  ├─ PlmActionAspect (@PlmAction AOP)    → permission check (ActionPermissionService)
  │                                       → action guard evaluation (ActionGuardService)
  │
  └─ ActionDispatcher.dispatch()
       │
       ├─ Resolve handler via AlgorithmRegistry (code → ActionHandler)
       ├─ Resolve wrappers via action_wrapper table (ordered algorithm instances)
       ├─ Build chain: Wrapper₁ → Wrapper₂ → … → Handler
       │
       └─ chain.proceed(context, params)
            │
            ├─ LockWrapper.wrap()         → tryLock/unlock (si configuré)
            │   └─ TransactionWrapper.wrap() → open/commit/rollback tx
            │       └─ handler.execute()     → logique métier
            │
            └─ ActionResult returned
```

**Wrappers configurés par action** via table `action_wrapper` :
- `ISOLATED` actions (TRANSITION, SIGN) : LockWrapper(order=10) → TransactionWrapper(ISOLATED, order=20)
- `AUTO_OPEN` actions (CHECKOUT, CREATE_LINK) : TransactionWrapper(AUTO_OPEN, order=10)
- `REQUIRED` actions (UPDATE_NODE, COMMIT) : TransactionWrapper(REQUIRED, order=10)
- `NONE` actions (READ, BASELINE) : pas de wrapper explicite (défaut = TransactionWrapper NONE)

`tx_mode` n'est plus une colonne de la table `action` — c'est un paramètre d'instance d'algorithme sur le TransactionWrapper.

### Règles de modularité

- **Classes dans le package racine** du module = API publique, injectable par d'autres modules
- **Classes dans `internal/`** = privées au module, invisibles de l'extérieur
- **shared est OPEN** : tout module peut en dépendre sans déclaration explicite
- **Action handlers** : `@AlgorithmBean` dans `node.handler`, implémentent `ActionHandler` (shared), découverts par `AlgorithmRegistry`
- **Guard impls** : distribués dans le sous-module de leur contexte métier (lock guards dans `node.transaction`, state guards dans `node.lifecycle`, etc.)
- **ActionPermissionPort** : interface dans shared, implémentation dans action. Node dépend du port, pas d'action.
- **AlgorithmRegistry.getInstance(appCtx)** : accesseur lazy pour éviter les cycles de dépendance. Utilisé par guard/state services au lieu d'injection constructeur.
- **@PlmAction** : annotation dans shared.authorization, aspect AOP dans action
- **ModularArchitectureTest** : `ApplicationModules.of(PlmApplication.class).verify()` — vérifie les frontières à chaque build

### pno-api (inchangé)

```
pno-api/
├── src/main/java/com/pno/
│   ├── PnoApplication.java
│   ├── api/controller/              # UserController, RoleController, ProjectSpaceController
│   ├── domain/service/              # UserService, RoleService, ProjectSpaceService
│   └── infrastructure/security/     # PnoAuthFilter, PnoUserContext, PnoSecurityContext
└── src/main/resources/db/migration/ # V1__schema.sql, V2__seed_data.sql
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
- [x] **Plugin system pour guards** : guards et handlers sont des algorithm beans pluggables via `@AlgorithmBean`
- [ ] **Multi-tenant** : isolation par organisation
- [ ] **JOOQ code generation** : générer classes JOOQ depuis schéma Flyway pour SQL encore plus typé

---

## Points d'attention techniques

### Podman vs Docker
Projet tourne sous **Podman**, pas Docker. `127.0.0.11` (DNS embarqué Docker) n'existe pas.
nginx utilise `proxy_pass` simple sans directive `resolver`. Ordre démarrage garanti par `depends_on: condition: service_healthy` dans docker-compose.

### H2 vs PostgreSQL
H2 mode PostgreSQL pour tests et dev local. Noms de contraintes FK suivent `{table}_{col}_fkey` (compatible H2 2.x + PostgreSQL). `DROP CONSTRAINT IF EXISTS` sécurisés sur les deux bases.

### Spring Modulith
Architecture domain-first avec Spring Modulith 1.4.x. Frontières vérifiées par `ModularArchitectureTest`. Ajouter un nouveau service : le placer dans le bon module, respecter `allowedDependencies` dans `package-info.java`.

**Nouveau handler** : créer `@AlgorithmBean(code = "CODE")` implémentant `ActionHandler` dans `node.handler`. Ajouter entrées dans `algorithm`, `algorithm_instance`, `action`, et `action_wrapper`.

**Nouveau wrapper** : créer `@AlgorithmBean` implémentant `ActionWrapper` dans le module pertinent. Attacher via `action_wrapper` table.

**Nouveau guard** : créer `@AlgorithmBean` implémentant `ActionGuard` ou `LifecycleGuard` dans le sous-module guard approprié.

**Dépendances circulaires** : guard/state services utilisent `AlgorithmRegistry.getInstance(appCtx)` (lazy accessor) au lieu d'injection constructeur pour éviter les cycles avec les handlers.

### JOOQ sans code generation
JOOQ en mode "plain SQL" (sans génération de classes). Intentionnel pour démarrer vite. Prochaine étape : activer génération code JOOQ depuis schéma Flyway.

### PlmSecurityContext en test
Tests injectent contexte via `PlmSecurityContext.set(...)` (dans `shared.security`). En production, `PlmAuthFilter` (via `PnoApiClient`) le fait.

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