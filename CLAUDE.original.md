# CLAUDE.md — Contexte PLM Core


## Main rules 
1. Don’t assume. Don’t hide confusion. Surface tradeoffs.

2. Minimum code that solves the problem. Nothing speculative.

3. Touch only what you must. Clean up only your own mess.

4. Define success criteria. Loop until verified.


Fichier contexte PLM Core — reprend conversation avec décisions de conception.

---

## Ce qu'on a construit

**PLM (Product Lifecycle Management) minimaliste et extensible**, architecture multi-service organisée en **trois couches de rôles** :

### 1. Point d'entrée unique — `spe`
- **spe-api** (gateway + service registry) : **seul point d'entrée** des requêtes externes. Aucun service backend n'est exposé directement. Masque la topologie interne au client (frontend, intégrations).
- Responsabilités : terminaison TLS (via nginx amont), authentification (login, JWT mint + verify), **load-balancing** round-robin entre instances saines d'un même `serviceCode`, **ségrégation de routes** par convention `/api/<serviceCode>` dérivée de l'environnement (pas de config de routes en dur côté gateway), heartbeat + éviction des instances mortes, snapshot du registry pour les clients.
- Les routes sont 100% dynamiques : un service apparaît dans le registry → sa route est construite automatiquement à partir de son `serviceCode`.

### 2. Services fondamentaux — `pno`, `settings`
Services d'infrastructure transverse, consommés par tous les autres. Enregistrés dans spe comme n'importe quel service métier.

- **pno-api** (`pno`) : **source de vérité identité & organisation**. Utilisateurs, rôles, project spaces, hiérarchie de spaces, service tags par space. Tous les contrôles d'accès (JWT mint dans spe, résolution du contexte utilisateur dans psm) s'appuient sur pno via HTTP (cache Caffeine côté consommateur).
- **platform-api** (`platform`) : **service plateforme central** — agrégateur de la page Settings du frontend + administration Vault (secrets). Agrège les sections de paramètres publiées par tous les services au démarrage (via `SettingsRegistrationClient` de platform-lib), valide les permissions GLOBAL directement, renvoie un arbre groupé. Évite que le frontend parle à N services pour construire la page.

### 3. Services métier — `psa`, `psm`
Les services qui apportent la valeur fonctionnelle PLM. Suivent un pattern **configuration ↔ données** :

- **psm-admin** (`psa`) : **gestion de configuration centrale**. CRUD du métamodèle — node types, lifecycles, transitions, attributs, algorithmes, domaines, enums, policies d'autorisation. Publie des snapshots de config via `/internal/config/snapshot` (pull) + notifications NATS `env.service.psa.CONFIG_CHANGED` (push). Écritures purement administratives — pas de runtime utilisateur.
- **psm-api** (`psm`, Product Structure Management) : **moteur de données utilisateur**. Exécute les opérations métier quotidiennes — création/édition de noeuds, versions, checkin/checkout, signatures, baselines, exécution d'actions/transitions. Consomme en lecture seule la config publiée par `psa` (cache local) ; ne stocke jamais de config admin localement. Réplicable (1..N instances par project space).

### Canal asynchrone — `ws`
- **ws-gateway** (`ws`) : **push unidirectionnel** NATS → WebSocket vers le frontend. Scopé par session authentifiée. Pas d'API REST métier, juste l'upgrade `/api/ws?token=<session>`.

Objectif : base solide avant ajout fonctionnalités métier.

### Modules Maven

| Module | Couche | serviceCode | Rôle |
|--------|--------|-------------|------|
| **platform-lib** | — | — | Librairie partagée : client d'auto-enregistrement SPE, post-processor de context-path, DTO `RegisterRequest`, clients `ConfigRegistrationClient` / `SettingsRegistrationClient`. Toute nouvelle fonction cross-service va ici. |
| **spe-api** | Entrée | — (gateway) | Point d'entrée unique, routing, LB, auth |
| **pno-api** | Fondamental | `pno` | Identité & organisation (users, roles, project spaces) |
| **platform-api** | Fondamental | `platform` | Agrégateur Settings + Vault admin |
| **psm-admin** | Métier — config | `psa` | Administration centrale du métamodèle |
| **psm-api** | Métier — données | `psm` | Moteur runtime des données utilisateur PLM |
| **ws-gateway** | Canal push | `ws` | WebSocket NATS → frontend |

`platform-lib` se construit comme un JAR Maven standalone (pas d'aggregator pom). Les Dockerfiles de service ajoutent une stage 0 `lib-builder` qui compile et installe `platform-lib` via l'`additional_contexts: platform-lib: ./platform-lib` de docker-compose, puis la stage 1 le résout depuis le cache BuildKit partagé (`--mount=type=cache,id=plm-m2`). `run.sh local` fait l'install natif via `./psm-api/mvnw -f platform-lib/pom.xml install` au démarrage.

### Vault (démo, pas production)

HashiCorp Vault est intégré pour stocker les secrets runtime (`plm.service.secret`, `spring.datasource.password`, `plm.jwt.*`). Conteneur `vault:1.17` + one-shot `vault-bootstrap` qui initialise/déscelle/seed. Services résolvent via Spring Cloud Vault (`spring.config.import=optional:vault://`). Token service statique `plm-demo-services` (policy RW sur `secret/data/plm/*`). UI d'administration : **Settings → Platform → Secrets** (permission `MANAGE_SECRETS`, CRUD complet). Données persistées via volumes `plm-vault-file` + `plm-vault-init`.

**DÉMO SEULEMENT.** Unseal key + root token stockés en clair sur le volume `plm-vault-init`. Pas de TLS, pas d'audit device, pas de rotation. Pour production : remplacer par vault-agent sidecars + AppRole + TLS + auto-unseal KMS. Voir `vault/bootstrap.sh` pour le détail du flux init.

Pour consommer `platform-lib` dans un nouveau service : voir la section **« Créer un nouveau service avec `platform-lib` »** plus bas pour le guide complet (auto-configurations, beans à fournir, checklist Dockerfile/compose, conventions de routage). Référence vivante : le module `dst/`.

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

spe-api : ServiceRegistry (pool par serviceCode) + SvcLoadBalancerFilter
          (round-robin entre instances saines) + HeartbeatScheduler
          (éviction instance par instance au seuil d'échecs)

psm-api (chaque instance)
  └── JwtAuthFilter → PnoProjectSpaceClient ──► GET /api/pno/project-spaces/{id}/descendants
                      (Caffeine 60s)

psm-api ──► psm-admin : GET /api/psa/internal/config/snapshot (bootstrap)
         └── subscribe NATS env.service.psa.CONFIG_CHANGED (refresh)
```

**Convention de routage :** le `serviceCode` est la **seule source de vérité** de l'URL. Le préfixe `/api/<serviceCode>` est appliqué automatiquement par `platform-lib` via Spring `server.servlet.context-path`. Les controllers déclarent uniquement la route relative — **jamais** de `/api/<service>` en dur.

```
# application.properties
spe.registration.service-code=psm    # seule ligne de routage
# (plus de route-prefix, plus de context-path, plus de /api/... dans les controllers)

# Controller
@RequestMapping("/nodes")            # URL finale : /api/psm/nodes
```

`SpeContextPathPostProcessor` (platform-lib) lit `spe.registration.service-code` au bootstrap et injecte `server.servlet.context-path=/api/<code>` dans l'environnement avant démarrage du servlet container. `SpeRegistrationProperties` dérive `routePrefix=/api/<code>/**` et le publie à spe-api. Le gateway forward le path verbatim (pas de rewrite).

Un **garde-fou** au démarrage (`SpeRegistrationClient.assertControllerPathsNotHardcoded`) échoue le boot si un `@RequestMapping` commence par `/api/...` — détecte les régressions immédiatement.

Table des `serviceCode` actuels, regroupés par couche :

| Couche            | serviceCode | URL segment     | Module       | Port | Notes                                      |
|-------------------|-------------|-----------------|--------------|------|--------------------------------------------|
| Entrée            | —           | `/api/spe`      | spe-api      | 8082 | Gateway, ne s'enregistre pas dans le registry |
| Fondamental       | `pno`       | `/api/pno`      | pno-api      | 8081 | Identité & organisation                    |
| Fondamental       | `platform`  | `/api/platform` | platform-api | 8084 | Agrégateur Settings + Vault admin          |
| Métier — config   | `psa`       | `/api/psa`      | psm-admin    | 8083 | Métamodèle central                         |
| Métier — données  | `psm`       | `/api/psm`      | psm-api      | 8080 | PSM runtime, réplicable (1..N)             |
| Push              | `ws`        | `/api/ws`       | ws-gateway   | 8085 | WebSocket (auth via `?token=`)             |

**Opt-out** : un service peut déclarer explicitement `spe.registration.route-prefix=...` pour court-circuiter la convention — le post-processor et le garde-fou sont alors désactivés.

**Endpoints `/internal/*`** : routes service-à-service (ex: `/internal/config/snapshot` sur psa, `/internal/settings/register` sur settings). Le context-path s'applique aussi, donc l'URL réelle est `/api/psa/internal/config/snapshot`. Les clients dans platform-lib (`ConfigRegistrationClient`, `SettingsRegistrationClient`) incluent ce préfixe en dur — un seul endroit à modifier si le code admin change.

**Actuator** : suit le context-path également. Healthcheck Docker et heartbeat spe-api ciblent donc `/api/<serviceCode>/actuator/health` (pas `/actuator/health` à la racine).

**Auth inter-services :** `PlmAuthFilter` (JwtAuthFilter dans psm-api) n'accède plus à la base. Appelle `pno-api` via HTTP (cache Caffeine 30 s, 500 entrées). Endpoint `/api/pno/users/{id}/context` exempt d'auth dans `PnoAuthFilter` (appelé avant établissement du contexte utilisateur). Les filtres d'auth strippent le context-path avant de matcher les `public-paths` / `/internal/*`.

### Registry multi-instances & load-balancing (spe-api)

Chaque `serviceCode` gère un **pool d'instances**. Un service peut avoir 1..N instances enregistrées simultanément (réplicas). Le gateway route en **round-robin** entre les instances saines.

- `ServiceRegistry` : `Map<serviceCode, Map<instanceId, ServiceRegistration>>` + `AtomicInteger` par service pour le compteur RR.
- `instanceId` = SHA-1(baseUrl) tronqué à 10 hex chars → **déterministe**, donc un pod qui se ré-enregistre remplace son entrée au lieu d'en créer une nouvelle.
- **Route dynamique** : une seule route par `serviceCode`, URI `svc://<code>`. `SvcLoadBalancerFilter` (GlobalFilter, ordre 10150, avant `NettyRoutingFilter`) résout le scheme `svc` en pickant un instance round-robin et réécrit `GATEWAY_REQUEST_URL_ATTR` par requête.
- **Refresh routes** : uniquement à l'apparition/disparition d'un `serviceCode` (premier/dernier instance). Le churn d'instance ne recompute pas les routes.
- **Heartbeat** : `HeartbeatScheduler` ping chaque instance individuellement. `failure-threshold` (défaut 3) → eviction **au niveau instance**, pas du service entier. Quand la dernière instance d'un service disparaît, le `serviceCode` lui-même disparaît du registry.
- **Endpoints** :
  - `POST /api/spe/registry` — enregistre un instance (la réponse contient `instanceId` que le client doit mémoriser)
  - `DELETE /api/spe/registry/{serviceCode}/instances/{instanceId}` — désenregistre un instance (appelé en `@PreDestroy` par le client)
  - `DELETE /api/spe/registry/{serviceCode}` — purge tout le pool (admin)
  - `GET /api/spe/registry` / `/grouped` / `/{code}/instances`
- **Status public** (`GET /api/spe/status`) : remonte `instanceCount`, `healthyInstances`, et tableau `instances[]` avec id/version/healthy/age/failures par instance. Le chip frontend affiche `X/Y svc · X/Y inst`.
- **Client side** (`SpeRegistrationClient` dans psm/pno) : parse `instanceId` retourné par POST, l'utilise pour le DELETE en shutdown. Valeur de `SPE_SELF_BASE_URL` doit être **unique par instance** (sinon même `instanceId` → écrasement mutuel).
- **docker-compose** : pour scaler psm-api, répliquer le service (`psm-api-1`, `psm-api-2`) avec des `SPE_SELF_BASE_URL` distincts. Tous les réplicas partagent la même base Postgres (schéma `psm`).

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
- `Release` → même révision, itération tronquée à 0 (A.3 → A), collapse historique itérations
- `Revise` (Released → In Work) → nouvelle révision + itération reset (A → B.1)

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

**Aucun cycle.** `action` ne dépend pas de `node`. Les wrappers (TransactionWrapper, LockWrapper) vivent dans `node` et sont découverts par `AlgorithmRegistry` comme beans d'algorithme. `PolicyPort` (interface dans `shared`) rompt le couplage.

### Modules

| Module | Package | Rôle |
|--------|---------|------|
| **shared** | `com.plm.shared` (OPEN) | Cross-cutting : security, PlmPermission/PlmAction/PermissionScope annotations, PolicyPort, PermissionCatalogPort, ActionHandler interface, events, metadata, model, hooks, guard types, config, exceptions |
| **node** | `com.plm.node` | Domaine principal : noeuds, versions, liens, lifecycle, metamodel, transactions, baselines, signatures, guard impls, action handlers, wrappers |
| **action** | `com.plm.action` | ActionDispatcher, ActionService, PlmActionAspect(@Order 2), PlmActionValidator, ActionGuardService |
| **algorithm** | `com.plm.algorithm` | AlgorithmRegistry, types, discovery, exécution |
| **permission** | `com.plm.permission` | PermissionRegistry (implements PermissionCatalogPort), PolicyService (implements PolicyPort), PlmPermissionAspect(@Order 1), PlmPermissionValidator, ViewService, PermissionAdminService, RoleController |
| **dashboard** | `com.plm.dashboard` | Agrégations dashboard |

### Structure psm-api (com.plm)

```
com.plm/
├── PlmApplication.java
│
├── shared/                          # @ApplicationModule(type = OPEN)
│   ├── security/                    # SecurityContextPort, PlmUserContext, PlmAuthFilter, PnoApiClient
│   ├── authorization/               # PlmPermission, PermissionScope, PermissionCatalogPort, PolicyPort
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
│   ├── NodeController.java          # @RequestMapping("/nodes") → /api/psm/nodes
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
│   ├── ActionWrapper.java           # @AlgorithmType interface — middleware pipeline
│   ├── PlmActionAspect.java         # @Order(2) — @PlmAction auto-resolve perms + guards
│   ├── PlmActionValidator.java      # Startup: validate @PlmAction codes (dispatchable)
│   ├── guard/                       # ActionGuardService, ActionGuard, ActionGuardContext
│   └── internal/                    # ActionDispatcher, ActionParameterValidator
│
├── algorithm/                       # @ApplicationModule(allowedDependencies = {shared})
│   ├── AlgorithmRegistry.java       # API publique + getInstance() lazy accessor
│   ├── AlgorithmBean.java, AlgorithmParam.java, AlgorithmType.java
│   ├── AlgorithmController.java     # @RequestMapping("/algorithms") → /api/psm/algorithms
│   └── internal/                    # AlgorithmService, AlgorithmStartupValidator
│
├── permission/                      # @ApplicationModule(allowedDependencies = {shared})
│   ├── PermissionRegistry.java      # API publique, implements PermissionCatalogPort (DB-loaded cache)
│   ├── ViewService.java             # API publique
│   ├── RoleController.java          # @RequestMapping("/admin") → /api/psm/admin
│   └── internal/                    # PolicyService (implements PolicyPort), PlmPermissionAspect (@Order 1),
│                                    # PlmPermissionValidator, PermissionAdminService
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
            │           │
            │           └─ service.method()  → @PlmPermission (@Order 1) : permission check
            │                                → @PlmAction    (@Order 2) : auto-resolve perms
            │                                                              + guard evaluation
            │
            └─ ActionResult returned
```

**Permission séparée de l'action :**
- `permission` : table dédiée, source de vérité pour les codes permission, scope, displayName. Indépendante de la table `action`.
- `@PlmPermission` : annotation dans shared.authorization (pas de scope — scope vient de la table `permission`), aspect dans permission module (@Order 1). Vérifie permissions via `authorization_policy`.
- `@PlmAction` : aspect dans action (@Order 2). Auto-résout les permissions requises depuis `action_required_permission` table, scope via `PermissionCatalogPort`, puis évalue les guards.
- `PermissionRegistry` : cache in-memory de la table `permission`, implémente `PermissionCatalogPort` (shared). Chargé au startup.
- `action_required_permission` : table N:M reliant action → permission_code(s). FK vers `permission`. Ex: ABORT requiert UPDATE_NODE.
- `authorization_policy` : table de grants role × permission_code × nodeType × transition. FK vers `permission`.

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
- **PolicyPort** : interface dans shared, implémentation dans permission module. Node et action dépendent du port.
- **PermissionCatalogPort** : interface dans shared, implémenté par `PermissionRegistry` (permission module). Action module utilise pour lookup scope.
- **AlgorithmRegistry.getInstance(appCtx)** : accesseur lazy pour éviter les cycles de dépendance. Utilisé par guard/state services au lieu d'injection constructeur.
- **@PlmPermission** : annotation dans shared.authorization (scope résolu depuis table `permission`, pas dans l'annotation), aspect dans permission module (@Order 1). Pour méthodes pure-permission (READ_NODE, MANAGE_*).
- **@PlmAction** : annotation dans shared.action, aspect dans action module (@Order 2). Pour actions dispatchables (CHECKOUT, TRANSITION, etc.). Auto-résout permissions via `action_required_permission`.
- **`managed_with`** : déprécié, remplacé par `action_required_permission` (ex: ABORT → CHECKIN)
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

## API PSM (psm-api, port 8080, serviceCode `psm`)

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

# Admin PSM (permissions, vues) — permissions/views locales au service psm
PUT    /api/psm/admin/roles/{roleId}/nodetypes/{nodeTypeId}/permissions
POST   /api/psm/admin/nodetypes/{nodeTypeId}/views
```

## API PSA (psm-admin, port 8083) — métamodèle, algorithmes, domains

```
GET    /api/psa/metamodel/nodetypes
GET    /api/psa/metamodel/lifecycles
POST   /api/psa/permissions
GET    /api/psa/roles/{roleId}/policies
GET    /api/psa/enums
GET    /api/psa/algorithms/types
GET    /api/psa/domains

# Endpoints internes (X-Service-Secret)
GET    /api/psa/internal/config/snapshot
```

## API Platform (platform-api, port 8084)

```
GET    /api/platform/sections           ← agrégateur pour la page Settings du frontend
GET    /api/platform/admin/secrets      ← administration Vault (MANAGE_SECRETS)

# Endpoints internes
POST   /api/platform/internal/settings/register
DELETE /api/platform/internal/settings/register/{serviceCode}/instances/{instanceId}
```

## WebSocket (ws-gateway, port 8085)

```
WS     /api/ws?token=<session-token>    ← push events scoped à l'utilisateur authentifié
```

## API PNO (pno-api, port 8081, serviceCode `pno`)

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

### HTTP clients : tracing obligatoire
**Règle : jamais `new RestTemplate()` ni `new WebClient()` direct.**

Micrometer Tracing (bridge OTel) instrumente seulement les clients construits via `RestTemplateBuilder` / `WebClient.Builder` — Spring Boot y applique `ObservationRestTemplateCustomizer`. Un `new RestTemplate()` manuel échappe au customizer : aucun span émis, aucun header `traceparent` propagé, lien inter-service absent dans Jaeger.

Pattern correct :
```java
@Component
public class MyClient {
    private final RestTemplate rest;
    public MyClient(RestTemplateBuilder builder) {
        this.rest = builder.build();
    }
}
```

S'applique à tout appel HTTP sortant : psm-api → pno-api, psm-api → spe-api, pno-api → spe-api, etc.

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
- **psm-api** ne gère plus utilisateurs, rôles ni espaces projet. Conserve uniquement `id` (VARCHAR) comme références non-contraintes.
- **pno-api** = source de vérité pour identité et organisation.
- `RoleController` dans psm-api gère uniquement permissions PSM (node_type_permission, transition_permission, attribute_view) — pas les rôles eux-mêmes.

### Créer un nouveau service avec `platform-lib`

`platform-lib` est l'unique point d'entrée pour intégrer un service au PLM Core. Ses auto-configurations Spring Boot (déclarées dans `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`) câblent automatiquement les sidecars suivants :

| Auto-config | Trigger | Effet |
|---|---|---|
| `SpeRegistrationAutoConfiguration` | `spe.registration.service-code` défini (`enabled=true` par défaut) | Auto-enregistrement à spe-api + heartbeat + `LocalServiceRegistry` (cache des autres services) |
| `ServiceClientAutoConfiguration` | `LocalServiceRegistry` présent | Bean `ServiceClient` registry-aware avec Resilience4j retry/circuit-breaker pour les appels S2S |
| `PlmAuthAutoConfiguration` | `plm.auth.service-secret` défini | `PlmAuthFilter` monté ; vérifie JWT (utilisateur final) ou `X-Service-Secret` (S2S) ; appelle votre `PlmAuthContextBinder` pour peupler le ThreadLocal local |
| `PlatformAuthzAutoConfiguration` | `plm.permission.enabled=true` + beans `AuthzContextProvider` + `PermissionCatalogPort` | Enforcer Casbin + `@PlmPermission` aspect ; snapshot des grants pulled de pno-api au boot, refreshed via NATS `global.AUTHORIZATION_CHANGED` |
| `PermissionScopeRegistrationAutoConfiguration` | `plm.permission.enabled=true` | Enregistre tous les beans `PermissionScopeContribution` à pno (`/internal/scopes/register`) ; expose `/scope-values/<scope>/<key>` pour les value sources |
| `ConfigRegistrationAutoConfiguration` | `psm.config.admin-url` défini | Pull du snapshot psm-admin + subscription NATS `env.service.psa.CONFIG_CHANGED` (réservé aux services qui consomment le métamodèle PSM) |
| `SettingsRegistrationAutoConfiguration` | `plm.settings.enabled=true` | Enregistre tous les beans `SettingSectionDto` à platform-api (`/internal/settings/register`) pour qu'ils apparaissent dans la page Settings |
| `AlgorithmRegistrationAutoConfiguration` | beans `@AlgorithmBean` présents + `psm.config.admin-url` défini | Enregistre les algorithmes locaux à psm-admin (`/internal/algorithms/register`) — pour services contribuant des handlers/guards/wrappers/resolvers |
| `NatsAutoConfiguration` | `plm.nats.enabled=true` | Connexion NATS + `NatsListenerFactory` + `AuthzChangeSubscriber` (refresh permissions on remote change) |
| `VaultAutoConfiguration` | Spring Cloud Vault sur le classpath + `spring.cloud.vault.token` | Résout `plm.service.secret`, `spring.datasource.password`, `plm.jwt.*` depuis `secret/plm` |

#### Checklist complète (référence : `dst/`)

**1. Squelette Maven**
- Créer `<service>/pom.xml` ; copier celui de `pno-api/pom.xml` (le plus minimal) et adapter `groupId`/`artifactId`.
- Dépendance unique côté plateforme : `<dependency>com.plm.platform:platform-lib:0.1.0-SNAPSHOT</dependency>`. Tous les sidecars sont apportés transitivement.
- **Runtime JJWT obligatoire** : platform-lib `JwtVerifier` utilise `io.jsonwebtoken:jjwt-api`/`jjwt-impl`/`jjwt-jackson` mais ne les expose pas en `compile` transitif. Ajouter les trois (`api` en `compile`, `impl`+`jackson` en `runtime`, version `0.12.6`) sinon `PlmAuthAutoConfiguration` crashe au boot avec `UnknownClassException: io.jsonwebtoken.impl.security.KeysBridge`.

**2. Application Spring Boot**
- `<service>/src/main/java/com/<svc>/<Svc>Application.java` : `@SpringBootApplication @EnableScheduling`.
- Ne pas utiliser `@ComponentScan(basePackages=...)` — le scan par défaut sur le package racine suffit.

**3. `application.properties` — déclarer chaque sidecar à activer** (cf `dst/src/main/resources/application.properties`) :
```properties
spring.application.name=<svc>
server.port=<port>

# Identité (réutilisée par tous les sidecars de registration)
spe.registration.service-code=<code>                   # ex: dst, psm, pno
spe.registration.self-base-url=${SPE_SELF_BASE_URL:http://<svc>:<port>}
spe.registration.spe-url=${SPE_API_URL:http://spe-api:8082}
spe.registration.service-secret=${plm.service.secret}
spe.registration.extra-paths=/v3/api-docs/**,/swagger-ui/**

# Auth filter (toujours actif)
plm.auth.service-secret=${plm.service.secret}

# @PlmPermission + DATA scope registration (si le service a des permissions)
plm.permission.enabled=true
plm.permission.pno-url=${PNO_API_URL:http://pno-api:8081}

# Settings page (si le service contribue des sections)
plm.settings.enabled=true
plm.settings.settings-url=${PLM_PLATFORM_URL:http://platform-api:8084}
plm.settings.service-code=<code>
plm.settings.self-base-url=${SPE_SELF_BASE_URL:http://localhost:<port>}
plm.settings.service-secret=${plm.service.secret:}

# Config snapshot psm-admin (UNIQUEMENT pour services métier qui consomment le métamodèle)
# psm.config.admin-url=${PSM_CONFIG_ADMIN_URL:http://psm-admin:8083}
# psm.config.service-code=${PSM_CONFIG_SERVICE_CODE:<code>-data}
# psm.config.self-base-url=${PSM_CONFIG_SELF_BASE_URL:http://localhost:<port>}

# NATS (active AuthzChangeSubscriber et autres listeners)
plm.nats.enabled=true
plm.nats.url=${NATS_URL:nats://nats:4222}
plm.nats.connection-name=<code>
```

**4. Beans applicatifs requis pour activer chaque sidecar**

| Si vous activez... | Vous DEVEZ fournir |
|---|---|
| `plm.permission.enabled=true` | (a) `PermissionCatalogPort` impl — table de lookup `permissionCode → scopeCode` ; (b) `AuthzContextProvider` impl — bridge vers votre ThreadLocal local |
| `PlmAuthFilter` (toujours) | `PlmAuthContextBinder` impl — copie `PlmPrincipal` dans votre ThreadLocal au début de chaque requête |
| Permissions à publier | un bean `PermissionScopeContribution` par scope owné |
| Settings page | un bean `SettingSectionDto` par section UI |
| Algorithmes | beans `@AlgorithmBean` + `algorithm_type` row dans psm-admin (à seeder via V2 si nouveau type) |

Référence dst pour ces 4 classes : `dst/src/main/java/com/dst/security/{DstAuthContextBinder,DstAuthzContextProvider,DstSecurityContext,DstUserContext,DstPermissionCatalog}.java` + `dst/src/main/java/com/dst/authz/DataScopeContribution.java`.

**5. Convention de routage (rappel)**
- Controllers : `@RequestMapping("/foo")` — JAMAIS `/api/<code>/foo`. Garde-fou `SpeRegistrationClient.assertControllerPathsNotHardcoded` échoue le boot sinon.
- Endpoints S2S sous `/internal/<x>` ; le filtre laisse passer avec `X-Service-Secret`.
- L'URL externe est `/api/<code>/foo` ; `SpeContextPathPostProcessor` injecte `server.servlet.context-path=/api/<code>` au démarrage.

**6. Permissions (si le service introduit un nouveau scope)**
- Bean `PermissionScopeContribution` (cf `DataScopeContribution`) : déclare le scope, ses keys (vide = role-only) et value sources.
- Seed des `permission` rows dans `pno-api` (nouvelle migration `V<n>__<scope>_permissions.sql`) ET dans `psm-admin/V2__seed_data.sql` (catalog editor).
- Grants par défaut dans la même migration pno-api (`authorization_policy` rows).
- Annoter les controllers : `@PlmPermission("<CODE>")` ou `@PlmPermission(value="<CODE>", keyExprs=@KeyExpr(name="<key>", expr="#paramName"))`.

**7. Dockerfile**
Copier `dst/Dockerfile` (3 stages : `lib-builder` → builder Maven → runtime JRE). Adapter `WORKDIR`, `COPY <svc>/...`, `EXPOSE <port>`, healthcheck `wget http://localhost:<port>/api/<code>/actuator/health`.

**8. docker-compose.yml**
- Ajouter le bloc service (cf `dst:` block) avec : Vault env, datasource, schéma Flyway dédié, health on `/api/<code>/actuator/health`, `depends_on` Vault/Postgres/Jaeger/NATS healthy.
- Volumes si stockage local (cf `plm-dst-data` pour dst).
- `SPE_EXPECTED_SERVICES` (bloc spe-api) : ajouter `<code>` pour que spe attende l'enregistrement au démarrage.

**9. `run.sh`**
Ajouter `"<svc>|<port>|<schema>||<LOGPKG>"` dans `BACKEND_SVC_ROWS` pour que `./run.sh` build/restart prenne en compte le nouveau service.

**10. Si le service appelle `/internal/<x>` d'un autre service**
Étendre le client correspondant dans platform-lib (`ConfigRegistrationClient.ADMIN_CONTEXT_PATH`, `SettingsRegistrationClient.SETTINGS_CONTEXT_PATH`) ou utiliser `ServiceClient.get(<code>, "/api/<code>/internal/...", ...)` qui prefixe automatiquement le context-path.

#### Patterns à NE PAS répliquer
- `new RestTemplate()` ou `new WebClient()` direct → utiliser `ServiceClient` (registry-aware + Resilience4j + tracing).
- Lookup direct en DB sur `pno_user`/`pno_role`/etc → utiliser les endpoints HTTP de pno (cachés via Caffeine).
- Filtre d'auth maison → `PlmAuthFilter` est déjà branché par auto-config ; fournir uniquement le `PlmAuthContextBinder`.
- Hard-coding de `/api/<code>/...` dans un controller → casse la convention de routage et le boot échoue.

---

## Comment reprendre avec Claude

Colle ce fichier en début de conversation :

> "Je reprends le projet PLM Core. Voici le CLAUDE.md de contexte.
>  Je voudrais maintenant implémenter [la fonctionnalité X]."

Claude reprend sans ré-explication d'architecture.
