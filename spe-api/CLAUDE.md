# spe-api — Gateway + Service Registry

Port 8082 · URL prefix `/api/spe` · Java 21 + Spring Cloud Gateway + Spring Boot 3.2.

**Seul point d'entrée** des requêtes externes. Aucun service backend exposé direct au client. Gateway ne s'enregistre pas dans son propre registry.

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

```
POST   /api/spe/registry                                          — enregistre instance (réponse contient instanceId)
DELETE /api/spe/registry/{serviceCode}/instances/{instanceId}     — désenregistre instance (@PreDestroy)
DELETE /api/spe/registry/{serviceCode}                            — purge tout le pool (admin)
GET    /api/spe/registry
GET    /api/spe/registry/grouped
GET    /api/spe/registry/{code}/instances
GET    /api/spe/status                                            — public: instanceCount, healthyInstances, instances[]
GET    /api/spe/auth/login                                        — login + JWT mint
```

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

---

## Frontend chip

`GET /api/spe/status` remonte `instanceCount`, `healthyInstances`, + tableau `instances[]` avec id/version/healthy/age/failures par instance. Chip frontend affiche `X/Y svc · X/Y inst`.
