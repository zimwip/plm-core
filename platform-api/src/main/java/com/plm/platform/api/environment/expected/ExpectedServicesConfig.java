package com.plm.platform.api.environment.expected;

import com.plm.platform.nats.PlmMessageBus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * In-memory list of expected service codes. Initialized from
 * {@code platform.expected-services} (comma-separated). Mutations publish
 * {@code env.global.EXPECTED_SERVICES_CHANGED} so spe-api can react.
 *
 * <p>Baseline services {@code pno}, {@code platform}, {@code spe} cannot
 * be removed — the cluster always requires them. {@code spe} (the gateway)
 * never appears in the registry as a target since it does not self-register;
 * status synthesises its entry from the fact a request reached the gateway.
 */
@Slf4j
@Component
public class ExpectedServicesConfig {

    public static final Set<String> BASELINE = Set.of("pno", "platform", "spe");

    private final CopyOnWriteArrayList<String> expected;
    private final AtomicLong revision = new AtomicLong(0);
    private final ObjectProvider<PlmMessageBus> messageBusProvider;

    public ExpectedServicesConfig(@Value("${platform.expected-services:}") String csv,
                                  ObjectProvider<PlmMessageBus> messageBusProvider) {
        this.messageBusProvider = messageBusProvider;
        List<String> initial = (csv == null || csv.isBlank())
            ? List.of()
            : Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        this.expected = new CopyOnWriteArrayList<>(initial);
        for (String baseline : BASELINE) {
            expected.addIfAbsent(baseline);
        }
    }

    public List<String> getExpected() {
        return List.copyOf(expected);
    }

    public void setExpected(List<String> codes) {
        expected.clear();
        expected.addAll(codes);
        for (String baseline : BASELINE) {
            expected.addIfAbsent(baseline);
        }
        publishChange();
    }

    public boolean addService(String code) {
        boolean added = expected.addIfAbsent(code);
        if (added) publishChange();
        return added;
    }

    public boolean removeService(String code) {
        if (BASELINE.contains(code)) return false;
        boolean removed = expected.remove(code);
        if (removed) publishChange();
        return removed;
    }

    public long revision() {
        return revision.get();
    }

    private void publishChange() {
        long rev = revision.incrementAndGet();
        PlmMessageBus bus = messageBusProvider.getIfAvailable();
        if (bus == null) return;
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("revision", rev);
            payload.put("changedAt", Instant.now().toString());
            payload.put("expectedServices", getExpected());
            bus.sendGlobal("EXPECTED_SERVICES_CHANGED", payload);
        } catch (Exception e) {
            log.warn("Failed to publish EXPECTED_SERVICES_CHANGED: {}", e.getMessage());
        }
    }
}
