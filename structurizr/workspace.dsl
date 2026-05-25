workspace "PLM Core" "Product Lifecycle Management microservice platform" {

    model {

        user = person "PLM User" "Product engineer, designer, or manager using the PLM system via browser"

        plmSystem = softwareSystem "PLM Core" "Manages product structure, CAD data, lifecycle, versions, and team access" {

            frontend = container "Frontend" "React 18 SPA served by nginx. Single entry point for all browser traffic." "React 18 + nginx :3000" {
                tags "Frontend"
            }

            speApi = container "spe-api" "API gateway: terminates TLS, validates JWT, round-robin load-balances to healthy service instances. Sole external entry point." "Spring Boot 3.2 :8082" {
                tags "Gateway"
            }

            pnoApi = container "pno-api" "Identity and organisation: users, roles, project spaces. Source of truth for all access-control decisions." "Spring Boot 3.2 :8081"

            psmAdmin = container "psm-admin (psa)" "Metamodel config source of truth: node types, lifecycles, attribute definitions. Publishes CONFIG_CHANGED events." "Spring Boot 3.2 :8083"

            psmApi1 = container "psm-api-1" "Product structure: nodes, versions, check-in/out, signatures, baselines, transitions. Replica 1 (Spring Modulith)." "Spring Boot + Modulith :8080"

            psmApi2 = container "psm-api-2" "Product structure: nodes, versions, check-in/out, signatures, baselines, transitions. Replica 2 (Spring Modulith)." "Spring Boot + Modulith :8080"

            platformApi = container "platform-api" "Central aggregator: settings sections, algorithm/action catalog, Vault admin. No DB of its own for settings." "Spring Boot 3.2 :8084"

            wsGateway = container "ws-gateway" "Unidirectional push relay: NATS events → client WebSocket sessions. Scoped per session token." "Spring Boot 3.2 :8085"

            dst = container "dst" "Binary blob store: SHA-256 addressed, full audit log, presigned S3 URLs for direct browser download." "Spring Boot 3.2 :8086"

            cadApi = container "cad-api" "CAD ingestion: accepts STEP/CATIA uploads, drives PSM node creation via import-context algorithm." "Spring Boot 3.2 :8087"

            cadParser = container "cad-parser" "STEP/CATIA parser sidecar. Converts binary CAD files to a JSON assembly tree." "Node.js + OpenCascade :8090" {
                tags "Sidecar"
            }

            searchApi = container "search-api" "Graph search: full-text and attribute indexing over PSM nodes." "Spring Boot 3.2 :8088"

            postgres = container "PostgreSQL" "Relational store. Each service owns a dedicated schema (pno, psm, psm_admin, dst, cad, platform)." "PostgreSQL 16 :5432" {
                tags "Database"
            }

            nats = container "NATS" "Pub/sub message bus. Topics: CONFIG_CHANGED, SETTINGS_CHANGED, PLM domain events relayed to WebSocket clients." "NATS 2.10 :4222" {
                tags "Messaging"
            }

            vault = container "HashiCorp Vault" "Secret store: PLM service secret, JWT signing keys, DB passwords. Resolved at boot via Spring Cloud Vault." "Vault 1.17 :8200" {
                tags "Security"
            }

            jaeger = container "Jaeger" "Distributed tracing: OTLP/HTTP collector + trace UI. All services push spans here." "Jaeger 1.62 :16686" {
                tags "Observability"
            }

            garage = container "Garage S3" "S3-compatible object store for CAD and binary blobs. Presigned URLs signed by dst are valid directly from the browser." "Garage v2.1 :3900" {
                tags "Storage"
            }
        }

        # ── User → Frontend ───────────────────────────────────────────────
        user -> frontend "Opens in browser" "HTTPS"

        # ── Frontend → Gateway (all traffic) ─────────────────────────────
        frontend -> speApi "All /api/* requests" "HTTP"
        frontend -> garage "Presigned blob download via /plm-dst/ nginx proxy" "HTTP"

        # ── Gateway → backend services ────────────────────────────────────
        speApi -> pnoApi     "svc://pno  — identity / RBAC queries"            "HTTP"
        speApi -> psmAdmin   "svc://psa  — metamodel CRUD"                     "HTTP"
        speApi -> psmApi1    "svc://psm  — round-robin replica 1"              "HTTP"
        speApi -> psmApi2    "svc://psm  — round-robin replica 2"              "HTTP"
        speApi -> platformApi "svc://platform — settings, algorithms"          "HTTP"
        speApi -> wsGateway  "svc://ws   — WebSocket upgrade"                  "WebSocket"
        speApi -> dst        "svc://dst  — binary upload / download"           "HTTP"
        speApi -> cadApi     "svc://cad  — CAD ingestion"                      "HTTP"
        speApi -> searchApi  "svc://search — full-text search"                 "HTTP"

        # ── Service → Platform (settings + algorithm registration) ────────
        pnoApi    -> platformApi "Register settings sections"                           "HTTP /internal"
        psmAdmin  -> platformApi "Register settings sections + config snapshots"        "HTTP /internal"
        psmApi1   -> platformApi "Register settings sections + algorithm catalog"       "HTTP /internal"
        psmApi2   -> platformApi "Register settings sections + algorithm catalog"       "HTTP /internal"
        dst       -> platformApi "Register settings sections"                           "HTTP /internal"
        cadApi    -> platformApi "Register settings sections"                           "HTTP /internal"
        searchApi -> platformApi "Register settings sections"                           "HTTP /internal"

        # ── Service internals ─────────────────────────────────────────────
        psmApi1 -> cadApi    "Trigger CAD parse for attached file"  "HTTP /internal"
        psmApi2 -> cadApi    "Trigger CAD parse for attached file"  "HTTP /internal"
        cadApi  -> cadParser "Parse STEP / CATIA binary"            "HTTP"
        dst     -> garage    "Store and retrieve binary blobs"       "S3 API"

        # ── NATS pub/sub ──────────────────────────────────────────────────
        psmAdmin  -> nats "Publish CONFIG_CHANGED"                   "NATS"
        psmApi1   -> nats "Subscribe CONFIG_CHANGED; publish events" "NATS"
        psmApi2   -> nats "Subscribe CONFIG_CHANGED; publish events" "NATS"
        wsGateway -> nats "Subscribe all events → push to clients"   "NATS"
        platformApi -> nats "Publish SETTINGS_CHANGED"               "NATS"

        # ── Persistence (schema per service) ─────────────────────────────
        pnoApi     -> postgres "Schema: pno"       "JOOQ / JDBC"
        psmAdmin   -> postgres "Schema: psm_admin" "JOOQ / JDBC"
        psmApi1    -> postgres "Schema: psm"       "JOOQ / JDBC"
        psmApi2    -> postgres "Schema: psm"       "JOOQ / JDBC"
        platformApi -> postgres "Schema: platform" "JOOQ / JDBC"
        dst        -> postgres "Schema: dst"       "JOOQ / JDBC"
        cadApi     -> postgres "Schema: cad"       "JOOQ / JDBC"

        # ── Vault (secrets resolved at boot) ─────────────────────────────
        speApi     -> vault "Resolve PLM_SERVICE_SECRET, JWT keys" "HTTP"
        pnoApi     -> vault "Resolve secrets at boot"              "HTTP"
        psmAdmin   -> vault "Resolve secrets at boot"              "HTTP"
        psmApi1    -> vault "Resolve secrets at boot"              "HTTP"
        psmApi2    -> vault "Resolve secrets at boot"              "HTTP"
        platformApi -> vault "Resolve secrets + Vault admin CRUD"  "HTTP"
        dst        -> vault "Resolve secrets at boot"              "HTTP"
        cadApi     -> vault "Resolve secrets at boot"              "HTTP"
        wsGateway  -> vault "Resolve secrets at boot"              "HTTP"

        # ── Tracing ───────────────────────────────────────────────────────
        speApi     -> jaeger "OTLP spans" "HTTP :4318"
        pnoApi     -> jaeger "OTLP spans" "HTTP :4318"
        psmAdmin   -> jaeger "OTLP spans" "HTTP :4318"
        psmApi1    -> jaeger "OTLP spans" "HTTP :4318"
        psmApi2    -> jaeger "OTLP spans" "HTTP :4318"
        platformApi -> jaeger "OTLP spans" "HTTP :4318"
        dst        -> jaeger "OTLP spans" "HTTP :4318"
        cadApi     -> jaeger "OTLP spans" "HTTP :4318"
        wsGateway  -> jaeger "OTLP spans" "HTTP :4318"
        searchApi  -> jaeger "OTLP spans" "HTTP :4318"
    }

    views {

        systemContext plmSystem "SystemContext" "PLM Core in its environment" {
            include *
            autoLayout lr
        }

        container plmSystem "Containers" "All containers inside PLM Core" {
            include *
            autoLayout lr
        }

        styles {
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "Software System" {
                background #1168BD
                color #ffffff
            }
            element "Container" {
                background #438DD5
                color #ffffff
            }
            element "Frontend" {
                shape WebBrowser
                background #1168BD
                color #ffffff
            }
            element "Gateway" {
                background #85BBF0
                color #000000
            }
            element "Sidecar" {
                background #6B9E6B
                color #ffffff
            }
            element "Database" {
                shape Cylinder
                background #438DD5
                color #ffffff
            }
            element "Messaging" {
                shape Pipe
                background #70AD46
                color #000000
            }
            element "Security" {
                background #B46747
                color #ffffff
            }
            element "Observability" {
                background #999999
                color #ffffff
            }
            element "Storage" {
                shape Cylinder
                background #C7622B
                color #ffffff
            }
        }
    }
}
