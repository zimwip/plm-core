package com.plm.admin;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;NON_KEYWORDS=VALUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.flyway.enabled=true",
    "spring.config.import=",
    "plm.service.secret=test-secret-at-least-32-bytes-long-for-hs256",
    "management.tracing.enabled=false",
    "spe.registration.enabled=false"
})
class PsmAdminApplicationTest {

    @Test
    void contextLoads() {
        // Verifies the Spring context starts successfully
    }
}
