package com.plm.domain.algorithm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Validates DB ↔ Spring bean consistency at startup.
 *
 * For each {@code algorithm} row in DB, checks that a matching {@link AlgorithmBean}
 * exists in the Spring context. Logs errors for missing beans and warnings for
 * unregistered beans.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AlgorithmStartupValidator {

    private final DSLContext        dsl;
    private final AlgorithmRegistry registry;

    @EventListener(ApplicationReadyEvent.class)
    public void validate() {
        List<Record> dbAlgorithms = dsl.select().from("algorithm").fetch();
        Set<String> dbCodes = new HashSet<>();
        int errors = 0;

        for (Record row : dbAlgorithms) {
            String code = row.get("code", String.class);
            String name = row.get("name", String.class);
            dbCodes.add(code);

            if (!registry.hasBean(code)) {
                log.error("Algorithm '{}' ({}) is registered in DB but has no matching @AlgorithmBean Spring bean", code, name);
                errors++;
            }
        }

        // Reverse check: beans not in DB
        for (String beanCode : registry.getAllBeans().keySet()) {
            if (!dbCodes.contains(beanCode)) {
                log.warn("@AlgorithmBean '{}' exists in Spring context but is not registered in algorithm table", beanCode);
            }
        }

        if (errors > 0) {
            log.error("Algorithm validation: {} DB algorithms have no matching Spring bean — guards will fail at runtime", errors);
        } else {
            log.info("Algorithm validation: all {} DB algorithms have matching Spring beans", dbAlgorithms.size());
        }
    }
}
