# platform-lib — Shared platform library

JAR Maven standalone (pas aggregator pom). **Unique point entrée** pour intégrer un service au PLM Core.

Build : `./psm-api/mvnw -f platform-lib/pom.xml install`. Dans Docker : stage 0 `lib-builder` compile + install via `additional_contexts: platform-lib: ./platform-lib` du docker-compose, stage 1 résout depuis cache BuildKit partagé (`--mount=type=cache,id=plm-m2`).

---

## Auto-configurations Spring Boot

Déclarées dans `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`. Câblent auto les sidecars suivants :

| Auto-config | Trigger | Effet |
|---|---|---|
| `PlatformRegistrationAutoConfiguration` | `platform.registration.service-code` défini (`enabled=true` par défaut) | Enregistrement à platform-api + heartbeat + `LocalServiceRegistry` (cache des autres services) |
| `ServiceClientAutoConfiguration` | `LocalServiceRegistry` présent | Bean `ServiceClient` registry-aware avec Resilience4j retry/circuit-breaker pour appels S2S |
| `PlmAuthAutoConfiguration` | `plm.auth.service-secret` défini | `PlmAuthFilter` monté ; vérifie JWT (utilisateur final) ou `X-Service-Secret` (S2S) ; appelle votre `PlmAuthContextBinder` pour peupler ThreadLocal local |
| `PlatformAuthzAutoConfiguration` | `plm.permission.enabled=true` + beans `AuthzContextProvider` + `PermissionCatalogPort` | Enforcer Casbin + `@PlmPermission` aspect ; snapshot grants pulled de pno-api au boot, refreshed via NATS `global.AUTHORIZATION_CHANGED` |
| `PermissionScopeRegistrationAutoConfiguration` | `plm.permission.enabled=true` | Enregistre tous les beans `PermissionScopeContribution` à pno (`/internal/scopes/register`) ; expose `/scope-values/<scope>/<key>` pour value sources |
| `ConfigRegistrationAutoConfiguration` | `psm.config.admin-url` défini | Pull snapshot psm-admin + subscription NATS `env.service.psa.CONFIG_CHANGED` (réservé services qui consomment métamodèle PSM) |
| `SettingsRegistrationAutoConfiguration` | `plm.settings.enabled=true` | Enregistre tous les beans `SettingSectionDto` à platform-api (`/internal/settings/register`) pour qu'ils apparaissent dans page Settings |
| `AlgorithmRegistrationAutoConfiguration` | beans `@AlgorithmBean` présents | Enregistre algorithmes locaux à **platform-api** (`/internal/registry/actions`) — pour services contribuant handlers/guards/wrappers/resolvers |
| `NatsAutoConfiguration` | `plm.nats.enabled=true` | Connexion NATS + `NatsListenerFactory` + `AuthzChangeSubscriber` (refresh permissions on remote change) |
| `VaultAutoConfiguration` | Spring Cloud Vault sur classpath + `spring.cloud.vault.token` | Résout `plm.service.secret`, `spring.datasource.password`, `plm.jwt.*` depuis `secret/plm` |

---

## Convention de routage

`serviceCode` = **seule source vérité** URL. `PlatformContextPathPostProcessor` lit **`platform.registration.service-code`** au bootstrap + injecte `server.servlet.context-path=/api/<code>` dans env avant démarrage servlet container.

```
# application.properties
platform.registration.service-code=psm    # seule ligne de routage — déclenche aussi enregistrement platform-api

# Controller
@RequestMapping("/nodes")                 # URL finale : /api/psm/nodes
```

> ⚠️ **`spe.registration.*` est obsolète** et ne déclenche plus l'injection du context-path. Utiliser uniquement `platform.registration.*`. Toute référence à `spe.registration.service-code` dans une nouvelle application.properties est un bug.

**Garde-fou** au démarrage (`SpeRegistrationClient.assertControllerPathsNotHardcoded`) échoue boot si `@RequestMapping` commence par `/api/...`.

**Endpoints `/internal/*`** : routes service-à-service. Context-path s'applique aussi → URL réelle = `/api/<code>/internal/...`. Clients dans platform-lib (`ConfigRegistrationClient`, `SettingsRegistrationClient`) incluent ce préfixe en dur — un seul endroit à modifier si code admin change.

**Actuator** : suit context-path aussi. Healthcheck Docker + heartbeat ciblent donc `/api/<serviceCode>/actuator/health`.

---

## Créer nouveau service avec `platform-lib`

Référence vivante : module `dst/`.

### 1. Squelette Maven
- Créer `<service>/pom.xml` ; copier `pno-api/pom.xml` (plus minimal) + adapter `groupId`/`artifactId`.
- Dépendance unique côté plateforme : `<dependency>com.plm.platform:platform-lib:0.1.0-SNAPSHOT</dependency>`. Tous sidecars apportés transitivement.
- **Runtime JJWT obligatoire** : platform-lib `JwtVerifier` utilise `io.jsonwebtoken:jjwt-api`/`jjwt-impl`/`jjwt-jackson` mais ne les expose pas en `compile` transitif. Ajouter trois (`api` en `compile`, `impl`+`jackson` en `runtime`, version `0.12.6`) sinon `PlmAuthAutoConfiguration` crash au boot avec `UnknownClassException: io.jsonwebtoken.impl.security.KeysBridge`.

### 2. Application Spring Boot
- `<service>/src/main/java/com/<svc>/<Svc>Application.java` : `@SpringBootApplication @EnableScheduling`.
- Pas utiliser `@ComponentScan(basePackages=...)` — scan défaut sur package racine suffit.

### 3. `application.properties` — déclarer chaque sidecar à activer

Référence canonique : `dst/src/main/resources/application.properties` et `cad-api/src/main/resources/application.properties`.

```properties
spring.application.name=<svc>
server.port=<port>

# ── Vault (résout plm.service.secret, plm.jwt.*, spring.datasource.password) ──
spring.config.import=vault://
spring.cloud.vault.uri=${VAULT_ADDR:http://vault:8200}
spring.cloud.vault.authentication=TOKEN
spring.cloud.vault.token=${VAULT_TOKEN:plm-demo-services}
spring.cloud.vault.kv.enabled=true
spring.cloud.vault.kv.backend=secret
spring.cloud.vault.kv.application-name=plm
spring.cloud.vault.kv.default-context=plm
spring.cloud.vault.fail-fast=true
spring.cloud.vault.retry.enabled=true
spring.cloud.vault.retry.initial-interval=1500
spring.cloud.vault.retry.max-interval=10000
spring.cloud.vault.retry.multiplier=1.5
spring.cloud.vault.retry.max-attempts=15

# ── Auth filter (toujours actif) ───────────────────────────────────────────
plm.auth.service-secret=${plm.service.secret}
plm.auth.clock-skew-seconds=${plm.jwt.clock-skew-seconds:5}
plm.auth.public-paths=/actuator/**,/v3/api-docs/**,/swagger-ui/**

# ── Platform registration (OBLIGATOIRE — déclenche context-path + enregistrement)
# NE PAS utiliser spe.registration.* — obsolète, ne déclenche plus le context-path
platform.registration.service-code=<code>              # /api/<code> context-path auto-set
platform.registration.extra-paths=/v3/api-docs/**,/swagger-ui/**
platform.registration.self-base-url=${SPE_SELF_BASE_URL:http://<svc>:<port>}
platform.registration.platform-url=${PLM_PLATFORM_URL:http://platform-api:8084}
platform.registration.service-secret=${plm.service.secret}
platform.registration.space-tag=${SPE_SPACE_TAG:}

# ── @PlmPermission + DATA scope registration (si le service a des permissions)
plm.permission.enabled=true
plm.permission.pno-url=${PNO_API_URL:http://pno-api:8081}

# ── Settings page (si le service contribue des sections) ───────────────────
plm.settings.enabled=true
plm.settings.settings-url=${PLM_PLATFORM_URL:http://platform-api:8084}
plm.settings.service-code=<code>
plm.settings.self-base-url=${SPE_SELF_BASE_URL:http://localhost:<port>}
plm.settings.service-secret=${plm.service.secret:}

# ── Config snapshot psm-admin (UNIQUEMENT si le service consomme le métamodèle PSM)
# psm.config.admin-url=${PSM_CONFIG_ADMIN_URL:http://psm-admin:8083}
# psm.config.service-code=${PSM_CONFIG_SERVICE_CODE:<code>-data}
# psm.config.self-base-url=${PSM_CONFIG_SELF_BASE_URL:http://localhost:<port>}

# ── NATS ────────────────────────────────────────────────────────────────────
plm.nats.enabled=${PLM_NATS_ENABLED:false}
plm.nats.url=${NATS_URL:nats://nats:4222}
plm.nats.connection-name=<code>
```

### 4. Beans applicatifs requis pour activer chaque sidecar

| Si vous activez... | Vous DEVEZ fournir |
|---|---|
| `plm.permission.enabled=true` | (a) `PermissionCatalogPort` impl — table de lookup `permissionCode → scopeCode` ; (b) `AuthzContextProvider` impl — bridge vers votre ThreadLocal local |
| `PlmAuthFilter` (toujours) | `PlmAuthContextBinder` impl — copie `PlmPrincipal` dans votre ThreadLocal au début de chaque requête |
| Permissions à publier | un bean `PermissionScopeContribution` par scope owné |
| Settings page | un bean `SettingSectionDto` par section UI |
| Algorithmes | beans `@AlgorithmBean` (auto-enregistrés à platform-api au démarrage) + migration `platform-api/V<n>__<feature>.sql` pour pré-seeder ou garantir idempotence |

Réf dst pour ces 4 classes : `dst/src/main/java/com/dst/security/{DstAuthContextBinder,DstAuthzContextProvider,DstSecurityContext,DstUserContext,DstPermissionCatalog}.java` + `dst/src/main/java/com/dst/authz/DataScopeContribution.java`.

### 5. Convention routage (rappel)
- Controllers : `@RequestMapping("/foo")` — JAMAIS `/api/<code>/foo`. Garde-fou échoue boot sinon.
- Endpoints S2S sous `/internal/<x>` ; filtre laisse passer avec `X-Service-Secret`.
- URL externe = `/api/<code>/foo` ; `PlatformContextPathPostProcessor` injecte `server.servlet.context-path=/api/<code>` depuis **`platform.registration.service-code`** au démarrage.
- **`spe.registration.*` ne déclenche PAS le context-path** — si utilisé seul, le service démarre avec context-path `/` et tous les appels `/api/<code>/...` retournent 404.

### 6. Permissions (si service introduit nouveau scope)
- Bean `PermissionScopeContribution` (cf `DataScopeContribution`) : déclare scope, ses keys (vide = role-only) + value sources.
- Seed `permission` rows dans `pno-api` (nouvelle migration `V<n>__<scope>_permissions.sql`) ET dans `psm-admin/V2__seed_data.sql` (catalog editor).
- Grants défaut dans même migration pno-api (`authorization_policy` rows).
- Annoter controllers : `@PlmPermission("<CODE>")` ou `@PlmPermission(value="<CODE>", keyExprs=@KeyExpr(name="<key>", expr="#paramName"))`.

### 7. Dockerfile
Copier `dst/Dockerfile` (3 stages : `lib-builder` → builder Maven → runtime JRE). Adapter `WORKDIR`, `COPY <svc>/...`, `EXPOSE <port>`, healthcheck `wget http://localhost:<port>/api/<code>/actuator/health`.

### 8. docker-compose.yml
- Ajouter bloc service (cf `dst:` block) avec : Vault env, datasource, schéma Flyway dédié, health on `/api/<code>/actuator/health`, `depends_on` Vault/Postgres/Jaeger/NATS healthy.
- Volumes si stockage local (cf `plm-dst-data` pour dst).
- `SPE_EXPECTED_SERVICES` (bloc spe-api) : ajouter `<code>` pour que spe attende enregistrement au démarrage.

### 9. `run.sh`
Ajouter `"<svc>|<port>|<schema>||<LOGPKG>"` dans `BACKEND_SVC_ROWS` pour que `./run.sh` build/restart prenne en compte nouveau service.

### 10. Si service appelle `/internal/<x>` d'un autre service
Étendre client correspondant dans platform-lib (`ConfigRegistrationClient.ADMIN_CONTEXT_PATH`, `SettingsRegistrationClient.SETTINGS_CONTEXT_PATH`) ou utiliser `ServiceClient.get(<code>, "/api/<code>/internal/...", ...)` qui prefixe auto context-path.

---

## Patterns à NE PAS répliquer

- **`spe.registration.service-code` seul** → ne déclenche pas context-path. Service démarre avec `/`, 403 à platform-api, toutes routes `/api/<code>/...` cassées. **Toujours utiliser `platform.registration.service-code`.**
- `new RestTemplate()` ou `new WebClient()` direct → utiliser `ServiceClient` (registry-aware + Resilience4j + tracing). Sans `RestTemplateBuilder` / `WebClient.Builder`, Micrometer Tracing n'instrumente pas le client : aucun span, aucun header `traceparent` propagé.
- Lookup direct en DB sur `pno_user`/`pno_role`/etc → utiliser endpoints HTTP de pno (cachés via Caffeine).
- Filtre auth maison → `PlmAuthFilter` déjà branché par auto-config ; fournir seulement `PlmAuthContextBinder`.
- Hard-coding `/api/<code>/...` dans controller → casse convention routage + boot échoue.

Pattern correct pour clients HTTP :
```java
@Component
public class MyClient {
    private final RestTemplate rest;
    public MyClient(RestTemplateBuilder builder) {
        this.rest = builder.build();
    }
}
```
