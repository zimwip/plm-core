# psm-admin — PSM admin (config central)

`serviceCode` = `psa` · port 8083 · URL prefix `/api/psa` · Java 21 + Spring Boot 3.2.

**Gestion config centrale**. CRUD métamodèle — node types, lifecycles, transitions, attributs, domaines, enums, policies autorisation, import contexts. Écritures pure admin — pas runtime user.

---

## Publication config

Deux canaux :
- **Pull** : `GET /api/psa/internal/config/snapshot` (X-Service-Secret) — bootstrap des consommateurs (psm-api, autres).
- **Push** : NATS `env.service.psa.CONFIG_CHANGED` — refresh consommateurs après modif admin.

Consommateurs cachent local via `ConfigRegistrationClient` (platform-lib).

---

## API endpoints

```
GET    /api/psa/metamodel/nodetypes
GET    /api/psa/metamodel/lifecycles
POST   /api/psa/permissions
GET    /api/psa/roles/{roleId}/policies
GET    /api/psa/enums
GET    /api/psa/domains

GET    /api/psa/admin/import-contexts
POST   /api/psa/admin/import-contexts
GET    /api/psa/admin/import-contexts/{id}
PUT    /api/psa/admin/import-contexts/{id}
DELETE /api/psa/admin/import-contexts/{id}

# Endpoints internes (X-Service-Secret)
GET    /api/psa/internal/config/snapshot
GET    /api/psa/internal/import-contexts/{code}
```

> **Note :** Les tables `algorithm`, `algorithm_type`, `algorithm_instance`, `action`, `action_guard`, `action_required_permission` ont été **déplacées vers platform-api** (V4 psm-admin les a supprimées). Tout ajout ou modification de catalog d'algorithmes se fait via des migrations platform-api.

---

## Seed migrations

`src/main/resources/db/migration/V*.sql` — Flyway. `V2__seed_data.sql` contient le catalog editor de permissions.

**Algorithmes / actions** : catalog centralisé dans **platform-api** (tables `algorithm`, `algorithm_type`, `algorithm_instance`, `action`, `action_guard`, `action_required_permission`). Pour nouveau handler/guard/action → migration `platform-api/src/main/resources/db/migration/V<n>__<feature>.sql`.

**Permissions** : source vérité dans **pno-api** (tables `permission` + `authorization_policy`). Seed `permission` + grants → migration `pno-api/src/main/resources/db/migration/V<n>__<scope>_permissions.sql`.

**Config métamodèle PSM** (node types, lifecycles, lifecycle_transition_guard) : migrations psm-admin. `algorithm_instance_id` dans `lifecycle_transition_guard` est une référence souple (VARCHAR, pas FK) vers les instances de platform-api.

---

## Tests

```bash
docker exec psm-admin mvn test -f /app/pom.xml
```
