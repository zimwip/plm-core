# CLAUDE.md — Contexte PLM Core

Ce fichier permet de reprendre la conversation avec Claude en conservant
tout le contexte de conception et les décisions prises.

---

## Ce qu'on a construit

Un **PLM (Product Lifecycle Management) minimaliste et extensible** en Spring Boot + JOOQ.
L'objectif est d'avoir une base solide et propre avant d'ajouter des fonctionnalités métier.

---

## Stack technique

| Composant | Choix | Raison |
|-----------|-------|--------|
| Backend | Spring Boot 3.2 + Java 21 | Standard entreprise |
| Persistence | JOOQ (SQL typé) | Modèle relationnel complexe, pas adapté à JPA |
| DB dev | Apache Derby in-memory | Zéro config, tests rapides |
| DB prod | PostgreSQL 16 | Robustesse, switch trivial |
| Migrations | Flyway | Versioning du schéma reproductible |
| Frontend | React 18 + nginx | SPA simple, no framework lourd |
| Temps réel | WebSocket STOMP | Notifications lock/état uniquement |
| Packaging | Docker Compose | dev et prod en un seul fichier |

---

## Concepts clés (ne pas perdre de vue)

### 1. Mécanisme transactionnel central
- **Checkin** = acquérir un lock pessimiste exclusif → fail-fast si conflit
- **Checkout** = libérer le lock en créant une nouvelle version
- TOUT passe par ce mécanisme : modifications contenu, lifecycle, signatures, cascades

### 2. Double identité des versions
- **Version technique** : `version_number` auto-incrémenté (traçabilité totale)
- **Identité métier** : `revision.iteration` visible utilisateur (ex: `B.3`)

Règles de numérotation :
- `CONTENT` → itération +1 (A.1 → A.2)
- `LIFECYCLE` ou `SIGNATURE` → même révision.itération (traçabilité pure)
- Passage `Released` → nouvelle révision + itération reset (A → B.1)

### 3. Liens typés
- `VERSION_TO_MASTER` → pointe toujours la version courante → lock récursif requis
- `VERSION_TO_VERSION` → pointe une version figée → aucun lock (déjà immuable)
- La politique est sur le **lien**, pas sur le noeud → reuse naturel possible

### 4. Baseline
- Prérequis : état **Frozen** sur la grappe (élimine la race condition)
- Résolution **eager** des liens V2M au moment du tag → fiabilité à long terme
- Les liens V2V ne nécessitent pas d'entrée baseline (déjà figés)

### 5. Pipeline Server-Driven UI (ordre de priorité)
```
1. AttributeStateRule (état lifecycle)  → editable / visible / required
2. AttributeView (rôle ∩ état)          → restreint seulement, JAMAIS élargit
3. NodeTypePermission can_write         → si false, tout readonly
4. TransitionPermission                 → filtre les actions disponibles
```

### 6. Règle fondamentale des vues
Une vue peut **restreindre** mais **jamais élargir** les droits définis par l'état.
C'est la règle la plus importante à ne pas casser.

---

## Structure des fichiers

```
plm-core/
├── ARCHITECTURE.md          ← décisions de conception complètes
├── README.md                ← guide de démarrage et API
├── CLAUDE.md                ← ce fichier
├── docker-compose.yml       ← dev (Derby) et prod (PostgreSQL)
├── Dockerfile               ← backend Spring Boot multi-stage
├── pom.xml                  ← dépendances Maven
├── .env.example             ← variables d'environnement
│
├── frontend/                ← React 18 + nginx
│   ├── Dockerfile
│   ├── nginx.conf           ← proxy /api/ et /ws vers backend
│   ├── package.json
│   └── src/
│       ├── App.js           ← application complète (composants + styles)
│       ├── index.js
│       ├── services/api.js  ← couche API REST
│       └── hooks/useWebSocket.js
│
└── src/
    ├── main/
    │   ├── java/com/plm/
    │   │   ├── PlmApplication.java
    │   │   ├── api/controller/
    │   │   │   ├── NodeController.java
    │   │   │   ├── MetaModelAndBaselineController.java
    │   │   │   └── RoleController.java
    │   │   ├── domain/
    │   │   │   ├── model/Enums.java
    │   │   │   └── service/
    │   │   │       ├── LockService.java          ← checkin/checkout/cascade
    │   │   │       ├── VersionService.java        ← règles revision.iteration
    │   │   │       ├── ValidationService.java     ← règles attribut×état
    │   │   │       ├── LifecycleService.java      ← transitions, guards, actions
    │   │   │       ├── NodeService.java           ← CRUD + payload UI
    │   │   │       ├── SignatureService.java      ← signatures électroniques
    │   │   │       ├── BaselineService.java       ← tag + résolution V2M
    │   │   │       ├── MetaModelService.java      ← CRUD méta-modèle
    │   │   │       └── PermissionService.java     ← rôles, vues, overrides
    │   │   └── infrastructure/
    │   │       ├── WebSocketConfig.java
    │   │       ├── PlmEventPublisher.java
    │   │       └── security/
    │   │           ├── PlmUserContext.java        ← identité + rôles par requête
    │   │           ├── PlmSecurityContext.java    ← ThreadLocal holder
    │   │           └── PlmAuthFilter.java         ← résolution depuis X-PLM-User
    │   └── resources/
    │       ├── application.properties
    │       └── db/migration/
    │           ├── V1__init_schema.sql    ← schéma de base
    │           ├── V2__signatures.sql     ← signatures électroniques
    │           ├── V3__roles_and_views.sql← rôles, permissions, vues
    │           └── V4__seed_data.sql      ← données initiales
    └── test/java/com/plm/
        ├── PlmIntegrationTest.java        ← tests versioning + locks
        ├── PlmExtendedTest.java           ← tests signatures + baselines
        └── PlmRoleAndViewTest.java        ← tests rôles + vues
```

---

## Utilisateurs et rôles du seed

| ID           | Username | Rôle     | can_write | can_sign | can_baseline |
|--------------|----------|----------|-----------|----------|--------------|
| user-admin   | admin    | ADMIN    | tout      | oui      | oui          |
| user-alice   | alice    | DESIGNER | oui       | non      | non          |
| user-bob     | bob      | REVIEWER | non       | oui      | non          |
| user-charlie | charlie  | READER   | non       | non      | non          |

Header HTTP à utiliser : `X-PLM-User: user-alice`

---

## Démarrage rapide

```bash
# Dev (Derby in-memory)
docker compose up --build
# → Frontend : http://localhost:3000
# → API      : http://localhost:8080/api

# Prod (PostgreSQL)
cp .env.example .env   # éditer PG_PASSWORD
docker compose --profile prod up --build

# Tests
mvn test
```

---

## Ce qui reste à faire (backlog)

### Priorité haute
- [ ] **Pagination** sur les listes de noeuds (`GET /api/nodes?page=&size=&type=`)
- [ ] **Recherche** par attribut (`GET /api/nodes/search?q=...`)
- [ ] **Audit trail endpoint** (`GET /api/nodes/{id}/versions` — toutes les versions techniques)
- [ ] **Correction PlmAuthFilter** : la variable `roles` est déclarée avec `var` dans une boucle for — à corriger en Java 21 propre
- [ ] **Tests PlmRoleAndViewTest** : certains tests supposent que le SecurityContext est actif dans les services — vérifier que `PlmSecurityContext.get()` fonctionne bien en contexte de test sans filtre HTTP

### Priorité moyenne
- [ ] **Gestion des liens dans le frontend** : créer un lien entre deux noeuds existants
- [ ] **Vue admin méta-modèle** : interface pour créer NodeType / Lifecycle / AttributeDefinition sans passer par l'API
- [ ] **Comparaison de baselines** dans le frontend
- [ ] **Export baseline** en JSON ou CSV
- [ ] **Expiration de lock avec notification** : le `LockService` nettoie les locks expirés mais n'envoie pas encore de notification WebSocket `LOCK_EXPIRING`

### Priorité basse
- [ ] **Remplacer PlmAuthFilter par JWT/OAuth2** (Spring Security + Keycloak)
- [ ] **Plugin system pour les guards** : SPI Java pour ajouter des guards custom sans modifier `LifecycleService`
- [ ] **Multi-tenant** : isolation par organisation
- [ ] **JOOQ code generation** : générer les classes JOOQ depuis le schéma Flyway pour du SQL encore plus typé

---

## Points d'attention techniques

### Derby vs PostgreSQL
Certaines requêtes SQL utilisent des guillemets doubles pour les alias de colonnes
(ex: `nl.ID`, `lt.LINK_POLICY`). Derby et PostgreSQL ont des comportements légèrement
différents sur les alias. À tester avec PostgreSQL avant la mise en prod.

### JOOQ sans code generation
Le projet utilise JOOQ en mode "plain SQL" (sans génération de classes).
C'est intentionnel pour démarrer rapidement, mais l'étape suivante serait
d'activer la génération de code JOOQ depuis le schéma Flyway.

### PlmSecurityContext en test
Les tests injectent manuellement le contexte via `PlmSecurityContext.set(...)`.
En production, c'est `PlmAuthFilter` qui le fait. Cette dualité doit être
documentée pour les futurs développeurs.

### Frontend : pas de state management global
Le frontend est intentionnellement simple (pas de Redux/Zustand).
L'état est local à chaque composant + rechargement depuis l'API.
Acceptable pour un POC, à revoir si le volume de données augmente.

---

## Comment reprendre avec Claude

Colle ce fichier au début de ta conversation et dis par exemple :

> "Je reprends le projet PLM Core. Voici le CLAUDE.md de contexte.
>  Je voudrais maintenant implémenter [la fonctionnalité X]."

Claude pourra reprendre immédiatement sans avoir besoin de ré-expliquer
l'architecture depuis le début.

---

## Mise à jour — Modèle de transaction enrichi (session 5)

### Modèle de transaction PLM

```
OPEN ──────► COMMITTED   (commit avec commentaire obligatoire)
  │
  └────────► ROLLEDBACK  (annulation — versions conservées pour audit)
```

**Règles clés :**
- Un utilisateur ne peut avoir qu'**une seule transaction OPEN** à la fois
- Création **automatique** au premier checkin OU **explicite** (bouton "Ouvrir une transaction")
- Le commit **libère tous les locks** de la transaction en une seule opération
- Le commentaire de commit est **obligatoire** (comme un message Git)
- Le rollback **supprime physiquement** les versions OPEN et la transaction elle-même → le noeud retrouve exactement son état avant le checkin

**Visibilité des node_version :**
| tx_status   | Visible par |
|-------------|------------|
| `COMMITTED` | Tout le monde |
| `OPEN`      | Owner de la tx + admins |

Il n'existe **pas** de statut `ROLLEDBACK` sur les versions : elles sont supprimées physiquement au rollback. La transaction elle-même est aussi supprimée (pas de trace).

**node_version enrichie :**
- `tx_id` → référence la transaction PLM
- `tx_status` → `OPEN` | `COMMITTED` uniquement

### JOOQ Code Generation

Pipeline Maven : `generate-sources`
1. **Flyway Maven Plugin** → applique les migrations sur une Derby dédiée (`target/jooq-codegen-db`)
2. **JOOQ Codegen Plugin** → génère les classes Java dans `target/generated-sources/jooq/com/plm/generated/jooq/`
3. **Build Helper Plugin** → ajoute le répertoire au classpath

Classes générées : Tables, Records (fluent setters), POJOs immuables, ForcedTypes (boolean, LocalDateTime).

### Nouveaux fichiers (session 5)
- `V5__transaction_model.sql` — enrichissement `plm_transaction` (statuts OPEN/COMMITTED) + colonnes `tx_id`/`tx_status` (OPEN/COMMITTED) sur `node_version`
- `PlmTransactionService.java` — cycle de vie complet (open/commit/rollback/visibilité)
- `LockService.java` — refactoré pour intégration tx (checkin retourne txId, plus de checkout auto)
- `VersionService.java` — `tx_id`/`tx_status` attachés à chaque version créée
- `TransactionController.java` — API REST `/api/transactions`
- `PlmTransactionTest.java` — 14 tests couvrant tous les cas

### API Transactions
```
POST   /api/transactions                  → ouvre une tx explicitement
GET    /api/transactions                  → liste (filtrée par visibilité)
GET    /api/transactions/current          → tx OPEN de l'utilisateur courant
GET    /api/transactions/{txId}           → détail (règles de visibilité)
GET    /api/transactions/{txId}/versions  → versions dans la tx
POST   /api/transactions/{txId}/commit    → commit (body: {userId, comment})
POST   /api/transactions/{txId}/rollback  → rollback (body: {userId})
```

### Points d'attention
- **Dépendance circulaire** LockService ↔ PlmTransactionService résolue avec `@Lazy`
- **checkinCascade** : réutilise la même transaction pour toute la cascade
- **VersionService** : ne fait plus `lockService.checkout()` — c'est le commit qui libère
- **Stale transactions** : nettoyage automatique des tx OPEN > 24h (auto-rollback)
