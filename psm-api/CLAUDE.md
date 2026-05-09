# psm-api — PSM runtime (data engine)

`serviceCode` = `psm` · port 8080 · URL prefix `/api/psm` · Java 21 + Spring Boot 3.2 + Spring Modulith 1.4.x.

Moteur données user PLM. Exécute opérations métier : noeuds, versions, checkin/checkout, signatures, baselines, transitions. Consomme config publiée par `psa` (cache local).

---

## Concepts clés

### Mécanisme transactionnel central
- **Checkin** = lock pessimiste exclusif → fail-fast si conflit
- **Checkout** = libère lock, crée nouvelle version
- TOUT passe par ce mécanisme : modifs contenu, lifecycle, signatures, cascades

### Double identité versions
- **Version technique** : `version_number` auto-incrémenté (traçabilité totale)
- **Identité métier** : `revision.iteration` visible user (ex: `B.3`)

Règles numérotation :
- `CONTENT` → itération +1 (A.1 → A.2)
- `LIFECYCLE` ou `SIGNATURE` → même révision.itération
- `Release` → même révision, itération tronquée à 0 (A.3 → A), collapse historique
- `Revise` (Released → In Work) → nouvelle révision + itération reset (A → B.1)

### Liens typés
- `VERSION_TO_MASTER` → pointe version courante → lock récursif requis
- `VERSION_TO_VERSION` → pointe version figée → aucun lock (déjà immuable)
- Politique sur **lien**, pas sur noeud → reuse naturel possible

### Baseline
- Prérequis : état **Frozen** sur grappe (élimine race condition)
- Résolution **eager** liens V2M au tag → fiabilité long terme
- Liens V2V sans entrée baseline (déjà figés)

### Pipeline Server-Driven UI (ordre priorité)
```
1. AttributeStateRule (état lifecycle)  → editable / visible / required
2. AttributeView (rôle ∩ état)          → restreint seulement, JAMAIS élargit
3. NodeTypePermission can_write         → si false, tout readonly
4. TransitionPermission                 → filtre actions disponibles
```

### Règle fondamentale vues
Vue peut **restreindre** mais **jamais élargir** droits définis par état. Règle plus importante.

### Modèle transaction PLM

```
OPEN ──────► COMMITTED   (commit avec commentaire obligatoire)
  │
  └────────► ROLLEDBACK  (rollback — versions OPEN supprimées physiquement)
```

Règles clés :
- User = **une seule transaction OPEN** à la fois
- Création **auto** au premier checkin OU **explicite** (bouton "Ouvrir une transaction")
- Commit **libère tous les locks** en une opération
- Commentaire commit **obligatoire** (comme message Git)
- Rollback **supprime physiquement** versions OPEN + transaction
- Cleanup auto tx OPEN > 24h (auto-rollback)
- **Dépendance circulaire** LockService ↔ PlmTransactionService résolue avec `@Lazy` (dans `node.transaction.internal`)

Visibilité `node_version` :
| tx_status   | Visible par |
|-------------|------------|
| `COMMITTED` | Tout le monde |
| `OPEN`      | Tout le monde (actions écriture réservées au propriétaire tx) |

---

## Architecture modulaire (Spring Modulith)

Domain-first. Chaque module = package direct sous `com.plm`. Classes dans package racine = API publique. Sous-packages = internes.

### Graphe dépendances

```
shared (OPEN) ← tous les modules
algorithm     ← action, node
permission    ← node
action        → algorithm, shared (zéro dépendance sur node)
node          → algorithm, permission, shared
dashboard     → action, node, shared
```

Aucun cycle. `action` ne dépend pas de `node`. Wrappers (TransactionWrapper, LockWrapper) vivent dans `node` + découverts par `AlgorithmRegistry` comme beans algo. `PolicyPort` (interface dans `shared`) rompt couplage.

### Modules

| Module | Package | Rôle |
|--------|---------|------|
| **shared** | `com.plm.shared` (OPEN) | Cross-cutting : security, PlmPermission/PlmAction/PermissionScope annotations, PolicyPort, PermissionCatalogPort, ActionHandler interface, events, metadata, model, hooks, guard types, config, exceptions |
| **node** | `com.plm.node` | Domaine principal : noeuds, versions, liens, lifecycle, metamodel, transactions, baselines, signatures, guard impls, action handlers, wrappers |
| **action** | `com.plm.action` | ActionDispatcher, ActionService, PlmActionAspect(@Order 2), PlmActionValidator, ActionGuardService |
| **algorithm** | `com.plm.algorithm` | AlgorithmRegistry, types, discovery, exécution |
| **permission** | `com.plm.permission` | PermissionRegistry (implements PermissionCatalogPort), PolicyService (implements PolicyPort), PlmPermissionAspect(@Order 1), PlmPermissionValidator, ViewService, PermissionAdminService, RoleController |
| **dashboard** | `com.plm.dashboard` | Agrégations dashboard |

### Structure (com.plm)

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

---

## Système algos unifié

Tout comportement pluggable = **algorithm bean**. Types :

| Type | Interface | Localisation impls | Rôle |
|------|-----------|-------------------|------|
| `algtype-action-handler` | `ActionHandler` (shared) | `node.handler` | Exécute action (CHECKOUT, TRANSITION, SIGN, …) |
| `algtype-action-wrapper` | `ActionWrapper` (action) | `node.transaction.internal` | Middleware pipeline (transaction, lock) |
| `algtype-action-guard` | `ActionGuard` (action.guard) | `node.*.guard` | Préconditions actions (NotLocked, NotFrozen, …) |
| `algtype-lifecycle-guard` | `LifecycleGuard` (node.lifecycle) | `node.*.guard` | Préconditions transitions (AllRequiredFilled, …) |
| `algtype-state-action` | `StateAction` (node.lifecycle) | `node.lifecycle.internal.stateaction` | Actions déclenchées par état |

**Annotation** : `@AlgorithmBean(code = "CHECKOUT")` — auto-découvert par `AlgorithmRegistry` au `@PostConstruct`.
**Config DB** : `algorithm` → `algorithm_instance` → `algorithm_instance_param_value`.
**Stats** : chaque appel mesuré via proxy dynamique, exposé sur `/api/psm/algorithms/stats`.

### Pipeline exécution action

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

### Permission séparée action
- `permission` : table dédiée, source vérité pour codes permission, scope, displayName. Indépendante de table `action`.
- `@PlmPermission` : annotation dans shared.authorization (pas scope — scope vient de table `permission`), aspect dans permission module (@Order 1). Vérifie permissions via `authorization_policy`.
- `@PlmAction` : aspect dans action (@Order 2). Auto-résout permissions requises depuis `action_required_permission`, scope via `PermissionCatalogPort`, puis évalue guards.
- `PermissionRegistry` : cache in-memory de table `permission`, implémente `PermissionCatalogPort` (shared). Chargé au startup.
- `action_required_permission` : table N:M reliant action → permission_code(s). Référence souple — FK vers `permission` supprimée (platform-api V7) ; `permission` vit dans pno-api. Ex: ABORT requiert UPDATE_NODE.
- `authorization_policy` : table grants role × permission_code × nodeType × transition. FK vers `permission`.

### Wrappers configurés par action via table `action_wrapper`
- `ISOLATED` actions (TRANSITION, SIGN) : LockWrapper(order=10) → TransactionWrapper(ISOLATED, order=20)
- `AUTO_OPEN` actions (CHECKOUT, CREATE_LINK) : TransactionWrapper(AUTO_OPEN, order=10)
- `REQUIRED` actions (UPDATE_NODE, COMMIT) : TransactionWrapper(REQUIRED, order=10)
- `NONE` actions (READ, BASELINE) : pas wrapper explicite (défaut = TransactionWrapper NONE)

`tx_mode` n'est plus colonne de `action` — c'est paramètre instance algo sur TransactionWrapper.

### Règles modularité
- **Classes dans package racine** du module = API publique, injectable par autres modules
- **Classes dans `internal/`** = privées au module, invisibles de l'extérieur
- **shared est OPEN** : tout module peut en dépendre sans déclaration explicite
- **Action handlers** : `@AlgorithmBean` dans `node.handler`, implémentent `ActionHandler` (shared), découverts par `AlgorithmRegistry`
- **Guard impls** : distribués dans sous-module de leur contexte métier (lock guards dans `node.transaction`, state guards dans `node.lifecycle`, etc.)
- **PolicyPort** : interface dans shared, impl dans permission module. Node + action dépendent du port.
- **PermissionCatalogPort** : interface dans shared, implémenté par `PermissionRegistry` (permission). Action module utilise pour lookup scope.
- **AlgorithmRegistry.getInstance(appCtx)** : accesseur lazy pour éviter cycles. Utilisé par guard/state services au lieu d'injection constructeur.
- **@PlmPermission** : annotation dans shared.authorization, aspect dans permission module (@Order 1). Pour méthodes pure-permission (READ_NODE, MANAGE_*).
- **@PlmAction** : annotation dans shared.action, aspect dans action module (@Order 2). Pour actions dispatchables. Auto-résout permissions via `action_required_permission`.
- **`managed_with`** : déprécié, remplacé par `action_required_permission` (ex: ABORT → CHECKIN)
- **ModularArchitectureTest** : `ApplicationModules.of(PlmApplication.class).verify()` — vérifie frontières à chaque build

---

## API endpoints

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

# Admin PSM (permissions, vues) — local au service psm
PUT    /api/psm/admin/roles/{roleId}/nodetypes/{nodeTypeId}/permissions
POST   /api/psm/admin/nodetypes/{nodeTypeId}/views
```

Consomme : `psm-admin` (config snapshot via `/api/psa/internal/config/snapshot` + NATS `env.service.psa.CONFIG_CHANGED`), `pno-api` (user context, project space descendants).

---

## Tests

```bash
docker exec plm-backend mvn test -f /app/pom.xml
```

Jamais `mvn` direct sur host — JRE only. JDK dans containers.

Tests injectent contexte via `PlmSecurityContext.set(...)` (dans `shared.security`). En prod, `PlmAuthFilter` (via `PnoApiClient`) le fait.

---

## Ajouter handler / wrapper / guard

- **Handler** : `@AlgorithmBean(code = "CODE")` implémentant `ActionHandler` dans `node.handler`. Auto-enregistré à platform-api au démarrage. Pré-seeder si nécessaire : migration `platform-api/V<n>__<feature>.sql` (`algorithm`, `algorithm_instance`, `action`, `action_wrapper`, `action_guard`, `action_required_permission`).
- **Wrapper** : `@AlgorithmBean` implémentant `ActionWrapper` dans module pertinent. Attacher via `action_wrapper`.
- **Guard** : `@AlgorithmBean` implémentant `ActionGuard` ou `LifecycleGuard` dans sous-module guard approprié.
- **Cycle dépendance** : guard/state services utilisent `AlgorithmRegistry.getInstance(appCtx)` (lazy) au lieu d'injection constructeur.
