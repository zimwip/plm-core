package com.plm.platform.api.environment;

import com.plm.platform.nats.PlmMessageBus;
import com.plm.platform.spe.dto.RegistrySnapshot;
import com.plm.platform.spe.dto.ServiceInstanceInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Central source of truth for the cluster service catalog.
 *
 * <p>Each {@code serviceCode} maps to a pool of {@link ServiceRegistration}
 * entries. Mutations bump a monotonic {@code revision} and publish
 * {@code env.global.ENVIRONMENT_CHANGED} on NATS so consumers (spe-api
 * gateway, every other service via platform-lib) can pull the new snapshot.
 *
 * <p>State is in-memory only: on platform-api restart, every service
 * re-registers within seconds (triggered by {@code PLATFORM_RESTARTED}
 * notification or scheduled re-register). Out of scope: horizontal scaling
 * of platform-api itself — would require Redis/Postgres backing.
 */
@Slf4j
@Component
public class EnvironmentRegistry {

    private final ConcurrentHashMap<String, ConcurrentHashMap<String, ServiceRegistration>> byService = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicInteger> counters = new ConcurrentHashMap<>();
    private final AtomicLong revision = new AtomicLong(0);
    private final ObjectProvider<PlmMessageBus> messageBusProvider;
    private final ObjectProvider<EnvironmentMirror> mirrorProvider;

    public EnvironmentRegistry(ObjectProvider<PlmMessageBus> messageBusProvider,
                               ObjectProvider<EnvironmentMirror> mirrorProvider) {
        this.messageBusProvider = messageBusProvider;
        this.mirrorProvider = mirrorProvider;
    }

    static String deriveInstanceId(String baseUrl) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-1")
                .digest(baseUrl.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, 10);
        } catch (Exception e) {
            return Integer.toHexString(baseUrl.hashCode());
        }
    }

    public ServiceRegistration register(String serviceCode,
                                        String baseUrl,
                                        String healthUrl,
                                        String routePrefix,
                                        List<String> extraPaths,
                                        String version,
                                        String spaceTag) {
        Instant now = Instant.now();
        String instanceId = deriveInstanceId(baseUrl);
        String tag = (spaceTag != null && !spaceTag.isBlank()) ? spaceTag.trim() : null;
        ServiceRegistration reg = new ServiceRegistration(
            instanceId, serviceCode, baseUrl, healthUrl, routePrefix,
            extraPaths == null ? List.of() : List.copyOf(extraPaths),
            version != null ? version : "unknown",
            now, now, 0, tag
        );

        ConcurrentHashMap<String, ServiceRegistration> pool =
            byService.computeIfAbsent(serviceCode, k -> new ConcurrentHashMap<>());
        ServiceRegistration prev = pool.put(instanceId, reg);
        if (prev == null) {
            log.info("Instance registered: {}/{} v{} -> {}", serviceCode, instanceId, reg.version(), baseUrl);
        } else {
            log.debug("Instance re-registered: {}/{} v{} -> {}", serviceCode, instanceId, reg.version(), baseUrl);
        }
        publishChange();
        return reg;
    }

    public boolean deregisterInstance(String serviceCode, String instanceId, String reason) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null) return false;
        ServiceRegistration removed = pool.remove(instanceId);
        if (removed == null) return false;
        log.info("Instance removed: {}/{} ({})", serviceCode, instanceId, reason);
        if (pool.isEmpty()) {
            byService.remove(serviceCode);
            counters.remove(serviceCode);
            log.info("Service disappeared: {} (no instances remain)", serviceCode);
        }
        publishChange();
        return true;
    }

    public int deregisterService(String serviceCode) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.remove(serviceCode);
        if (pool == null) return 0;
        counters.remove(serviceCode);
        int count = pool.size();
        log.info("Service deregistered: {} ({} instances removed)", serviceCode, count);
        publishChange();
        return count;
    }

    public Optional<ServiceRegistration> pickInstance(String serviceCode) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null || pool.isEmpty()) return Optional.empty();
        List<ServiceRegistration> healthy = new ArrayList<>(pool.size());
        for (ServiceRegistration reg : pool.values()) {
            if (reg.consecutiveFailures() == 0) healthy.add(reg);
        }
        List<ServiceRegistration> base = healthy.isEmpty() ? new ArrayList<>(pool.values()) : healthy;
        AtomicInteger counter = counters.computeIfAbsent(serviceCode, k -> new AtomicInteger());
        int idx = Math.floorMod(counter.getAndIncrement(), base.size());
        return Optional.of(base.get(idx));
    }

    public Map<String, List<String>> tagsByService() {
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (var entry : byService.entrySet()) {
            List<String> tags = new ArrayList<>();
            for (ServiceRegistration reg : entry.getValue().values()) {
                if (!reg.isUntagged() && !tags.contains(reg.spaceTag())) {
                    tags.add(reg.spaceTag());
                }
            }
            tags.sort(String::compareTo);
            result.put(entry.getKey(), tags);
        }
        return result;
    }

    public Collection<ServiceRegistration> instancesOf(String serviceCode) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        return pool == null ? List.of() : List.copyOf(pool.values());
    }

    public Set<String> serviceCodes() {
        return Set.copyOf(byService.keySet());
    }

    public Map<String, Collection<ServiceRegistration>> allInstancesByService() {
        Map<String, Collection<ServiceRegistration>> out = new LinkedHashMap<>();
        for (var e : byService.entrySet()) {
            out.put(e.getKey(), List.copyOf(e.getValue().values()));
        }
        return out;
    }

    public Collection<ServiceRegistration> allInstances() {
        List<ServiceRegistration> out = new ArrayList<>();
        for (var pool : byService.values()) out.addAll(pool.values());
        return out;
    }

    public void markHeartbeat(String serviceCode, String instanceId, boolean ok) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null) return;
        boolean[] healthChanged = { false };
        pool.computeIfPresent(instanceId, (k, reg) -> {
            boolean wasHealthy = reg.consecutiveFailures() == 0;
            int failures = ok ? 0 : reg.consecutiveFailures() + 1;
            Instant last = ok ? Instant.now() : reg.lastHeartbeatOk();
            ServiceRegistration updated = reg.withHeartbeat(last, failures);
            boolean isHealthy = failures == 0;
            if (wasHealthy != isHealthy) healthChanged[0] = true;
            return updated;
        });
        if (healthChanged[0]) publishChange();
    }

    public Optional<ServiceRegistration> getInstance(String serviceCode, String instanceId) {
        ConcurrentHashMap<String, ServiceRegistration> pool = byService.get(serviceCode);
        if (pool == null) return Optional.empty();
        return Optional.ofNullable(pool.get(instanceId));
    }

    public RegistrySnapshot buildSnapshot() {
        Map<String, List<ServiceInstanceInfo>> services = new LinkedHashMap<>();
        for (var entry : allInstancesByService().entrySet()) {
            services.put(entry.getKey(), entry.getValue().stream()
                .map(r -> new ServiceInstanceInfo(
                    r.instanceId(), r.serviceCode(), r.baseUrl(),
                    r.version(), r.spaceTag(), r.consecutiveFailures() == 0))
                .toList());
        }
        return new RegistrySnapshot(revision.get(), services);
    }

    public long revision() {
        return revision.get();
    }

    private void publishChange() {
        long rev = revision.incrementAndGet();
        EnvironmentMirror mirror = mirrorProvider.getIfAvailable();
        if (mirror != null) mirror.refresh();
        PlmMessageBus bus = messageBusProvider.getIfAvailable();
        if (bus == null) return;
        try {
            bus.sendGlobal("ENVIRONMENT_CHANGED", Map.of(
                "revision", rev,
                "changedAt", Instant.now().toString()
            ));
        } catch (Exception e) {
            log.warn("Failed to publish ENVIRONMENT_CHANGED: {}", e.getMessage());
        }
    }
}
