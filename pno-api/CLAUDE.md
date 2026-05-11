# pno-api — Identity, Organization, Basket & User Preferences

`serviceCode` = `pno` · port 8081 · URL prefix `/api/pno` · Java 21 + Spring Boot 3.2.

**Source vérité identité & organisation**. Users, rôles, project spaces, hiérarchie spaces, service tags par space. Tous contrôles accès s'appuient sur pno via HTTP (cache Caffeine côté consommateur).

Héberge aussi le **basket** (items épinglés par user+space) et le **KV store** user (préférences UI).

---

## Structure

```
pno-api/
├── src/main/java/com/pno/
│   ├── PnoApplication.java
│   ├── api/controller/
│   │   ├── UserController, RoleController, ProjectSpaceController
│   │   ├── BasketController          # GET/PUT/DELETE /users/{id}/basket/…
│   │   └── UserKvController          # GET/PUT/DELETE /users/{id}/kv/{group}/…
│   ├── domain/service/
│   │   ├── UserService, RoleService, ProjectSpaceService
│   │   ├── BasketService             # basket_item table CRUD
│   │   └── UserKvService             # user_kv table CRUD
│   ├── infrastructure/
│   │   ├── event/
│   │   │   ├── BasketEventSubscriber # NATS global.ITEM_CREATED → basket auto-add
│   │   │   └── BasketPublisher       # NATS BASKET_ITEM_ADDED/REMOVED/CLEARED
│   │   └── security/                 # PnoAuthFilter, PnoUserContext, PnoSecurityContext
└── src/main/resources/db/migration/
    ├── V19__user_kv.sql              # table user_kv (group/key/value set semantics)
    └── V20__basket_item.sql          # table basket_item + migration depuis user_kv BASKET group
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
# Users / Roles / Project Spaces
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

# Basket (items épinglés)
GET    /api/pno/users/{id}/basket                              ← liste [{source, typeCode, itemId}]
PUT    /api/pno/users/{id}/basket/{source}/{typeCode}/{itemId} ← ajouter (idempotent)
DELETE /api/pno/users/{id}/basket/{source}/{typeCode}/{itemId} ← retirer un item
DELETE /api/pno/users/{id}/basket                             ← vider tout

# KV store (préférences utilisateur)
GET    /api/pno/users/{id}/kv/{group}                          ← liste [{key, value}]
PUT    /api/pno/users/{id}/kv/{group}/{key}/{value}            ← ajouter entrée (set)
DELETE /api/pno/users/{id}/kv/{group}/{key}/{value}            ← retirer une entrée
DELETE /api/pno/users/{id}/kv/{group}                         ← vider groupe
GET    /api/pno/users/{id}/kv/{group}/single/{key}             ← valeur unique (UI_PREF)
PUT    /api/pno/users/{id}/kv/{group}/single/{key}/{value}     ← set valeur unique (remplace)

# Endpoints internes (X-Service-Secret)
POST   /api/pno/internal/scopes/register           ← appelé par PermissionScopeRegistrationAutoConfiguration
GET    /api/pno/internal/scope-values/{scope}/{key}
```

---

## Basket

Table dédiée `basket_item` (V20). Indépendante du KV store.

**Schéma :** `(user_id, ps_id, source, type_code, item_id)` — contrainte UNIQUE, `ON CONFLICT DO NOTHING` pour idempotence.

**Scope :** `ps_id` lu depuis header `X-PLM-ProjectSpace`. Header absent/vide = chaîne vide (scope utilisateur global).

**Auto-add via NATS :** `BasketEventSubscriber` s'abonne à `global.ITEM_CREATED`. Extrait `source`, `typeCode`, `itemId`, `userId`, `projectSpaceId` du payload → appelle `BasketService.add()`. Best-effort (erreurs loguées, jamais propagées).

**Événements NATS émis (via `BasketPublisher`) :**
- `BASKET_ITEM_ADDED` — payload `{userId, psId, key, value}` (`key = source:typeCode`)
- `BASKET_ITEM_REMOVED` — même payload
- `BASKET_CLEARED` — payload `{userId, psId}`

Ces événements font une mise à jour optimiste dans le frontend (`syncBasketAdd/Remove/Clear` dans `usePlmStore`).

---

## KV Store (UI_PREF)

Table `user_kv` (V19). Sémantique **set** : `UNIQUE(user_id, ps_id, group_name, kv_key, kv_value)` — plusieurs valeurs possibles pour une même clé.

**Scope :** header `X-PLM-ProjectSpace`. Absent/vide = scope global (utilisé par `UI_PREF`). Le frontend passe `{ psOverride: '' }` dans `kvApi` pour forcer le scope global (pas d'espace projet dans l'URL).

**Consommateur actuel :** `UI_PREF` — préférence thème. Frontend lit au login (`kvApi.getSingle`), écrit au changement (`kvApi.setSingle`). `setSingleValue` supprime l'ancienne valeur avant d'insérer (sémantique single-value).

**Séparation basket/KV :** basket utilise `BasketController` + `basket_item`. KV n'expose plus de logique basket — group `BASKET` ignoré par `UserKvController`.

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
