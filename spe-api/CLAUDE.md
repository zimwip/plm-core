# spe-api — Gateway + Service Registry

Port 8082 · URL prefix `/api/spe` · Java 21 + Spring Cloud Gateway + Spring Boot 3.2.

**Seul point d'entrée** des requêtes externes. Aucun service backend exposé direct au client. Gateway s'enregistre auprès de platform-api comme tout autre service (via `PlatformRegistrationClient`) — mais pas dans son propre registry spe.

---

## Responsabilités

- Terminaison TLS (via nginx amont)
- Auth (login, JWT mint + verify)
- **Load-balancing** round-robin entre instances saines même `serviceCode`
- **Ségrégation routes** par convention `/api/<serviceCode>` dérivée env (pas config en dur)
- Heartbeat + éviction instances mortes
- Snapshot registry pour clients

Routes 100% dynamiques : service apparaît dans registry → route construite auto depuis son `serviceCode`.

---

## Registry multi-instances & load-balancing

Chaque `serviceCode` gère **pool instances**. Service peut avoir 1..N instances enregistrées simultané (réplicas). Gateway route en **round-robin** entre instances saines.

- `ServiceRegistry` : `Map<serviceCode, Map<instanceId, ServiceRegistration>>` + `AtomicInteger` par service pour compteur RR.
- `instanceId` = SHA-1(baseUrl) tronqué à 10 hex chars → **déterministe**, donc pod qui se ré-enregistre remplace son entrée au lieu d'en créer nouvelle.
- **Route dynamique** : une route par `serviceCode`, URI `svc://<code>`. `SvcLoadBalancerFilter` (GlobalFilter, ordre 10150, avant `NettyRoutingFilter`) résout scheme `svc` en pickant instance round-robin + réécrit `GATEWAY_REQUEST_URL_ATTR` par requête.
- **Refresh routes** : seulement à apparition/disparition d'un `serviceCode` (premier/dernier instance). Churn instance ne recompute pas routes.
- **Heartbeat** : `HeartbeatScheduler` ping chaque instance individu. `failure-threshold` (défaut 3) → eviction **niveau instance**, pas service entier. Quand dernière instance d'un service disparaît, `serviceCode` lui-même disparaît du registry.

### Endpoints

spe-api n'expose qu'**un seul controller** : `AuthController` sous `/api/spe/auth`.

```
POST   /api/spe/auth/login            — login via header X-User, mint JWT session
POST   /api/spe/auth/operation-token  — élève un fwd-JWT en token d'opération (typ=op)
POST   /api/spe/auth/logout           — stateless (client drop le token)
GET    /api/spe/auth/me               — contexte user courant
```

Les endpoints registry/status (`/api/spe/registry`, `/api/spe/status`) ont migré vers
**platform-api** (control plane central). spe-api consomme ce registry pour le routage
(`RegistryRouteRefresher`, `PlatformBootstrapSeed`, `SvcLoadBalancerFilter`) mais n'expose plus
d'endpoint HTTP registry.

### Healthcheck cible

Gateway ping `/api/<serviceCode>/actuator/health` (pas `/actuator/health` racine). Context-path appliqué par services côté backend.

### Client side

`SpeRegistrationClient` (platform-lib) parse `instanceId` retourné par POST, l'utilise pour DELETE en shutdown. `SPE_SELF_BASE_URL` doit être **unique par instance** (sinon même `instanceId` → écrasement mutuel).

### docker-compose

Pour scaler psm-api : répliquer service (`psm-api-1`, `psm-api-2`) avec `SPE_SELF_BASE_URL` distincts. Tous réplicas partagent même base Postgres (schéma `psm`).

`SPE_EXPECTED_SERVICES` (env var spe-api) : liste codes attendus au démarrage. Ajout d'un service → ajouter son code ici.

---

## Convention routage (rappel)

`serviceCode` = **seule source vérité** URL. Préfixe `/api/<serviceCode>` appliqué auto par `platform-lib` côté service via Spring `server.servlet.context-path`. Gateway forward path verbatim (pas rewrite).

### Exception spe-api : préfixe `/api/spe` codé en dur (volontaire)

`AuthController` déclare `@RequestMapping("/api/spe/auth")` en dur — **dérogation assumée** à la
convention "mapping relatif". Raison : spe-api est **réactif** (WebFlux), donc
`server.servlet.context-path` (servlet) ne s'applique pas. L'équivalent réactif
`spring.webflux.base-path` retirerait son préfixe **avant** que le `WebFilter`
`AuthenticationFilter` (exécuté pré-routage) voie le path. Or `AuthenticationFilter` compare des
paths **littéraux** (`/api/spe/auth/login`, `/api/spe/auth/logout`, `/api/spe/auth/operation-token`)
pour décider des exemptions d'auth. Passer en `base-path` casserait ces comparaisons → login/logout
perdraient leur exemption publique → **deadlock d'auth, plus personne ne peut se connecter**.
Le préfixe reste donc en dur tant que `AuthenticationFilter` matche des paths externes complets.

---

## Frontend chip

`GET /api/spe/status` remonte `instanceCount`, `healthyInstances`, + tableau `instances[]` avec id/version/healthy/age/failures par instance. Chip frontend affiche `X/Y svc · X/Y inst`.
