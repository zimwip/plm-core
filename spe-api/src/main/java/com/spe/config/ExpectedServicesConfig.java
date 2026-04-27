package com.spe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * In-memory store for expected service codes.
 * Initialized from the {@code spe.expected-services} property (comma-separated).
 * When the list is empty, StatusController treats all registered services as expected.
 * Changes are lost on restart (no database in spe-api).
 * <p>
 * Baseline services (pno, platform) cannot be removed —
 * they are core infrastructure the platform always requires.
 * spe-api is the gateway itself and never self-registers, so it is
 * not part of the baseline.
 */
@Component
public class ExpectedServicesConfig {

    /** Core infrastructure services that cannot be removed from the expected list. */
    public static final Set<String> BASELINE = Set.of("pno", "platform");

    private final CopyOnWriteArrayList<String> expected;

    public ExpectedServicesConfig(@Value("${spe.expected-services:}") String csv) {
        List<String> initial = (csv == null || csv.isBlank())
                ? List.of()
                : Arrays.stream(csv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
        this.expected = new CopyOnWriteArrayList<>(initial);
        // Ensure baseline services are always present
        for (String baseline : BASELINE) {
            expected.addIfAbsent(baseline);
        }
    }

    /** Returns an immutable snapshot of the current expected-services list. */
    public List<String> getExpected() {
        return List.copyOf(expected);
    }

    /** Replaces the entire list. Baseline services are always re-added. */
    public void setExpected(List<String> codes) {
        expected.clear();
        expected.addAll(codes);
        for (String baseline : BASELINE) {
            expected.addIfAbsent(baseline);
        }
    }

    /** Adds a service code if not already present. Returns true if added. */
    public boolean addService(String code) {
        return expected.addIfAbsent(code);
    }

    /** Removes a service code. Baseline services cannot be removed. Returns true if it was present and removed. */
    public boolean removeService(String code) {
        if (BASELINE.contains(code)) {
            return false;
        }
        return expected.remove(code);
    }
}
