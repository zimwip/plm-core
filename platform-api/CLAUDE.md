# platform-api — Settings aggregator + Vault admin

`serviceCode` = `platform` · port 8084 · URL prefix `/api/platform` · Java 21 + Spring Boot 3.2.

**Service plateforme central** — agrégateur page Settings du frontend + admin Vault (secrets). Évite que frontend parle à N services pour construire page.

---

## Settings aggregator

Au démarrage, chaque service publie ses sections via `SettingsRegistrationClient` (platform-lib) → `POST /api/platform/internal/settings/register`. platform-api stocke + expose arbre groupé via `GET /api/platform/sections`. Valide permissions GLOBAL direct (pas via pno).

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
GET    /api/platform/sections           ← agrégateur pour la page Settings du frontend
GET    /api/platform/admin/secrets      ← administration Vault (MANAGE_SECRETS)

# Endpoints internes (X-Service-Secret)
POST   /api/platform/internal/settings/register
DELETE /api/platform/internal/settings/register/{serviceCode}/instances/{instanceId}
```
