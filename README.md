# PLM Core - Architecture

## Stack
- **Spring Boot 3.2** + **JOOQ** + **Derby** (dev) / **PostgreSQL 16** (prod)
- **Flyway** pour les migrations de schéma
- **WebSocket STOMP** pour les notifications temps réel

---

## Lancer le service

### Mode dev (Derby in-memory, zéro config)
```bash
docker compose up --build
# API disponible sur http://localhost:8080
```

### Mode prod (PostgreSQL)
```bash
cp .env.example .env        # éditer PG_PASSWORD
docker compose --profile prod up --build
```

### Tests
```bash
mvn test
```

---

## Authentification (dev)

Toutes les requêtes API doivent porter le header `X-PLM-User` :
```bash
curl -H "X-PLM-User: user-alice" http://localhost:8080/api/nodes/...
```
En production : remplacer `PlmAuthFilter` par une validation JWT/OAuth2.

---

## Utilisateurs et rôles du seed (V4)

| Utilisateur | ID           | Role     | can_write | can_sign | can_baseline |
|-------------|--------------|----------|-----------|----------|--------------|
| admin       | user-admin   | ADMIN    | tout      | oui      | oui          |
| alice       | user-alice   | DESIGNER | oui       | non      | non          |
| bob         | user-bob     | REVIEWER | non       | oui      | non          |
| charlie     | user-charlie | READER   | non       | non      | non          |

---

## Pipeline Server-Driven UI

```
1. Regle d etat (AttributeStateRule)   -> editable / visible / required
2. Vue active (role x etat, priorite)  -> restreint seulement, jamais elargit
3. Permission can_write globale        -> si false, tout readonly
4. Transitions filtrees par role       -> transition_permission
```

---

## Migrations Flyway

| Version | Contenu |
|---------|---------|
| V1 | Schema de base (node, version, lifecycle, lock, baseline) |
| V2 | Signatures electroniques |
| V3 | Roles, permissions, vues |
| V4 | Donnees initiales (seed) |

---

## API REST (resume)

**Noeuds** : POST/GET/PUT `/api/nodes`, transitions, signatures, liens
**Meta-modele** : `/api/metamodel/lifecycles`, `/nodetypes`, `/linktypes`
**Baselines** : GET/POST `/api/baselines`, compare
**Admin** : `/api/admin/roles`, `/users`, `/permissions`, `/views`

Header requis sur toutes les requetes : `X-PLM-User: {userId}`

---

## Structure des packages

```
com.plm
├── domain/service   -> LockService, VersionService, LifecycleService,
│                       NodeService, ValidationService, SignatureService,
│                       BaselineService, MetaModelService, PermissionService
├── api/controller   -> NodeController, MetaModelAndBaselineController,
│                       RoleController
└── infrastructure
    ├── WebSocketConfig, PlmEventPublisher
    └── security/    -> PlmUserContext, PlmSecurityContext, PlmAuthFilter
```
