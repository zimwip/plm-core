---
name: docker-test
description: Run Maven tests in the correct Docker container for a PLM service module. Accepts a module name as argument.
disable-model-invocation: true
---

Run Maven tests for a PLM service inside its Docker container.

Container-to-module mapping:
| Module       | Container name  |
|--------------|-----------------|
| psm-api      | plm-backend     |
| pno-api      | pno-api         |
| psm-admin    | psm-admin       |
| spe-api      | spe-api         |
| platform-api | platform-api    |
| ws-gateway   | ws-gateway      |
| cad-api      | cad-api         |

Command pattern:
```
docker exec <container> mvn test -f /app/pom.xml
```

To run a specific test class:
```
docker exec <container> mvn test -f /app/pom.xml -Dtest=MyTest
```

IMPORTANT: Never run `mvn` directly on the host — host has no JDK compiler, only JRE.
