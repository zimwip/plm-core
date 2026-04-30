# psm-admin — PSM admin (config central)

`serviceCode` = `psa` · port 8083 · URL prefix `/api/psa` · Java 21 + Spring Boot 3.2.

**Gestion config centrale**. CRUD métamodèle — node types, lifecycles, transitions, attributs, algos, domaines, enums, policies autorisation. Écritures pure admin — pas runtime user.

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
GET    /api/psa/algorithms/types
GET    /api/psa/domains

# Endpoints internes (X-Service-Secret)
GET    /api/psa/internal/config/snapshot
POST   /api/psa/internal/algorithms/register   ← services contributeurs d'algos
```

---

## Seed migrations

`src/main/resources/db/migration/V*.sql` — Flyway. `V2__seed_data.sql` contient le catalog editor de permissions + `algorithm_type` rows.

Pour nouveau type d'algorithme contribué par un autre service : seeder ligne dans `algorithm_type` via nouvelle migration psm-admin.

---

## Tests

```bash
docker exec psm-admin mvn test -f /app/pom.xml
```
