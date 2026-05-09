# platform-api — Settings aggregator + Algorithm catalog + Vault admin

`serviceCode` = `platform` · port 8084 · URL prefix `/api/platform` · Java 21 + Spring Boot 3.2.

**Service plateforme central** — agrégateur page Settings du frontend, **catalog centralisé algorithmes/actions/guards**, admin Vault (secrets). Évite que frontend parle à N services pour construire page.

---

## Settings aggregator

Au démarrage, chaque service publie ses sections via `SettingsRegistrationClient` (platform-lib) → `POST /api/platform/internal/settings/register`. platform-api stocke + expose arbre groupé via `GET /api/platform/sections`. Valide permissions GLOBAL direct (pas via pno).

---

## Algorithm & Action catalog

Source vérité de toutes les tables `algorithm_type`, `algorithm`, `algorithm_instance`, `action`, `action_guard`, `action_required_permission`. **Ces tables n'existent plus dans psm-admin** (supprimées en V4).

Deux mécanismes d'alimentation :
- **Auto-registration au démarrage** : chaque service envoie ses `@AlgorithmBean` via `POST /api/platform/internal/registry/actions` (géré par `AlgorithmRegistrationAutoConfiguration` dans platform-lib). `ActionCatalogRegistryController` persiste les rows avec `ON CONFLICT DO UPDATE`.
- **Migration statique** : `platform-api/src/main/resources/db/migration/V<n>__<feature>.sql` — pour pré-seeder avant le premier démarrage du service contributeur ou garantir l'idempotence. Utiliser `ON CONFLICT DO NOTHING` (auto-registration sera maître ensuite).

Convention IDs :
| Artefact | Pattern ID |
|----------|-----------|
| algorithm type handler | `sys-handler-<service>` |
| algorithm type guard | `sys-guard-<service>` |
| algorithm | `alg-<service>-<safe-code>` |
| algorithm instance | `ainst-<service>-<safe-code>` |
| action | `act-<service>-<safe-code>` |
| action guard | `ag-<service>-<safe-code>-<guard-short>` |

`safe-code` = `code.toLowerCase().replace('_', '-')`.

`action_required_permission.permission_code` est une **référence souple** (FK supprimée en V7 — permission vit dans pno-api). Valider la cohérence manuellement.

---

## Vault admin

UI : **Settings → Platform → Secrets** (permission `MANAGE_SECRETS`, CRUD complet).

`GET /api/platform/admin/secrets` — liste secrets. CRUD via mêmes routes (`POST`/`PUT`/`DELETE`).

### Vault setup (démo, pas prod)

HashiCorp Vault stocke secrets runtime (`plm.service.secret`, `spring.datasource.password`, `plm.jwt.*`). Conteneur `vault:1.17` + one-shot `vault-bootstrap` qui init/descelle/seed. Services résolvent via Spring Cloud Vault (`spring.config.import=optional:vault://`). Token service statique `plm-demo-services` (policy RW sur `secret/data/plm/*`). Données persistées via volumes `plm-vault-file` + `plm-vault-init`.

**DÉMO SEULEMENT.** Unseal key + root token stockés en clair sur volume `plm-vault-init`. Pas TLS, pas audit device, pas rotation. Pour prod : remplacer par vault-agent sidecars + AppRole + TLS + auto-unseal KMS. Voir `vault/bootstrap.sh` pour détail flux init.

---

## API endpoints

```
# Settings
GET    /api/platform/sections                                    ← agrégateur page Settings frontend

# Algorithm & Action catalog (MANAGE_PLATFORM)
GET    /api/platform/algorithms/types
GET    /api/platform/algorithms
GET    /api/platform/algorithms/by-type/{typeId}
GET    /api/platform/algorithms/{algorithmId}/instances
POST   /api/platform/algorithms/instances
GET    /api/platform/algorithms/instances/{instanceId}/params
GET    /api/platform/algorithms/actions/{actionId}/guards
POST   /api/platform/algorithms/actions/{actionId}/guards
GET    /api/platform/algorithms/transitions/{transitionId}/guards
POST   /api/platform/algorithms/transitions/{transitionId}/guards
GET    /api/platform/algorithms/actions/{actionId}/wrappers
POST   /api/platform/algorithms/actions/{actionId}/wrappers
GET    /api/platform/algorithms/stats
GET    /api/platform/algorithms/stats/timeseries
GET    /api/platform/registry/actions                            ← catalog complet pour psm-api

# Vault
GET    /api/platform/admin/secrets      ← administration Vault (MANAGE_SECRETS)

# Endpoints internes (X-Service-Secret)
POST   /api/platform/internal/settings/register
DELETE /api/platform/internal/settings/register/{serviceCode}/instances/{instanceId}
POST   /api/platform/internal/registry/actions   ← auto-registration @AlgorithmBean au démarrage
GET    /api/platform/internal/algorithms/instances
GET    /api/platform/internal/algorithms/by-type?typeId=
```
