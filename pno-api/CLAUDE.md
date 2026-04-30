# pno-api — Identity & Organization

`serviceCode` = `pno` · port 8081 · URL prefix `/api/pno` · Java 21 + Spring Boot 3.2.

**Source vérité identité & organisation**. Users, rôles, project spaces, hiérarchie spaces, service tags par space. Tous contrôles accès s'appuient sur pno via HTTP (cache Caffeine côté consommateur).

---

## Structure

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

## Users + rôles seed

| ID           | Username | Rôle     | is_admin | Notes PSM par défaut          |
|--------------|----------|----------|----------|-------------------------------|
| user-admin   | admin    | ADMIN    | oui      | bypass tous les checks        |
| user-alice   | alice    | DESIGNER | non      | can_write, pas can_sign       |
| user-bob     | bob      | REVIEWER | non      | can_sign, pas can_write       |
| user-charlie | charlie  | READER   | non      | lecture seule                 |

**Espaces projet :** `ps-default` (espace standard).

Header HTTP : `X-PLM-User: user-alice` + `X-PLM-ProjectSpace: ps-default`.

---

## API endpoints

```
GET    /api/pno/users
POST   /api/pno/users
GET    /api/pno/users/{id}/context?projectSpaceId=  ← appelé par psm-api (auth bypassée)
POST   /api/pno/users/{id}/roles/{roleId}
DELETE /api/pno/users/{id}/roles/{roleId}

GET    /api/pno/roles
POST   /api/pno/roles
PUT    /api/pno/roles/{id}
DELETE /api/pno/roles/{id}

GET    /api/pno/project-spaces
POST   /api/pno/project-spaces
DELETE /api/pno/project-spaces/{id}

# Endpoints internes (X-Service-Secret)
POST   /api/pno/internal/scopes/register           ← appelé par PermissionScopeRegistrationAutoConfiguration
GET    /api/pno/internal/scope-values/{scope}/{key}
```

---

## Auth inter-services

- `/api/pno/users/{id}/context` exempt auth dans `PnoAuthFilter` (appelé avant établissement contexte user).
- `PnoAuthFilter` strip context-path avant matcher `public-paths` / `/internal/*`.
- Consommateurs (psm-api, etc.) cachent réponses Caffeine 30 s, 500 entrées.

---

## Permissions

Source vérité de `permission` rows + `authorization_policy` grants. Réplique snapshot poussé via NATS `global.AUTHORIZATION_CHANGED` aux consommateurs (`PlatformAuthzAutoConfiguration`).

Nouveau scope owné par autre service : ajouter migration `V<n>__<scope>_permissions.sql` dans pno-api (rows `permission` + grants défaut dans `authorization_policy`).

---

## Tests

```bash
docker exec pno-api mvn test -f /app/pom.xml
```
