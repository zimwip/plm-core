# platform-lib — Shared platform library

JAR Maven standalone (pas aggregator pom). **Unique point entrée** pour intégrer un service au PLM Core.

Build : `./psm-api/mvnw -f platform-lib/pom.xml install`. Dans Docker : stage 0 `lib-builder` compile + install via `additional_contexts: platform-lib: ./platform-lib` du docker-compose, stage 1 résout depuis cache BuildKit partagé (`--mount=type=cache,id=plm-m2`).

---

## Auto-configurations Spring Boot

Déclarées dans `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`. Câblent auto les sidecars suivants :

| Auto-config | Trigger | Effet |
|---|---|---|
| `SpeRegistrationAutoConfiguration` | `spe.registration.service-code` défini (`enabled=true` par défaut) | Auto-enregistrement à spe-api + heartbeat + `LocalServiceRegistry` (cache des autres services) |
| `ServiceClientAutoConfiguration` | `LocalServiceRegistry` présent | Bean `ServiceClient` registry-aware avec Resilience4j retry/circuit-breaker pour appels S2S |
| `PlmAuthAutoConfiguration` | `plm.auth.service-secret` défini | `PlmAuthFilter` monté ; vérifie JWT (utilisateur final) ou `X-Service-Secret` (S2S) ; appelle votre `PlmAuthContextBinder` pour peupler ThreadLocal local |
| `PlatformAuthzAutoConfiguration` | `plm.permission.enabled=true` + beans `AuthzContextProvider` + `PermissionCatalogPort` | Enforcer Casbin + `@PlmPermission` aspect ; snapshot grants pulled de pno-api au boot, refreshed via NATS `global.AUTHORIZATION_CHANGED` |
| `PermissionScopeRegistrationAutoConfiguration` | `plm.permission.enabled=true` | Enregistre tous les beans `PermissionScopeContribution` à pno (`/internal/scopes/register`) ; expose `/scope-values/<scope>/<key>` pour value sources |
| `ConfigRegistrationAutoConfiguration` | `psm.config.admin-url` défini | Pull snapshot psm-admin + subscription NATS `env.service.psa.CONFIG_CHANGED` (réservé services qui consomment métamodèle PSM) |
| `SettingsRegistrationAutoConfiguration` | `plm.settings.enabled=true` | Enregistre tous les beans `SettingSectionDto` à platform-api (`/internal/settings/register`) pour qu'ils apparaissent dans page Settings |
| `AlgorithmRegistrationAutoConfiguration` | beans `@AlgorithmBean` présents + `psm.config.admin-url` défini | Enregistre algorithmes locaux à psm-admin (`/internal/algorithms/register`) — pour services contribuant handlers/guards/wrappers/resolvers |
| `NatsAutoConfiguration` | `plm.nats.enabled=true` | Connexion NATS + `NatsListenerFactory` + `AuthzChangeSubscriber` (refresh permissions on remote change) |
| `VaultAutoConfiguration` | Spring Cloud Vault sur classpath + `spring.cloud.vault.token` | Résout `plm.service.secret`, `spring.datasource.password`, `plm.jwt.*` depuis `secret/plm` |

---

## Convention de routage

`serviceCode` = **seule source vérité** URL. `SpeContextPathPostProcessor` lit `spe.registration.service-code` au bootstrap + injecte `server.servlet.context-path=/api/<code>` dans env avant démarrage servlet container. `SpeRegistrationProperties` dérive `routePrefix=/api/<code>/**` + publie à spe-api.

```
# application.properties
spe.registration.service-code=psm    # seule ligne de routage

# Controller
@RequestMapping("/nodes")            # URL finale : /api/psm/nodes
```

**Garde-fou** au démarrage (`SpeRegistrationClient.assertControllerPathsNotHardcoded`) échoue boot si `@RequestMapping` commence par `/api/...`.

**Endpoints `/internal/*`** : routes service-à-service. Context-path s'applique aussi → URL réelle = `/api/<code>/internal/...`. Clients dans platform-lib (`ConfigRegistrationClient`, `SettingsRegistrationClient`) incluent ce préfixe en dur — un seul endroit à modifier si code admin change.

**Actuator** : suit context-path aussi. Healthcheck Docker + heartbeat spe-api ciblent donc `/api/<serviceCode>/actuator/health`.

**Opt-out** : service peut déclarer explicit `spe.registration.route-prefix=...` pour court-circuiter convention — post-processor + garde-fou alors désactivés.

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

```properties
spring.application.name=<svc>
server.port=<port>

# Identité (réutilisée par tous les sidecars de registration)
spe.registration.service-code=<code>                   # ex: dst, psm, pno
spe.registration.self-base-url=${SPE_SELF_BASE_URL:http://<svc>:<port>}
spe.registration.spe-url=${SPE_API_URL:http://spe-api:8082}
spe.registration.service-secret=${plm.service.secret}
spe.registration.extra-paths=/v3/api-docs/**,/swagger-ui/**

# Auth filter (toujours actif)
plm.auth.service-secret=${plm.service.secret}

# @PlmPermission + DATA scope registration (si le service a des permissions)
plm.permission.enabled=true
plm.permission.pno-url=${PNO_API_URL:http://pno-api:8081}

# Settings page (si le service contribue des sections)
plm.settings.enabled=true
plm.settings.settings-url=${PLM_PLATFORM_URL:http://platform-api:8084}
plm.settings.service-code=<code>
plm.settings.self-base-url=${SPE_SELF_BASE_URL:http://localhost:<port>}
plm.settings.service-secret=${plm.service.secret:}

# Config snapshot psm-admin (UNIQUEMENT pour services métier qui consomment le métamodèle)
# psm.config.admin-url=${PSM_CONFIG_ADMIN_URL:http://psm-admin:8083}
# psm.config.service-code=${PSM_CONFIG_SERVICE_CODE:<code>-data}
# psm.config.self-base-url=${PSM_CONFIG_SELF_BASE_URL:http://localhost:<port>}

# NATS (active AuthzChangeSubscriber et autres listeners)
plm.nats.enabled=true
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
| Algorithmes | beans `@AlgorithmBean` + `algorithm_type` row dans psm-admin (à seeder via V2 si nouveau type) |

Réf dst pour ces 4 classes : `dst/src/main/java/com/dst/security/{DstAuthContextBinder,DstAuthzContextProvider,DstSecurityContext,DstUserContext,DstPermissionCatalog}.java` + `dst/src/main/java/com/dst/authz/DataScopeContribution.java`.

### 5. Convention routage (rappel)
- Controllers : `@RequestMapping("/foo")` — JAMAIS `/api/<code>/foo`. Garde-fou échoue boot sinon.
- Endpoints S2S sous `/internal/<x>` ; filtre laisse passer avec `X-Service-Secret`.
- URL externe = `/api/<code>/foo` ; `SpeContextPathPostProcessor` injecte `server.servlet.context-path=/api/<code>` au démarrage.

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
